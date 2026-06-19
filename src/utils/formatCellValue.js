export function formatCellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' && value.trim() === '') return '';
  return String(value).trim();
}

export function parseNumericCell(value) {
  const text = formatCellValue(value);
  if (!text) return 0;

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.reduce((total, part) => {
      const numeric = Number(part.replace(',', '.'));
      return Number.isNaN(numeric) ? total : total + numeric;
    }, 0);
  }

  const numeric = Number(text.replace(',', '.'));
  return Number.isNaN(numeric) ? 0 : numeric;
}

export function isPlaceholderCell(value) {
  const num = parseNumericCell(value);
  return num === 0 || num === 0.1;
}

export function sumNumericCells(values) {
  return values.reduce((total, value) => {
    if (isPlaceholderCell(value)) return total;
    return total + parseNumericCell(value);
  }, 0);
}

export function formatHoursTotal(total) {
  if (!total) return '';
  const rounded = Math.round(total * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function formatAmountTotal(total) {
  if (!total) return '';
  return String(Math.round(total * 100) / 100);
}
