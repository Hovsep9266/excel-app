function normalizeCellValue(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}


export function buildObjectsFromColumnA(rows) {
  if (!Array.isArray(rows)) return [];

  const result = [];
  let nextId = 1;

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const name = normalizeCellValue(row[0]);
    if (!name) continue;

    const id = nextId;
    nextId += 1;
    const otherData = row
      .slice(1)
      .map((value) => normalizeCellValue(value))
      .filter((value) => Boolean(value));

    result.push({
      id,
      name,
      password: `${name}${id}123`,
      otherData,
    });
  }

  return result;
} 

