const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const { buildAuthorizeUrl, getAccessToken, getAuthStatus, handleAuthCallback } = require('./auth');
const { getWorksheetRange } = require('./graphClient');
const {
  checkLocalWorkbookAccess,
  getLocalWorkbookInfo,
  getWorksheetRangeFromLocalFile,
} = require('./localWorkbookClient');
const { checkPublicWorkbookAccess, getWorksheetRangeFromPublicLink } = require('./publicWorkbookClient');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
app.use(cors());
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

function getExcelSource() {
  if (process.env.EXCEL_SOURCE) {
    return process.env.EXCEL_SOURCE;
  }
  if (process.env.EXCEL_LOCAL_PATH) {
    return 'local_file';
  }
  return process.env.EXCEL_PUBLIC_FILE_URL ? 'public_link' : 'graph';
}

function isGraphSource() {
  return getExcelSource() === 'graph';
}

async function getRangeBySource({ sheet, range }) {
  const source = getExcelSource();
  if (source === 'graph') {
    return getWorksheetRange({ sheet, range });
  }
  if (source === 'public_link') {
    return getWorksheetRangeFromPublicLink({ sheet, range });
  }
  return getWorksheetRangeFromLocalFile({ sheet, range });
}

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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
    res.json({ ...getAuthStatus(), authRequired: true, source: getExcelSource() });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to read auth status'));
  }
});

app.get('/api/excel/health', async (req, res) => {
  try {
    const source = getExcelSource();
    if (source === 'graph') {
      await getAccessToken();
      res.json({ ok: true, source, graph: 'connected', auth: 'authenticated' });
    } else if (source === 'public_link') {
      await checkPublicWorkbookAccess();
      res.json({ ok: true, source, graph: 'not_used', auth: 'not_required' });
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
    if (source === 'local_file') {
      const info = await getLocalWorkbookInfo();
      return res.json({ ok: true, source, ...info });
    }
    return res.json({ ok: true, source });
  } catch (error) {
    return res.status(getStatusCode(error, 500)).json(buildErrorResponse(error, 'Failed to read source info'));
  }
});

app.get('/api/excel/range', async (req, res) => {
  const sheet = req.query.sheet || process.env.EXCEL_DEFAULT_SHEET || 'Sheet1';
  const range = req.query.range || process.env.EXCEL_DEFAULT_RANGE || 'A1:D20';
  const trimmedSheet = String(sheet).trim();
  const trimmedRange = String(range).trim();

  if (!trimmedSheet || !trimmedRange) {
    return res.status(400).json({
      ok: false,
      code: 'INVALID_QUERY',
      error: 'Both sheet and range must be non-empty values.',
    });
  }

  try {
    const response = await getRangeBySource({ sheet: trimmedSheet, range: trimmedRange });
    res.json({
      ok: true,
      source: getExcelSource(),
      sheet: trimmedSheet,
      range: trimmedRange,
      values: response.values || [],
      rowCount: response.rowCount || 0,
      columnCount: response.columnCount || 0,
    });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({
      ...buildErrorResponse(error, 'Failed to read Excel range'),
      sheet: trimmedSheet,
      range: trimmedRange,
    });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Excel API listening on http://localhost:${port}`);
});
