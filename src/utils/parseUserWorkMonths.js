import { formatAmountTotal, formatCellValue, isPlaceholderCell, parseNumericCell, sumNumericCells } from './formatCellValue';
import {
  canonicalMonthName,
  getMonthIndex,
  isKnownMonthName,
  isSummaryMonth,
  resolveSequentialMonthName,
} from './translateMonthName';

const SKIP_ROW_LABELS = new Set(['ԸՆԴՀ', 'ծախս', 'կետ', 'Hos']);

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeDisplayName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeNameForMatch(value) {
  return normalizeName(value)
    .replace(/^բ\s+/, '')
    .replace(/իել/g, 'ել');
}

function buildWorkerPassword(name, id) {
  return `${normalizeNameForMatch(name)}${id}123`;
}

function matchesWorkerPassword(worker, password) {
  const trimmed = String(password || '').trim();
  if (!trimmed) return false;
  if (worker.password === trimmed) return true;

  const variants = new Set([
    buildWorkerPassword(worker.name, worker.id),
    `${worker.name}${worker.id}123`,
  ]);
  return variants.has(trimmed) || variants.has(normalizeName(trimmed));
}

function isNumericCode(value) {
  if (value === '' || value === null || value === undefined) return false;
  const numeric = Number(String(value).replace(',', '.'));
  return !Number.isNaN(numeric);
}

function isSectionLabel(value) {
  const text = String(value || '').trim();
  if (!text || text === 'Խումբ') return text === 'Խումբ';
  if (/^բ\s+[\u0530-\u058F]/u.test(text)) return false;
  return /^[\u0530-\u058F](\s+[\u0530-\u058F])+$/u.test(text);
}

function isGroupLabel(value) {
  const text = String(value || '').trim();
  if (!text || text === 'Խումբ') return false;
  if (isSectionLabel(text)) return true;
  if (text.length > 12 && /[\u0530-\u058F]/.test(text) && /\s/.test(text)) return true;
  return false;
}

function rowLooksLikeSummaryData(row, headerRow) {
  const name = getSummaryRowName(row);
  if (!name) return false;
  if (isSummaryUserRow(row)) return true;
  const { dayColumns } = extractDayColumns(headerRow);
  return rowHasSummaryValues(row, dayColumns);
}

function sortBlocksByMonth(blocks) {
  return [...blocks].sort(
    (left, right) => (getMonthIndex(left.month) ?? 99) - (getMonthIndex(right.month) ?? 99)
  );
}

function appendMissingSummaryMonthBlocks(rows, userName, blocks) {
  const seenMonths = new Set(blocks.map((block) => block.month));
  const seenMonthIndices = new Set(
    blocks
      .map((block) => getMonthIndex(canonicalMonthName(block.month)))
      .filter((index) => index !== undefined)
  );
  const headerRows = findMonthHeaderRows(rows);
  let previousMonth = '';

  for (let index = 0; index < headerRows.length; index += 1) {
    const headerIndex = headerRows[index];
    const endIndex = headerRows[index + 1] ?? rows.length;
    const rawMonth = getMonthLabelFromBlock(rows, headerIndex);
    if (rawMonth && isKnownMonthName(rawMonth)) {
      const rawIndex = getMonthIndex(canonicalMonthName(rawMonth));
      if (rawIndex !== undefined && seenMonthIndices.has(rawIndex)) continue;
    }
    const month = resolveBlockMonth(rawMonth, previousMonth);
    if (month) previousMonth = month;
    if (!isSummaryMonth(month)) continue;
    if (inferBlockLayout(rows, headerIndex, endIndex, month) !== 'summary') continue;
    if (seenMonths.has(month)) continue;

    const blockEnd = getSummaryBlockEndIndex(headerRows, index, rows, month);
    const block = parseSummaryMonthBlock(rows, headerIndex, blockEnd, userName, month);
    if (block) {
      blocks.push(block);
      seenMonths.add(month);
      const monthIndex = getMonthIndex(canonicalMonthName(month));
      if (monthIndex !== undefined) seenMonthIndices.add(monthIndex);
    }
  }

  return sortBlocksByMonth(blocks);
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

  const normalizedInput = normalizeNameForMatch(name);
  const user = workers.find((worker) => normalizeNameForMatch(worker.name) === normalizedInput);

  if (!user) {
    return { ok: false, reason: 'not_found' };
  }

  if (!matchesWorkerPassword(user, password)) {
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

function isMonthTitleCell(value) {
  return isKnownMonthName(value);
}

function isDaySequenceHeaderRow(row) {
  if (!hasDayOneTwoSequence(row)) return false;

  const nameInA = formatCellValue(row?.[0]);
  const nameInB = formatCellValue(row?.[1]);

  if (
    nameInA &&
    !SKIP_ROW_LABELS.has(nameInA) &&
    !isSectionLabel(nameInA) &&
    !isMonthTitleCell(nameInA) &&
    isNumericCode(row?.[1])
  ) {
    return false;
  }

  if (
    nameInB &&
    !SKIP_ROW_LABELS.has(nameInB) &&
    !isNumericCode(nameInB) &&
    nameInB !== 'Խումբ' &&
    !isMonthTitleCell(nameInB)
  ) {
    return false;
  }

  return extractDayColumns(row).days.length >= 3;
}

function isMonthHeaderRow(row) {
  if (!isDaySequenceHeaderRow(row)) return false;

  const month = formatCellValue(row[0]);
  if (month && SKIP_ROW_LABELS.has(month)) return false;
  if (month && /^\d+$/.test(month)) return false;
  if (month && isSectionLabel(month)) return false;

  return true;
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

function isHoursUserRow(row) {
  if (isMonthHeaderRow(row)) return false;

  const name = formatCellValue(row[0]);
  if (!name || SKIP_ROW_LABELS.has(name)) return false;

  const rate = row[1];
  if (rate === '' || rate === null || rate === undefined) return false;

  const numericRate = Number(String(rate).replace(',', '.'));
  return !Number.isNaN(numericRate);
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

function getMonthLabelFromBlock(rows, headerRowIndex) {
  const headerRow = rows[headerRowIndex];
  const direct = formatCellValue(headerRow?.[0]);
  if (isKnownMonthName(direct)) return direct;
  if (isSectionLabel(direct)) return '';

  for (let col = 0; col < Math.min(headerRow?.length || 0, 40); col += 1) {
    const value = formatCellValue(headerRow?.[col]);
    if (isKnownMonthName(value)) return value;
  }

  for (let rowIndex = headerRowIndex - 1; rowIndex >= 0; rowIndex -= 1) {
    const prevRow = rows[rowIndex];
    if (isDaySequenceHeaderRow(prevRow)) continue;

    for (let col = 0; col < Math.min(prevRow?.length || 0, 40); col += 1) {
      const value = formatCellValue(prevRow?.[col]);
      if (isKnownMonthName(value)) return value;
    }
  }

  return '';
}

function resolveBlockMonth(rawMonth, previousMonth) {
  const formatted = String(rawMonth || '').trim();
  if (!formatted) return canonicalMonthName(previousMonth) || previousMonth || '';
  if (!isKnownMonthName(formatted)) return formatted;
  return canonicalMonthName(resolveSequentialMonthName(formatted, previousMonth));
}

function getSummaryBlockEndIndex(headerRows, startListIndex, rows, month) {
  const currentIndex = getMonthIndex(canonicalMonthName(month));
  let listIndex = startListIndex + 1;

  while (listIndex < headerRows.length) {
    const headerRowIndex = headerRows[listIndex];
    const rawMonth = getMonthLabelFromBlock(rows, headerRowIndex);
    if (rawMonth && isKnownMonthName(rawMonth)) {
      const rawIndex = getMonthIndex(canonicalMonthName(rawMonth));
      if (rawIndex !== undefined && currentIndex !== undefined && rawIndex > currentIndex) {
        break;
      }
    }
    listIndex += 1;
  }

  return headerRows[listIndex] ?? rows.length;
}

function advancePastSummaryMonth(headerRows, startListIndex, blockEndRowIndex) {
  let listIndex = startListIndex + 1;
  while (listIndex < headerRows.length && headerRows[listIndex] < blockEndRowIndex) {
    listIndex += 1;
  }
  return listIndex;
}

function findNearestDayHeader(rows, userRowIndex, blockStartHeaderIndex) {
  for (let rowIndex = userRowIndex; rowIndex >= blockStartHeaderIndex; rowIndex -= 1) {
    if (isDaySequenceHeaderRow(rows[rowIndex])) return rows[rowIndex];
  }
  return rows[blockStartHeaderIndex];
}

function isSummaryStyleRow(row) {
  if (isDaySequenceHeaderRow(row)) return false;

  const name = getSummaryRowName(row);
  if (!name) return false;

  const nameInB = formatCellValue(row?.[1]);
  if (normalizeNameForMatch(nameInB) === normalizeNameForMatch(name)) return true;

  const labelInA = formatCellValue(row?.[0]);
  if (!labelInA) return rowHasSummaryValues(row, []);

  return isGroupLabel(labelInA) || labelInA === 'Խումբ';
}

function countRowTypes(rows, startIndex, endIndex) {
  let summaryCount = 0;
  let classicCount = 0;

  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isSummaryStyleRow(row)) summaryCount += 1;
    else if (isHoursUserRow(row)) classicCount += 1;
  }

  return { summaryCount, classicCount };
}

function inferBlockLayout(rows, headerIndex, endIndex, month) {
  if (isSummaryMonth(month)) return 'summary';

  const { summaryCount, classicCount } = countRowTypes(rows, headerIndex + 1, endIndex);
  if (summaryCount > 0 && classicCount === 0) return 'summary';
  return 'classic';
}

function rowHasSummaryValues(row, dayColumns) {
  if (dayColumns.length) {
    return extractDayValues(row, dayColumns).some((value) => value !== '');
  }

  for (let col = 3; col < row.length; col += 1) {
    if (!isPlaceholderCell(row[col]) && formatCellValue(row[col])) return true;
  }

  return false;
}

function findClassicUserRow(rows, startIndex, endIndex, userName) {
  const targetName = normalizeNameForMatch(userName);
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (normalizeNameForMatch(row?.[0]) === targetName && isHoursUserRow(row)) return row;
    if (normalizeNameForMatch(row?.[1]) === targetName && isHoursUserRow(row)) return row;
  }
  return null;
}

function getSummaryRowName(row) {
  const nameInB = formatCellValue(row?.[1]);
  const nameInA = formatCellValue(row?.[0]);

  if (nameInB && !SKIP_ROW_LABELS.has(nameInB) && !isNumericCode(nameInB) && !isMonthTitleCell(nameInB)) {
    return nameInB;
  }

  if (
    nameInA &&
    !SKIP_ROW_LABELS.has(nameInA) &&
    !isSectionLabel(nameInA) &&
    !isGroupLabel(nameInA) &&
    !isMonthTitleCell(nameInA) &&
    isNumericCode(row?.[1])
  ) {
    return nameInA;
  }

  return '';
}

function getSummaryRowCode(row, name) {
  const nameInB = formatCellValue(row?.[1]);
  if (normalizeName(nameInB) === normalizeName(name)) return row?.[2];
  return row?.[1];
}

function isSummaryUserRow(row) {
  if (!isSummaryStyleRow(row)) return false;
  return Boolean(getSummaryRowName(row));
}

function findSummaryUserRowsWithIndex(rows, startIndex, endIndex, userName) {
  const targetName = normalizeNameForMatch(userName);
  const matches = [];

  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isDaySequenceHeaderRow(row)) continue;

    const name = getSummaryRowName(row);
    if (!name || normalizeNameForMatch(name) !== targetName) continue;

    const headerRow = findNearestDayHeader(rows, rowIndex, startIndex - 1);
    if (rowLooksLikeSummaryData(row, headerRow)) {
      matches.push({ row, rowIndex, headerRow });
    }
  }

  return matches;
}

function mergeSummaryAmountRows(userRows, days) {
  const dayCount = days.length;
  const merged = Array.from({ length: dayCount }, () => '');
  let explicitTotal = 0;
  let hasExplicitTotal = false;

  userRows.forEach(({ row, headerRow }) => {
    const { dayColumns } = extractDayColumns(headerRow);
    const amounts = alignDayValues(extractDayValues(row, dayColumns), dayCount);
    amounts.forEach((value, index) => {
      if (!value) return;
      if (!merged[index]) {
        merged[index] = value;
        return;
      }
      const left = parseNumericCell(merged[index]);
      const right = parseNumericCell(value);
      if (!Number.isNaN(left) && !Number.isNaN(right)) {
        merged[index] = formatCellValue(left + right);
      }
    });

    const trailing = extractTrailingTotal(row, dayColumns);
    if (trailing) {
      const parsed = parseNumericCell(trailing);
      if (!Number.isNaN(parsed)) {
        explicitTotal += parsed;
        hasExplicitTotal = true;
      }
    }
  });

  const amountTotal = hasExplicitTotal
    ? formatAmountTotal(explicitTotal)
    : formatAmountTotal(sumNumericCells(merged));

  return { amounts: merged, amountTotal };
}

function extractTrailingTotal(row, dayColumns) {
  if (!dayColumns.length) return '';
  const totalCol = dayColumns[dayColumns.length - 1] + 1;
  const value = row?.[totalCol];
  if (isPlaceholderCell(value)) return '';
  return formatCellValue(value);
}

function looksLikePersonName(value) {
  const text = formatCellValue(value);
  if (!text || text.length < 2) return false;
  if (SKIP_ROW_LABELS.has(text)) return false;
  if (isKnownMonthName(text)) return false;
  if (isGroupLabel(text)) return false;
  if (isSectionLabel(text)) return false;
  if (isNumericCode(text)) return false;
  if (!/[\u0530-\u058F]/.test(text)) return false;
  return true;
}

function collectPersonFromRow(row) {
  if (isDaySequenceHeaderRow(row)) return null;

  const nameInB = formatCellValue(row?.[1]);
  const nameInA = formatCellValue(row?.[0]);

  if (looksLikePersonName(nameInB)) {
    return { name: nameInB, code: getSummaryRowCode(row, nameInB) };
  }

  if (looksLikePersonName(nameInA) && isHoursUserRow(row)) {
    return { name: nameInA, code: row?.[1] };
  }

  if (looksLikePersonName(nameInA)) {
    const hasData = row.slice(1).some((cell) => formatCellValue(cell) !== '');
    if (hasData) return { name: nameInA, code: row?.[1] };
  }

  return null;
}

function scanAllPeopleFromSheet(rows, workers, seenNames, nextIdRef) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const person = collectPersonFromRow(rows[rowIndex]);
    if (!person) continue;
    registerWorker(workers, seenNames, nextIdRef, person.name, person.code);
  }
}

function registerWorker(workers, seenNames, nextIdRef, name, code) {
  const normalized = normalizeNameForMatch(name);
  if (!normalized || seenNames.has(normalized)) return;

  seenNames.add(normalized);
  const displayName = normalizeDisplayName(name);
  const rate = formatCellValue(code);
  workers.push({
    id: nextIdRef.value,
    name: displayName,
    password: buildWorkerPassword(displayName, nextIdRef.value),
    otherData: rate ? [rate] : [],
  });
  nextIdRef.value += 1;
}

export function extractWorkersFromSheet(rows) {
  if (!Array.isArray(rows)) return [];

  const seenNames = new Set();
  const workers = [];
  const nextIdRef = { value: 1 };

  scanAllPeopleFromSheet(rows, workers, seenNames, nextIdRef);

  return workers;
}

function parseClassicMonthBlock(rows, hoursHeaderIndex, moneyHeaderIndex, nextBlockStart, userName, month) {
  const hoursHeader = rows[hoursHeaderIndex];
  const { days, dayColumns } = extractDayColumns(hoursHeader);
  if (!days.length) return null;

  const moneyHeader = moneyHeaderIndex !== undefined ? rows[moneyHeaderIndex] : null;
  const moneyDayColumns = moneyHeader ? extractDayColumns(moneyHeader).dayColumns : dayColumns;
  const hoursEnd = moneyHeaderIndex ?? nextBlockStart;
  const hoursRow = findClassicUserRow(rows, hoursHeaderIndex + 1, hoursEnd, userName);
  if (!hoursRow) return null;

  const moneyRow =
    moneyHeaderIndex !== undefined
      ? findClassicUserRow(rows, moneyHeaderIndex + 1, nextBlockStart, userName)
      : null;

  return {
    month,
    layout: 'classic',
    days,
    hours: alignDayValues(extractDayValues(hoursRow, dayColumns), days.length),
    hoursTotal: extractHoursTotal(hoursRow),
    amounts: moneyHeader
      ? alignDayValues(extractDayValues(moneyRow || [], moneyDayColumns), days.length)
      : Array.from({ length: days.length }, () => ''),
  };
}

function parseSummaryMonthBlock(rows, headerRowIndex, endRowIndex, userName, month) {
  const matches = findSummaryUserRowsWithIndex(rows, headerRowIndex + 1, endRowIndex, userName);
  if (!matches.length) return null;

  const headerRow = findNearestDayHeader(rows, matches[0].rowIndex, headerRowIndex);
  const { days } = extractDayColumns(headerRow);
  if (!days.length) return null;

  const { amounts, amountTotal } = mergeSummaryAmountRows(matches, days);

  return {
    month,
    layout: 'summary',
    days,
    amounts,
    amountTotal,
  };
}

function parseMonthBlocks(rows, userName) {
  const headerRows = findMonthHeaderRows(rows);
  const blocks = [];
  let previousMonth = '';

  for (let index = 0; index < headerRows.length; ) {
    const headerIndex = headerRows[index];
    const rawMonth = getMonthLabelFromBlock(rows, headerIndex);
    const month = resolveBlockMonth(rawMonth, previousMonth);
    if (month) previousMonth = month;
    const endIndex = headerRows[index + 1] ?? rows.length;
    const layout = inferBlockLayout(rows, headerIndex, endIndex, month);

    if (layout === 'summary') {
      const blockEnd = getSummaryBlockEndIndex(headerRows, index, rows, month);
      const block = parseSummaryMonthBlock(rows, headerIndex, blockEnd, userName, month);
      if (block) blocks.push(block);
      index = advancePastSummaryMonth(headerRows, index, blockEnd);
      continue;
    }

    const moneyHeaderIndex = headerRows[index + 1];
    if (moneyHeaderIndex === undefined) {
      index += 1;
      continue;
    }

    const nextBlockStart = headerRows[index + 2] ?? rows.length;
    const block = parseClassicMonthBlock(
      rows,
      headerIndex,
      moneyHeaderIndex,
      nextBlockStart,
      userName,
      month
    );
    if (block) blocks.push(block);
    index += 2;
  }

  return sortBlocksByMonth(appendMissingSummaryMonthBlocks(rows, userName, blocks));
}

export function parseUserWorkMonths(rows, userName) {
  if (!Array.isArray(rows) || !userName) return [];
  return parseMonthBlocks(rows, userName);
}
