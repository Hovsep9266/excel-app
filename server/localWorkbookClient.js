const fs = require('fs/promises');
const path = require('path');
const XLSX = require('xlsx');

function createLocalError(message, statusCode = 500, code = 'LOCAL_FILE_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function getLocalWorkbookPath() {
  const workbookPath = process.env.EXCEL_LOCAL_PATH;
  if (!workbookPath) {
    throw createLocalError(
      'Missing EXCEL_LOCAL_PATH for local_file mode.',
      500,
      'LOCAL_FILE_CONFIG_MISSING'
    );
  }
  return workbookPath;
}

async function readLocalWorkbook() {
  const workbookPath = getLocalWorkbookPath();
  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(workbookPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createLocalError(
        `Workbook file was not found: ${workbookPath}`,
        404,
        'LOCAL_FILE_NOT_FOUND'
      );
    }
    throw createLocalError(
      `Cannot read workbook file: ${workbookPath}`,
      500,
      'LOCAL_FILE_READ_FAILED'
    );
  }

  try {
    return XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    throw createLocalError(
      `Workbook content is invalid or unsupported: ${path.basename(workbookPath)}`,
      400,
      'LOCAL_FILE_INVALID'
    );
  }
}

async function checkLocalWorkbookAccess() {
  await readLocalWorkbook();
  return { ok: true };
}

async function getLocalWorkbookInfo() {
  const workbookPath = getLocalWorkbookPath();
  let stats;
  try {
    stats = await fs.stat(workbookPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createLocalError(
        `Workbook file was not found: ${workbookPath}`,
        404,
        'LOCAL_FILE_NOT_FOUND'
      );
    }
    throw createLocalError(
      `Cannot access workbook file metadata: ${workbookPath}`,
      500,
      'LOCAL_FILE_STAT_FAILED'
    );
  }

  const workbook = await readLocalWorkbook();
  return {
    path: workbookPath,
    lastModifiedAt: stats.mtime.toISOString(),
    sizeBytes: stats.size,
    sheetNames: workbook.SheetNames || [],
  };
}

function toMatrix(values) {
  const rows = values || [];
  const rowCount = rows.length;
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return { values: rows, rowCount, columnCount };
}

async function getWorksheetRangeFromLocalFile({ sheet, range }) {
  const workbookPath = getLocalWorkbookPath();
  let fileBuffer;
  let stats;
  try {
    [fileBuffer, stats] = await Promise.all([
      fs.readFile(workbookPath),
      fs.stat(workbookPath),
    ]);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createLocalError(
        `Workbook file was not found: ${workbookPath}`,
        404,
        'LOCAL_FILE_NOT_FOUND'
      );
    }
    throw createLocalError(
      `Cannot read workbook file: ${workbookPath}`,
      500,
      'LOCAL_FILE_READ_FAILED'
    );
  }

  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    throw createLocalError(
      `Workbook content is invalid or unsupported: ${path.basename(workbookPath)}`,
      400,
      'LOCAL_FILE_INVALID'
    );
  }

  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) {
    throw createLocalError(`Worksheet "${sheet}" was not found in workbook.`, 404, 'LOCAL_SHEET_NOT_FOUND');
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
      fileLastModifiedAt: stats.mtime.toISOString(),
      filePath: workbookPath,
    };
  } catch (error) {
    throw createLocalError(`Invalid range "${effectiveRange}" for worksheet "${sheet}".`, 400, 'LOCAL_INVALID_RANGE');
  }
}

module.exports = {
  checkLocalWorkbookAccess,
  getLocalWorkbookInfo,
  getWorksheetRangeFromLocalFile,
};
