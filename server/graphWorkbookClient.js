const XLSX = require('xlsx');
const { getAccessToken } = require('./auth');

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

function createGraphError(message, statusCode = 500, code = 'GRAPH_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function toShareId(shareUrl) {
  const base64 = Buffer.from(shareUrl, 'utf8').toString('base64');
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `u!${base64Url}`;
}

function getWorkbookItemPath() {
  const driveId = process.env.EXCEL_DRIVE_ID;
  const itemId = process.env.EXCEL_ITEM_ID;
  const shareUrl = process.env.EXCEL_SHARE_URL;

  // Share link resolves correctly after login; resid from OneDrive URLs is not a Graph item id.
  if (shareUrl) {
    return `/shares/${toShareId(shareUrl)}/driveItem`;
  }
  if (driveId && itemId) {
    return `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
  }
  if (itemId) {
    return `/me/drive/items/${encodeURIComponent(itemId)}`;
  }

  throw createGraphError(
    'Missing EXCEL_ITEM_ID, EXCEL_DRIVE_ID + EXCEL_ITEM_ID, or EXCEL_SHARE_URL in server .env.',
    500,
    'GRAPH_CONFIG_MISSING'
  );
}

async function graphGet(path) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || 'Graph request failed';
    throw createGraphError(message, response.status || 502, 'GRAPH_REQUEST_FAILED');
  }

  return payload;
}

async function graphGetBinary(path) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    let message = `Graph download failed (HTTP ${response.status})`;
    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch (error) {
      // Ignore JSON parse errors for binary responses.
    }
    throw createGraphError(message, response.status || 502, 'GRAPH_DOWNLOAD_FAILED');
  }

  return Buffer.from(await response.arrayBuffer());
}

function toMatrix(values) {
  const rows = values || [];
  const rowCount = rows.length;
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return { values: rows, rowCount, columnCount };
}

async function readCloudWorkbookMeta() {
  const itemPath = getWorkbookItemPath();
  return graphGet(itemPath);
}

async function readCloudWorkbookBuffer() {
  const itemPath = getWorkbookItemPath();
  const [meta, buffer] = await Promise.all([
    graphGet(itemPath),
    graphGetBinary(`${itemPath}/content`),
  ]);
  return { meta, buffer };
}

async function checkGraphWorkbookAccess() {
  await readCloudWorkbookMeta();
  return { ok: true };
}

async function getWorksheetRangeFromGraphFile({ sheet, range }) {
  const { meta, buffer } = await readCloudWorkbookBuffer();

  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch (error) {
    throw createGraphError(
      'Downloaded OneDrive file is not a valid .xlsx workbook.',
      400,
      'GRAPH_INVALID_FILE'
    );
  }

  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) {
    throw createGraphError(`Worksheet "${sheet}" was not found in workbook.`, 404, 'GRAPH_SHEET_NOT_FOUND');
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
      filePath: meta.webUrl || meta.name || 'OneDrive',
    };
  } catch (error) {
    throw createGraphError(
      `Invalid range "${effectiveRange}" for worksheet "${sheet}".`,
      400,
      'GRAPH_INVALID_RANGE'
    );
  }
}

module.exports = {
  checkGraphWorkbookAccess,
  getWorksheetRangeFromGraphFile,
  readCloudWorkbookMeta,
};
