import { messages } from '../i18n/messages';

const MONTH_ALIASES = {
  january: 0,
  jan: 0,
  январь: 0,
  янв: 0,
  հունվար: 0,
  february: 1,
  feb: 1,
  февраль: 1,
  фев: 1,
  փետրվար: 1,
  march: 2,
  mar: 2,
  март: 2,
  մարտ: 2,
  april: 3,
  apr: 3,
  апрель: 3,
  апр: 3,
  ապրիլ: 3,
  may: 4,
  май: 4,
  մայիս: 4,
  june: 5,
  jun: 5,
  июнь: 5,
  июн: 5,
  հունիս: 5,
  july: 6,
  jul: 6,
  июль: 6,
  июл: 6,
  հուլիս: 6,
  august: 7,
  aug: 7,
  август: 7,
  авг: 7,
  օգոստոս: 7,
  september: 8,
  sep: 8,
  sept: 8,
  сентябрь: 8,
  сен: 8,
  սեպտեմբեր: 8,
  october: 9,
  oct: 9,
  октябрь: 9,
  окт: 9,
  հոկտեմբեր: 9,
  november: 10,
  nov: 10,
  ноябрь: 10,
  ноя: 10,
  նոյեմբեր: 10,
  december: 11,
  dec: 11,
  декабрь: 11,
  дек: 11,
  դեկտեմբեր: 11,
};

export function isKnownMonthName(rawMonth) {
  const key = String(rawMonth || '').trim().toLowerCase();
  return key !== '' && Object.prototype.hasOwnProperty.call(MONTH_ALIASES, key);
}

export function getMonthIndex(rawMonth) {
  const key = String(rawMonth || '').trim().toLowerCase();
  return MONTH_ALIASES[key];
}

/** When a copied month block still has the previous month name, advance to the next month. */
export function resolveSequentialMonthName(rawMonth, previousResolvedMonth) {
  const formatted = String(rawMonth || '').trim();
  if (!isKnownMonthName(formatted)) return formatted;

  const index = getMonthIndex(formatted);
  if (index === undefined) return formatted;

  const previousIndex = getMonthIndex(previousResolvedMonth);
  if (previousIndex !== undefined && previousIndex === index) {
    const nextIndex = Math.min(index + 1, 11);
    return messages.hy?.monthNames?.[nextIndex] || formatted;
  }

  return formatted;
}

export function translateMonthName(rawMonth, lang) {
  const original = String(rawMonth || '').trim();
  if (!original) return '';

  const aliasKey = original.toLowerCase();
  const monthIndex = MONTH_ALIASES[aliasKey];
  const monthNames = messages[lang]?.monthNames;

  if (monthIndex !== undefined && monthNames?.[monthIndex]) {
    return monthNames[monthIndex];
  }

  return original;
}
