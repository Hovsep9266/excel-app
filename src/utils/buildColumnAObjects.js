import { extractWorkersFromSheet } from './parseUserWorkMonths';

export function buildObjectsFromColumnA(rows) {
  return extractWorkersFromSheet(rows);
}
