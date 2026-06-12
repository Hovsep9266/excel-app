const XLSX = require('xlsx');

const ONEDRIVE_API = 'https://api.onedrive.com/v1.0';

function createShareLinkError(message, statusCode = 500, code = 'SHARE_LINK_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeEnvUrl(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function getShareUrl() {
  return (
    normalizeEnvUrl(process.env.EXCEL_PUBLIC_FILE_URL) ||
    normalizeEnvUrl(process.env.EXCEL_SHARE_URL) ||
    ''
  );
}

function toShareToken(shareUrl) {
  const base64 = Buffer.from(shareUrl, 'utf8').toString('base64');
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `u!${base64Url}`;
}

function buildDownloadCandidates(shareUrl) {
  const candidates = [];
  const trimmed = shareUrl.trim();

  if (trimmed) {
    candidates.push({
      kind: 'share_api',
      metaUrl: `${ONEDRIVE_API}/shares/${toShareToken(trimmed)}/driveItem`,
      contentUrl: `${ONEDRIVE_API}/shares/${toShareToken(trimmed)}/driveItem/content`,
    });
  }

  try {
    const parsed = new URL(trimmed);
    const resid = parsed.searchParams.get('resid');
    const authkey = parsed.searchParams.get('authkey');
    const cid = parsed.searchParams.get('cid');

    if (resid && authkey) {
      const params = new URLSearchParams({ resid, authkey });
      if (cid) params.set('cid', cid);
      candidates.push({
        kind: 'download_authkey',
        contentUrl: `https://onedrive.live.com/download.aspx?${params.toString()}`,
      });
    }

    if (resid) {
      candidates.push({
        kind: 'download_resid',
        contentUrl: `https://onedrive.live.com/download?resid=${encodeURIComponent(resid)}`,
      });
    }
  } catch (error) {
    // Ignore invalid URLs.
  }

  return candidates;
}

async function resolveShortShareUrl(shareUrl) {
  if (!shareUrl.includes('1drv.ms')) {
    return shareUrl;
  }

  const response = await fetch(shareUrl, { redirect: 'follow' });
  return response.url || shareUrl;
}

async function fetchBinary(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*',
    },
  });

  if (!response.ok) {
    throw createShareLinkError(
      `OneDrive download failed (HTTP ${response.status}).`,
      response.status === 401 || response.status === 403 ? 401 : 502,
      'SHARE_LINK_FETCH_FAILED'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw createShareLinkError(
      'OneDrive returned a web page instead of the Excel file. Set sharing to "Anyone with the link can view" and copy the link again.',
      401,
      'SHARE_LINK_NOT_PUBLIC'
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

function toMatrix(values) {
  const rows = values || [];
  const rowCount = rows.length;
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return { values: rows, rowCount, columnCount };
}

async function readShareWorkbookBuffer() {
  const rawShareUrl = getShareUrl();
  if (!rawShareUrl) {
    throw createShareLinkError(
      'Missing EXCEL_SHARE_URL or EXCEL_PUBLIC_FILE_URL for online Excel.',
      500,
      'SHARE_LINK_CONFIG_MISSING'
    );
  }

  const shareUrl = await resolveShortShareUrl(rawShareUrl);
  const candidates = buildDownloadCandidates(shareUrl);
  let lastError;

  for (const candidate of candidates) {
    try {
      if (candidate.kind === 'share_api') {
        const metaResponse = await fetch(candidate.metaUrl);
        if (!metaResponse.ok) {
          throw createShareLinkError(
            `OneDrive share metadata failed (HTTP ${metaResponse.status}).`,
            metaResponse.status,
            'SHARE_LINK_META_FAILED'
          );
        }

        const meta = await metaResponse.json();
        const buffer = await fetchBinary(candidate.contentUrl);
        return { meta, buffer };
      }

      const buffer = await fetchBinary(candidate.contentUrl);
      return {
        meta: {
          name: 'OneDrive',
          lastModifiedDateTime: new Date().toISOString(),
          webUrl: shareUrl,
        },
        buffer,
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError?.code === 'SHARE_LINK_NOT_PUBLIC' || lastError?.statusCode === 401) {
    throw createShareLinkError(
      'Excel Online needs a public OneDrive link. Open the file on onedrive.live.com → Share → Anyone with the link can view → copy link to EXCEL_SHARE_URL in server/.env',
      401,
      'SHARE_LINK_SETUP_REQUIRED'
    );
  }

  throw lastError;
}

async function checkShareLinkWorkbookAccess() {
  await readShareWorkbookBuffer();
  return { ok: true };
}

async function getWorksheetRangeFromShareLink({ sheet, range }) {
  const { meta, buffer } = await readShareWorkbookBuffer();

  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch (error) {
    throw createShareLinkError(
      'Downloaded OneDrive file is not a valid .xlsx workbook.',
      400,
      'SHARE_LINK_INVALID_FILE'
    );
  }

  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) {
    throw createShareLinkError(`Worksheet "${sheet}" was not found in workbook.`, 404, 'SHARE_LINK_SHEET_NOT_FOUND');
  }

  const effectiveRange = String(range || '').trim() || worksheet['!ref'] || 'A1:AP1000';

  try {
    const values = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      range: effectiveRange,
      blankrows: true,
      raw: false,
    });
    return {
      ...toMatrix(values),
      range: effectiveRange,
      fileLastModifiedAt: meta.lastModifiedDateTime || '',
      filePath: meta.webUrl || meta.name || 'OneDrive Online',
    };
  } catch (error) {
    throw createShareLinkError(
      `Invalid range "${effectiveRange}" for worksheet "${sheet}".`,
      400,
      'SHARE_LINK_INVALID_RANGE'
    );
  }
}

module.exports = {
  checkShareLinkWorkbookAccess,
  getShareUrl,
  getWorksheetRangeFromShareLink,
};
