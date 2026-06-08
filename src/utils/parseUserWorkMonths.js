import { formatCellValue, isPlaceholderCell } from './formatCellValue';
import { isKnownMonthName, resolveSequentialMonthName } from './translateMonthName';

const SKIP_ROW_LABELS = new Set(['ԸՆԴՀ', 'ծախս', 'կետ', 'Hos']);

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

export function findWorkerForLogin(workers, loginName, loginPassword) {
  const name = String(loginName || '').trim();
  const password = String(loginPassword || '').trim();

  if (!name || !password) {
    return { ok: false, reason: 'empty' };
  }

  if (!Array.isArray(workers) || workers.length === 0) {
    return { ok: false, reason: 'no_data' };
  }

  const normalizedInput = normalizeName(name);
  const user = workers.find((worker) => normalizeName(worker.name) === normalizedInput);

  if (!user) {
    return { ok: false, reason: 'not_found' };
  }

  if (user.password !== password) {
    return { ok: false, reason: 'wrong_password' };
  }

  return { ok: true, user };
}

function hasDayOneTwoSequence(row) {
  for (let col = 1; col < row.length; col += 1) {
    if (row[col] !== 1 && row[col] !== '1') continue;

    for (let next = col + 1; next < Math.min(col + 4, row.length); next += 1) {
      const value = row[next];
      if (value === '' || value === null || value === undefined) continue;
      if (value === 2 || value === '2') return true;
      break;
    }
  }

  return false;
}

function isMonthHeaderRow(row) {
  if (!hasDayOneTwoSequence(row)) return false;

  const month = formatCellValue(row[0]);
  if (month && SKIP_ROW_LABELS.has(month)) return false;
  if (month && /^\d+$/.test(month)) return false;

  // Money section headers often leave column A empty but still list day numbers.
  if (!month) return true;

  return isKnownMonthName(month);
}

function findDayColumnStart(headerRow) {
  for (let col = 1; col < headerRow.length; col += 1) {
    if (headerRow[col] === 1 || headerRow[col] === '1') return col;
  }
  return 3;
}

function extractDayColumns(headerRow) {
  const dayColStart = findDayColumnStart(headerRow);
  const dayColumns = [];
  let expected = 1;

  for (let col = dayColStart; col < headerRow.length && expected <= 31; col += 1) {
    const value = headerRow[col];
    if (value === '' || value === null || value === undefined) continue;

    const num = Number(String(value).replace(',', '.'));
    if (num === expected) {
      dayColumns.push(col);
      expected += 1;
    } else {
      break;
    }
  }

  return {
    days: dayColumns.map((_, index) => index + 1),
    dayColStart,
    dayColumns,
  };
}

function extractDayValues(row, dayColumns) {
  return dayColumns.map((col) => {
    const value = row[col];
    if (isPlaceholderCell(value)) return '';
    return formatCellValue(value);
  });
}

function extractHoursTotal(row) {
  const value = row?.[2];
  const text = formatCellValue(value);
  if (!text || isPlaceholderCell(value)) return '';
  return text;
}

function alignDayValues(values, dayCount) {
  if (values.length === dayCount) return values;
  if (values.length > dayCount) return values.slice(0, dayCount);
  return [...values, ...Array.from({ length: dayCount - values.length }, () => '')];
}

function findMonthHeaderRows(rows) {
  const headerRows = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    if (isMonthHeaderRow(rows[rowIndex])) {
      headerRows.push(rowIndex);
    }
  }
  return headerRows;
}

function findUserRow(rows, startIndex, endIndex, userName) {
  const targetName = normalizeName(userName);
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    if (normalizeName(rows[rowIndex]?.[0]) === targetName) {
      return rows[rowIndex];
    }
  }
  return null;
}

function isHoursUserRow(row) {
  if (isMonthHeaderRow(row)) return false;

  const name = formatCellValue(row[0]);
  if (!name || SKIP_ROW_LABELS.has(name)) return false;

  const rate = row[1];
  if (rate === '' || rate === null || rate === undefined) return false;

  const numericRate = Number(String(rate).replace(',', '.'));
  return !Number.isNaN(numericRate);
}

export function extractWorkersFromSheet(rows) {
  if (!Array.isArray(rows)) return [];

  const headerRows = findMonthHeaderRows(rows);
  const seenNames = new Set();
  const workers = [];
  let nextId = 1;

  for (let index = 0; index < headerRows.length; index += 2) {
    const hoursHeaderIndex = headerRows[index];
    const moneyHeaderIndex = headerRows[index + 1];
    if (moneyHeaderIndex === undefined) break;

    for (let rowIndex = hoursHeaderIndex + 1; rowIndex < moneyHeaderIndex; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!isHoursUserRow(row)) continue;

      const name = formatCellValue(row[0]);
      const normalized = normalizeName(name);
      if (seenNames.has(normalized)) continue;

      seenNames.add(normalized);
      const rate = formatCellValue(row[1]);
      workers.push({
        id: nextId,
        name,
        password: `${name}${nextId}123`,
        otherData: rate ? [rate] : [],
      });
      nextId += 1;
    }
  }

  return workers;
}

function parseMonthBlocks(rows, userName) {
  const headerRows = findMonthHeaderRows(rows);
  const blocks = [];
  let previousMonth = '';

  for (let index = 0; index < headerRows.length; index += 2) {
    const hoursHeaderIndex = headerRows[index];
    const moneyHeaderIndex = headerRows[index + 1];
    const nextBlockStart = headerRows[index + 2] ?? rows.length;

    const hoursHeader = rows[hoursHeaderIndex];
    const { days, dayColumns } = extractDayColumns(hoursHeader);
    if (!days.length) continue;

    const moneyHeader = moneyHeaderIndex !== undefined ? rows[moneyHeaderIndex] : null;
    const moneyDayColumns = moneyHeader
      ? extractDayColumns(moneyHeader).dayColumns
      : dayColumns;
    const hoursEnd = moneyHeaderIndex ?? nextBlockStart;
    const hoursRow = findUserRow(rows, hoursHeaderIndex + 1, hoursEnd, userName);
    if (!hoursRow) continue;

    const moneyRow =
      moneyHeaderIndex !== undefined
        ? findUserRow(rows, moneyHeaderIndex + 1, nextBlockStart, userName)
        : null;

    const rawMonth =
      formatCellValue(hoursHeader[0]) || formatCellValue(moneyHeader?.[0]);
    const month = resolveSequentialMonthName(rawMonth, previousMonth);
    previousMonth = month;

    blocks.push({
      month,
      days,
      hours: alignDayValues(extractDayValues(hoursRow, dayColumns), days.length),
      hoursTotal: extractHoursTotal(hoursRow),
      amounts: moneyHeader
        ? alignDayValues(extractDayValues(moneyRow || [], moneyDayColumns), days.length)
        : Array.from({ length: days.length }, () => ''),
    });
  }

  return blocks;
}

export function parseUserWorkMonths(rows, userName) {
  if (!Array.isArray(rows) || !userName) return [];
  return parseMonthBlocks(rows, userName);
}
