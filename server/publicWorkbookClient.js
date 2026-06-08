const XLSX = require('xlsx');

function createPublicLinkError(message, statusCode = 500, code = 'PUBLIC_LINK_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizePublicFileUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.searchParams.has('download')) {
      parsed.searchParams.set('download', '1');
    }
    return parsed.toString();
  } catch (error) {
    return rawUrl;
  }
}

function getPublicFileUrl() {
  const rawUrl = process.env.EXCEL_PUBLIC_FILE_URL || process.env.EXCEL_SHARE_URL;
  if (!rawUrl) {
    throw createPublicLinkError(
      'Missing EXCEL_PUBLIC_FILE_URL (or EXCEL_SHARE_URL) for public link mode.',
      500,
      'PUBLIC_LINK_CONFIG_MISSING'
    );
  }
  return normalizePublicFileUrl(rawUrl);
}

async function fetchWorkbook() {
  const fileUrl = getPublicFileUrl();
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw createPublicLinkError(
      `Failed to fetch workbook by public link (HTTP ${response.status}).`,
      502,
      'PUBLIC_LINK_FETCH_FAILED'
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    return XLSX.read(buffer, { type: 'buffer' });
  } catch (error) {
    throw createPublicLinkError(
      'Downloaded content is not a valid .xlsx file. Check that your link points to the workbook file.',
      400,
      'PUBLIC_LINK_INVALID_FILE'
    );
  }
}

async function checkPublicWorkbookAccess() {
  await fetchWorkbook();
  return { ok: true };
}

function toMatrix(values) {
  const rows = values || [];
  const rowCount = rows.length;
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return { values: rows, rowCount, columnCount };
}

async function getWorksheetRangeFromPublicLink({ sheet, range }) {
  const workbook = await fetchWorkbook();
  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) {
    throw createPublicLinkError(
      `Worksheet "${sheet}" was not found in workbook.`,
      404,
      'PUBLIC_LINK_SHEET_NOT_FOUND'
    );
  }

  try {
    const values = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      range,
      blankrows: true,
      raw: false,
    });
    return toMatrix(values);
  } catch (error) {
    throw createPublicLinkError(
      `Invalid range "${range}" for worksheet "${sheet}".`,
      400,
      'PUBLIC_LINK_INVALID_RANGE'
    );
  }
}

module.exports = {
  checkPublicWorkbookAccess,
  getWorksheetRangeFromPublicLink,
};
