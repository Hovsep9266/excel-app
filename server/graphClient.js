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

async function getWorksheetRange({ sheet, range }) {
  const driveId = process.env.EXCEL_DRIVE_ID;
  const itemId = process.env.EXCEL_ITEM_ID;
  const shareUrl = process.env.EXCEL_SHARE_URL;
  const safeSheet = encodeURIComponent(sheet);
  const safeRange = range.replace(/'/g, "''");
  let workbookPath = '';

  if (driveId && itemId) {
    workbookPath = `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(
      itemId
    )}/workbook`;
  } else if (shareUrl) {
    const shareId = toShareId(shareUrl);
    workbookPath = `/shares/${shareId}/driveItem/workbook`;
  } else {
    throw createGraphError(
      'Missing EXCEL_DRIVE_ID + EXCEL_ITEM_ID or EXCEL_SHARE_URL in server .env.',
      500,
      'GRAPH_CONFIG_MISSING'
    );
  }

  return graphGet(`${workbookPath}/worksheets/${safeSheet}/range(address='${safeRange}')`);
}

module.exports = { getWorksheetRange };
