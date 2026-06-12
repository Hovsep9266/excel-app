const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  buildAuthorizeUrl,
  canAccessCloudWorkbook,
  getAuthStatus,
  handleAuthCallback,
  pollDeviceCodeLogin,
  startDeviceCodeLogin,
} = require('./auth');
const { checkGraphWorkbookAccess, getWorksheetRangeFromGraphFile } = require('./graphWorkbookClient');
const {
  checkLocalWorkbookAccess,
  getLocalWorkbookInfo,
  getWorksheetRangeFromLocalFile,
} = require('./localWorkbookClient');
const {
  getWorksheetRangeHybrid,
  hasLocalFileConfig,
  hasShareLinkConfig,
} = require('./hybridWorkbookClient');
const { checkPublicWorkbookAccess, getWorksheetRangeFromPublicLink } = require('./publicWorkbookClient');
const { checkShareLinkWorkbookAccess, getShareUrl } = require('./shareLinkWorkbookClient');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

function normalizeFrontendUrl() {
  const raw = String(process.env.FRONTEND_URL || '').trim().replace(/^['"]|['"]$/g, '');
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch (error) {
    return '';
  }
}

const app = express();
const buildPath = path.join(__dirname, '..', 'build');
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.SERVE_STATIC === 'true' ||
  fs.existsSync(path.join(buildPath, 'index.html'));
const servesFrontendFromSameServer = isProduction && fs.existsSync(path.join(buildPath, 'index.html'));

app.use(
  cors({
    origin: servesFrontendFromSameServer ? true : normalizeFrontendUrl() || true,
    credentials: false,
  })
);
app.use(express.json());

function buildErrorResponse(error, fallbackMessage) {
  return {
    ok: false,
    error: error.message || fallbackMessage,
    code: error.code || 'INTERNAL_ERROR',
  };
}

function getStatusCode(error, fallback = 500) {
  if (Number.isInteger(error.statusCode) && error.statusCode > 0) {
    return error.statusCode;
  }
  return fallback;
}

function hasCloudExcelConfig() {
  return Boolean(
    process.env.MS_CLIENT_ID &&
    (process.env.EXCEL_ITEM_ID || process.env.EXCEL_SHARE_URL || process.env.EXCEL_DRIVE_ID)
  );
}

function getExcelSource() {
  if (process.env.EXCEL_SOURCE) {
    return process.env.EXCEL_SOURCE;
  }
  if (process.env.EXCEL_LOCAL_PATH && (process.env.EXCEL_SHARE_URL || process.env.EXCEL_PUBLIC_FILE_URL || hasCloudExcelConfig())) {
    return 'hybrid';
  }
  if (process.env.EXCEL_LOCAL_PATH) {
    return 'local_file';
  }
  if (process.env.EXCEL_SHARE_URL || process.env.EXCEL_PUBLIC_FILE_URL) {
    return 'share_link';
  }
  return 'graph';
}

function isGraphSource() {
  const source = getExcelSource();
  return source === 'graph' || source === 'hybrid';
}

async function getRangeBySource({ sheet, range }) {
  const source = getExcelSource();
  if (source === 'hybrid') {
    return getWorksheetRangeHybrid({ sheet, range });
  }
  if (source === 'graph') {
    return getWorksheetRangeFromGraphFile({ sheet, range });
  }
  if (source === 'public_link' || source === 'share_link') {
    return getWorksheetRangeFromShareLink({ sheet, range });
  }
  return getWorksheetRangeFromLocalFile({ sheet, range });
}

app.post('/api/auth/device/start', async (req, res) => {
  try {
    const result = await startDeviceCodeLogin();
    res.json(result);
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to start device login'));
  }
});

app.get('/api/auth/device/poll', async (req, res) => {
  try {
    const result = await pollDeviceCodeLogin();
    res.json(result);
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Device login poll failed'));
  }
});

app.get('/ms-login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'ms-login.html'));
});

app.get('/api/auth/login-url', (req, res) => {
  if (!isGraphSource()) {
    return res.status(400).json({
      ok: false,
      code: 'AUTH_NOT_REQUIRED',
      error: 'Auth endpoints are only used in EXCEL_SOURCE=graph mode.',
    });
  }
  try {
    const url = buildAuthorizeUrl();
    res.json({ ok: true, url });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to build auth URL'));
  }
});

app.get('/api/auth/login', (req, res) => {
  if (!isGraphSource()) {
    return res.status(400).json({
      ok: false,
      code: 'AUTH_NOT_REQUIRED',
      error: 'Auth endpoints are only used in EXCEL_SOURCE=graph mode.',
    });
  }
  try {
    const url = buildAuthorizeUrl();
    res.redirect(url);
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to start login'));
  }
});

app.get('/api/auth/callback', async (req, res) => {
  if (!isGraphSource()) {
    return res.status(400).json({
      ok: false,
      code: 'AUTH_NOT_REQUIRED',
      error: 'Auth callback is only used in EXCEL_SOURCE=graph mode.',
    });
  }
  const frontendUrl = normalizeFrontendUrl() || `${req.protocol}://${req.get('host')}`;
  const { code, state, error: oauthError, error_description: errorDescription } = req.query;

  if (oauthError) {
    const message = errorDescription || oauthError;
    return res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(message)}`);
  }

  try {
    await handleAuthCallback({ code, state });
    return res.redirect(`${frontendUrl}/?auth=success`);
  } catch (error) {
    return res.redirect(
      `${frontendUrl}/?auth=error&message=${encodeURIComponent(error.message || 'Auth callback failed')}`
    );
  }
});

app.get('/api/auth/status', (req, res) => {
  if (!isGraphSource()) {
    return res.json({
      ok: true,
      authenticated: true,
      authRequired: false,
      source: getExcelSource(),
      account: null,
      expiresAt: 0,
    });
  }
  try {
    const status = getAuthStatus();
    res.json({
      ...status,
      authRequired: true,
      source: getExcelSource(),
      cloudConfigured: hasCloudExcelConfig(),
    });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to read auth status'));
  }
});

app.get('/api/excel/health', async (req, res) => {
  try {
    const source = getExcelSource();
    if (source === 'hybrid') {
      let localFileOk = false;
      let localFileError = '';
      if (hasLocalFileConfig()) {
        try {
          await checkLocalWorkbookAccess();
          localFileOk = true;
        } catch (error) {
          localFileError = error.message || 'Local file check failed';
        }
      }
      let shareLinkOk = false;
      let shareLinkError = '';
      if (hasShareLinkConfig()) {
        try {
          await checkShareLinkWorkbookAccess();
          shareLinkOk = true;
        } catch (error) {
          shareLinkError = error.message || 'Share link check failed';
        }
      }
      if (!localFileOk && !shareLinkOk) {
        throw new Error(shareLinkError || localFileError || 'No Excel source available');
      }
      res.json({
        ok: true,
        source,
        localFile: localFileOk ? 'ok' : hasLocalFileConfig() ? 'failed' : 'not_configured',
        localFileError: localFileError || undefined,
        shareLink: shareLinkOk ? 'ok' : hasShareLinkConfig() ? 'failed' : 'not_configured',
        shareLinkError: shareLinkError || undefined,
        onlineExcelReady: shareLinkOk,
      });
    } else if (source === 'graph') {
      await checkGraphWorkbookAccess();
      res.json({ ok: true, source, graph: 'connected', auth: 'authenticated' });
    } else if (source === 'public_link' || source === 'share_link') {
      await checkShareLinkWorkbookAccess();
      res.json({ ok: true, source, onlineExcelReady: true, auth: 'not_required' });
    } else {
      await checkLocalWorkbookAccess();
      res.json({ ok: true, source, graph: 'not_used', auth: 'not_required' });
    }
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Health check failed'));
  }
});

app.get('/api/excel', (req, res) => {
  const source = getExcelSource();
  res.json({
    ok: true,
    service: 'excel-api',
    source,
    authRequired: source === 'graph',
    endpoints: {
      health: '/api/excel/health',
      range: '/api/excel/range?sheet=Sheet1&range=A1:D20',
    },
  });
});

app.get('/api/excel/source', async (req, res) => {
  const source = getExcelSource();
  try {
    if (source === 'local_file' || source === 'hybrid') {
      let info = {};
      if (hasLocalFileConfig()) {
        try {
          info = await getLocalWorkbookInfo();
        } catch (error) {
          info.localFileError = error.message;
        }
      }
      let shareLinkOk = false;
      let shareLinkError = '';
      if (hasShareLinkConfig()) {
        try {
          await checkShareLinkWorkbookAccess();
          shareLinkOk = true;
        } catch (error) {
          shareLinkError = error.message || 'Share link failed';
        }
      }
      return res.json({
        ok: true,
        source,
        ...info,
        shareUrlConfigured: hasShareLinkConfig(),
        onlineExcelReady: shareLinkOk,
        shareLinkError: shareLinkError || undefined,
      });
    }
    return res.json({ ok: true, source, shareUrlConfigured: hasShareLinkConfig() });
  } catch (error) {
    return res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to read source info'));
  }
});

app.get('/api/excel/share-test', async (req, res) => {
  try {
    if (canAccessCloudWorkbook()) {
      await checkGraphWorkbookAccess();
      return res.json({
        ok: true,
        method: 'microsoft_login',
        message: 'OneDrive connected via Microsoft login. Excel Online will work.',
      });
    }
    if (!hasShareLinkConfig()) {
      return res.status(400).json({
        ok: false,
        code: 'ONEDRIVE_SETUP_REQUIRED',
        error:
          'Public OneDrive links no longer work for personal accounts. Open http://localhost:4000/ms-login and sign in with Microsoft once.',
        loginUrl: '/ms-login',
      });
    }
    await checkShareLinkWorkbookAccess();
    return res.json({
      ok: true,
      method: 'share_link',
      message: 'OneDrive share link works.',
      shareUrl: getShareUrl(),
    });
  } catch (error) {
    return res.status(getStatusCode(error, 401)).json({
      ...buildErrorResponse(error, 'OneDrive access failed'),
      hint: 'Open /ms-login and sign in with your Microsoft account (one time).',
      loginUrl: '/ms-login',
    });
  }
});

app.get('/api/excel/range', async (req, res) => {
  const sheet = req.query.sheet || process.env.EXCEL_DEFAULT_SHEET || 'Sheet1';
  const range = req.query.range || process.env.EXCEL_DEFAULT_RANGE || '';
  const trimmedSheet = String(sheet).trim();

  if (!trimmedSheet) {
    return res.status(400).json({
      ok: false,
      code: 'INVALID_QUERY',
      error: 'Sheet name must be a non-empty value.',
    });
  }

  try {
    const response = await getRangeBySource({ sheet: trimmedSheet, range: String(range).trim() });
    res.json({
      ok: true,
      source: getExcelSource(),
      sheet: trimmedSheet,
      range: response.range || String(range).trim(),
      values: response.values || [],
      rowCount: response.rowCount || 0,
      columnCount: response.columnCount || 0,
      ...(response.fileLastModifiedAt
        ? {
          fileLastModifiedAt: response.fileLastModifiedAt,
          filePath: response.filePath,
        }
        : {}),
      ...(response.sourceUsed ? { sourceUsed: response.sourceUsed } : {}),
    });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({
      ...buildErrorResponse(error, 'Failed to read Excel range'),
      sheet: trimmedSheet,
      range: String(range).trim(),
    });
  }
});

if (isProduction) {
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(
    `HydroAir Sistems ${isProduction ? 'production' : 'dev'} server on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`
  );
});
