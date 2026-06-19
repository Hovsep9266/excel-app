import { extractWorkersFromSheet, findWorkerForLogin, parseUserWorkMonths } from './parseUserWorkMonths';

function buildDayHeaderRow(dayCount, dayStartCol = 3) {
  const row = new Array(dayStartCol + dayCount + 2).fill('');
  for (let day = 1; day <= dayCount; day += 1) {
    row[dayStartCol + day - 1] = day;
  }
  return row;
}

function buildDayHeaderRowWithWeekendGaps(dayCount, dayStartCol = 3, gapAfterDays = [3, 10, 17, 24]) {
  const gapCount = gapAfterDays.filter((day) => day <= dayCount).length;
  const row = new Array(dayStartCol + dayCount + gapCount + 2).fill('');
  let col = dayStartCol;
  for (let day = 1; day <= dayCount; day += 1) {
    row[col] = day;
    col += 1;
    if (gapAfterDays.includes(day)) col += 1;
  }
  return row;
}

function buildMonthTitleRow(monthName, titleCol = 3) {
  const row = new Array(40).fill('');
  row[titleCol] = monthName;
  return row;
}

function buildDayHeaderFromColumnD(dayCount) {
  const row = new Array(dayCount + 10).fill('');
  for (let day = 1; day <= dayCount; day += 1) {
    row[2 + day] = day;
  }
  return row;
}

describe('parseUserWorkMonths summary layout', () => {
  const classicMayHeader = buildDayHeaderRow(5);
  classicMayHeader[0] = 'Մայիս';

  const classicMayMoneyHeader = buildDayHeaderRow(5);

  const classicRows = [
    classicMayHeader,
    ['Արամ', 16, '', 8, 8, '', '', '', 16],
    classicMayMoneyHeader,
    ['Արամ', 16, '', '100', '100', '', '', '', '200'],
    ['Հունիս', '', '', '', '', '', ''],
    buildDayHeaderRow(5),
    ['Խումբ', 'Արամ', 16, '14,8', '22,2', '', '', '', '37'],
  ];

  it('keeps classic months with hours and amounts', () => {
    const blocks = parseUserWorkMonths(classicRows, 'Արամ');
    const mayBlock = blocks.find((block) => block.layout === 'classic');
    expect(mayBlock).toBeTruthy();
    expect(mayBlock.month).toBe('Մայիս');
    expect(mayBlock.hours).toEqual(['8', '8', '', '', '']);
    expect(mayBlock.amounts).toEqual(['100', '100', '', '', '']);
  });

  it('parses June+ from column B with sums only', () => {
    const blocks = parseUserWorkMonths(classicRows, 'Արամ');
    expect(blocks).toHaveLength(2);
    expect(blocks[1].layout).toBe('summary');
    expect(blocks[1].month).toBe('Հունիս');
    expect(blocks[1].hours).toBeUndefined();
    expect(blocks[1].amounts).toEqual(['14,8', '22,2', '', '', '']);
    expect(blocks[1].amountTotal).toBe('37');
  });

  it('adds June to the same user who already has classic months', () => {
    const blocks = parseUserWorkMonths(classicRows, 'Արամ');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].layout).toBe('classic');
    expect(blocks[1].layout).toBe('summary');
    expect(blocks[1].month).toBe('Հունիս');
  });

  it('detects summary layout even when month title row is separate', () => {
    const rows = [
      ['', '', '', '', '', ''],
      buildDayHeaderRow(3),
      ['Խումբ', 'Արամ', 16, '5', '6', '7', '18'],
    ];
    rows[0][3] = 'Հունիս';

    const blocks = parseUserWorkMonths(rows, 'Արամ');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].layout).toBe('summary');
    expect(blocks[0].amounts).toEqual(['5', '6', '7']);
  });

  it('parses June when the name is in column A', () => {
    const rows = [
      ['Հունիս', '', '', '', '', '', ''],
      buildDayHeaderRow(5),
      ['Արամ', 16, '', '14,8', '22,2', '', '', '', '37'],
    ];

    const blocks = parseUserWorkMonths(rows, 'Արամ');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].month).toBe('Հունիս');
    expect(blocks[0].amounts).toEqual(['14,8', '22,2', '', '', '']);
  });

  it('finds users in later June sub-sections', () => {
    const juneTitle = ['Հունիս', '', '', '', '', '', ''];
    const juneHeader = buildDayHeaderRow(5);
    const atlantisHeader = buildDayHeaderRow(5);
    atlantisHeader[0] = 'Ա Տ Լ Ա Ն Տ Ի Ս';

    const rows = [
      juneTitle,
      juneHeader,
      ['Արամ', 16, '', '1', '2', '', '', '', '3'],
      ['', '', '', '', '', '', ''],
      atlantisHeader,
      ['Խումբ', 'Հարութ', 16, '4', '5', '', '', '', '9'],
      ['', '', '', '', '', '', ''],
      buildDayHeaderRow(5),
      ['Խումբ', 'Աշոտ', 16, '6', '', '', '', '', '6'],
    ];

    const aramBlocks = parseUserWorkMonths(rows, 'Արամ');
    expect(aramBlocks.some((block) => block.month === 'Հունիս')).toBe(true);

    const harutBlocks = parseUserWorkMonths(rows, 'Հարութ');
    expect(harutBlocks).toHaveLength(1);
    expect(harutBlocks[0].month).toBe('Հունիս');
    expect(harutBlocks[0].amounts).toEqual(['4', '5', '', '', '']);

    const ashotBlocks = parseUserWorkMonths(rows, 'Աշոտ');
    expect(ashotBlocks[0].amounts[0]).toBe('6');
  });

  it('registers workers from all June sub-sections', () => {
    const rows = [
      ['Հունիս', '', '', '', '', '', ''],
      buildDayHeaderRow(3),
      ['Արամ', 16, '', '1', '2', '3'],
      buildDayHeaderRow(3),
      ['Խումբ', 'Հարութ', 16, '4', '5', '9'],
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers.some((worker) => worker.name === 'Արամ')).toBe(true);
    expect(workers.some((worker) => worker.name === 'Հարութ')).toBe(true);
  });

  it('parses May like the real sheet with separate title rows and weekend gaps', () => {
    const mayHoursTitle = buildMonthTitleRow('Մայիս');
    const mayHoursHeader = buildDayHeaderRowWithWeekendGaps(30);
    const mayMoneyTitle = buildMonthTitleRow('Մայիս');
    const mayMoneyHeader = buildDayHeaderRowWithWeekendGaps(31);
    const juneTitle = buildMonthTitleRow('Հունիս');
    const juneHeader = buildDayHeaderRowWithWeekendGaps(30);

    const rows = [
      mayHoursTitle,
      ['', '', '', '', ''],
      mayHoursHeader,
      ['Իսո', 12, '', 8, 8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 16],
      ['Հարութ', 12, '', 7, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 7],
      ['Արամ', 12, '', 8, 8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 16],
      ['ԸՆԴՀ', '', '', 16, 8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 24],
      ['', '', '', '', ''],
      mayMoneyTitle,
      mayMoneyHeader,
      ['Հարութ', 2001, '', '31.9', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '31.9'],
      ['Արամ', 2001, '', '100', '100', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '200'],
      juneTitle,
      juneHeader,
      ['Արամ', 16, '', '18.4', '22.3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '274.5'],
      ['Հարութ', 16, '', '', '22.3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '79.8'],
    ];

    const aramBlocks = parseUserWorkMonths(rows, 'Արամ');
    expect(aramBlocks.some((block) => block.month === 'Մայիս' && block.layout === 'classic')).toBe(true);
    expect(aramBlocks.some((block) => block.month === 'Հունիս' && block.layout === 'summary')).toBe(true);

    const harutBlocks = parseUserWorkMonths(rows, 'Հարութ');
    expect(harutBlocks.some((block) => block.month === 'Մայիս')).toBe(true);
    expect(harutBlocks.some((block) => block.month === 'Հունիս')).toBe(true);
  });

  it('parses June like the real Excel layout (title row, days from E, names in B)', () => {
    const monthTitle = new Array(40).fill('');
    monthTitle[2] = 'ՀՈՒՆԻՍ';

    const dayHeader = buildDayHeaderRowWithWeekendGaps(30, 4);
    dayHeader[1] = 'ՀՈՒՆԻՍ';

    const atlantisHeader = buildDayHeaderRowWithWeekendGaps(30, 4);

    const dept = 'Ավանի Քանաքեռի մասնաճյուղ';
    const aramRow = new Array(40).fill('');
    aramRow[0] = dept;
    aramRow[1] = 'Արամ';
    aramRow[2] = 16;
    aramRow[4] = '18.4';
    aramRow[5] = '22.3';
    aramRow[6] = '8.0';

    const harutRow = new Array(40).fill('');
    harutRow[0] = dept;
    harutRow[1] = 'Հարութ';
    harutRow[2] = 16;
    harutRow[5] = '22.3';
    harutRow[6] = '8.0';

    const lyovRow = new Array(40).fill('');
    lyovRow[0] = 'ԱՏԼԱՆՏԻՍ';
    lyovRow[1] = 'Լյով';
    lyovRow[2] = 17;
    lyovRow[4] = '14.8';
    lyovRow[5] = '22.2';

    const rows = [
      buildMonthTitleRow('Մայիս'),
      buildDayHeaderRow(5),
      ['Արամ', 12, '', 8, 8, '', '', '', 16],
      buildDayHeaderRow(5),
      ['Արամ', 12, '', '100', '100', '', '', '', '200'],
      monthTitle,
      dayHeader,
      aramRow,
      harutRow,
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      atlantisHeader,
      lyovRow,
    ];

    const aramBlocks = parseUserWorkMonths(rows, 'Արամ');
    expect(aramBlocks.some((block) => block.month === 'Մայիս' && block.layout === 'classic')).toBe(true);
    expect(aramBlocks.some((block) => block.month === 'Հունիս' && block.layout === 'summary')).toBe(true);
    const juneBlock = aramBlocks.find((block) => block.month === 'Հունիս');
    expect(juneBlock.amounts[0]).toBe('18.4');
    expect(juneBlock.amounts[1]).toBe('22.3');

    const harutBlocks = parseUserWorkMonths(rows, 'Հարութ');
    expect(harutBlocks.some((block) => block.month === 'Հունիս')).toBe(true);

    const lyovBlocks = parseUserWorkMonths(rows, 'Լյով');
    expect(lyovBlocks.some((block) => block.month === 'Հունիս')).toBe(true);
  });

  it('registers June-only users and matches names with optional բ prefix', () => {
    const monthTitle = new Array(40).fill('');
    monthTitle[2] = 'ՀՈՒՆԻՍ';
    const dayHeader = buildDayHeaderRowWithWeekendGaps(30, 4);
    dayHeader[1] = 'ՀՈՒՆԻՍ';

    const rows = [
      monthTitle,
      dayHeader,
      ['Ավանի', 'բ Սերգեյ', 16, '', '13', ''],
      ['Ատլանտիս', 'Նավո', 17, '14.8', '', ''],
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers.some((worker) => worker.name === 'բ Սերգեյ')).toBe(true);
    expect(workers.some((worker) => worker.name === 'Նավո')).toBe(true);

    const blocks = parseUserWorkMonths(rows, 'բ Սերգեյ');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].month).toBe('Հունիս');
  });

  it('registers every name from all three June tables on the sheet', () => {
    const monthTitle = new Array(45).fill('');
    monthTitle[2] = 'ՀՈՒՆԻՍ';

    function juneUser(dept, name, code, values = []) {
      const row = new Array(45).fill('');
      row[0] = dept;
      row[1] = name;
      row[2] = code;
      values.forEach((value, index) => {
        if (value !== '') row[4 + index] = value;
      });
      return row;
    }

    const rows = [
      monthTitle,
      buildDayHeaderRowWithWeekendGaps(30, 4),
      juneUser('Ավանի', 'Դանիել Պ', 16, ['10']),
      juneUser('Ավանի', 'Վան', 16, ['8']),
      juneUser('Ավանի', 'Արամ', 16, ['18.4']),
      juneUser('Ավանի', 'Սամո', 16, ['5']),
      juneUser('Ավանի', 'Հարութ', 16, ['22.3']),
      juneUser('Ավանի', 'Արման', 16, ['3']),
      juneUser('Ավանի', 'բ Սերգեյ', 16, ['13']),
      juneUser('Ավանի', 'Արթուր', 16, ['7']),
      juneUser('Ավանի', 'Հայկո', 16, ['6']),
      juneUser('Ավանի', 'բ Գրիշ', 16, ['4']),
      juneUser('Ավանի', 'բ Մարկ', 16, []),
      ...new Array(15).fill(['', '', '', '']),
      buildDayHeaderRowWithWeekendGaps(30, 4),
      juneUser('Ատլանտիս', 'Դանիել Ս', 17, ['9']),
      juneUser('Ատլանտիս', 'Լյով', 17, ['14.8']),
      juneUser('Ատլանտիս', 'բ պարսիկ', 17, ['35']),
      juneUser('Ատլանտիս', 'Մհեր', 17, ['11']),
      juneUser('Ատլանտիս', 'բ Դանիել', 17, ['4']),
      juneUser('Ատլանտիս', 'Դանիել Պ', 17, ['2']),
      buildDayHeaderRowWithWeekendGaps(30, 4),
      juneUser('Բաժին', 'Աշոտ', 18, ['52.5']),
      juneUser('Բաժին', 'Հովսեփ', 18, []),
      juneUser('Բաժին', 'Դավո', 18, ['8']),
      juneUser('Բաժին', 'Նավո', 18, ['15']),
      juneUser('Բաժին', 'Գոռ', 18, []),
    ];

    const expectedNames = [
      'Դանիել Պ',
      'Վան',
      'Արամ',
      'Սամո',
      'Հարութ',
      'Արման',
      'բ Սերգեյ',
      'Արթուր',
      'Հայկո',
      'բ Գրիշ',
      'բ Մարկ',
      'Դանիել Ս',
      'Լյով',
      'բ պարսիկ',
      'Մհեր',
      'բ Դանիել',
      'Աշոտ',
      'Հովսեփ',
      'Դավո',
      'Նավո',
      'Գոռ',
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers).toHaveLength(expectedNames.length);
    expectedNames.forEach((name) => {
      expect(workers.some((worker) => worker.name === name)).toBe(true);
    });

    expect(parseUserWorkMonths(rows, 'Արամ')).toHaveLength(1);
    expect(parseUserWorkMonths(rows, 'Հարութ')[0].month).toBe('Հունիս');
    expect(parseUserWorkMonths(rows, 'Լյով')[0].amounts[0]).toBe('14.8');
    expect(parseUserWorkMonths(rows, 'Աշոտ')[0].amounts[0]).toBe('52.5');
  });

  it('merges duplicate spellings into one account and one June block', () => {
    const monthTitle = new Array(45).fill('');
    monthTitle[2] = 'ՀՈՒՆԻՍ';

    const rows = [
      monthTitle,
      buildDayHeaderRowWithWeekendGaps(30, 4),
      ['Ատլանտիս', 'Դանել Ս', 17, '', '5', '', ''],
      buildDayHeaderRowWithWeekendGaps(30, 4),
      ['Ատլանտիս', 'Դանիել Ս', 17, '', '9', '', ''],
      buildDayHeaderRowWithWeekendGaps(30, 4),
      ['Ավանի', 'Դանիել Պ', 16, '', '10', '', ''],
      buildDayHeaderRowWithWeekendGaps(30, 4),
      ['Ատլանտիս', 'Դանիել Պ', 17, '', '2', '', ''],
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers.filter((worker) => worker.name.includes('Դանել'))).toHaveLength(1);
    expect(workers.filter((worker) => worker.name.includes('Դանիել Պ'))).toHaveLength(1);

    const danielS = workers.find((worker) => worker.name === 'Դանել Ս');
    expect(danielS.password).toBe('դանել ս1123');

    const danielSBlocks = parseUserWorkMonths(rows, 'Դանել Ս');
    expect(danielSBlocks).toHaveLength(1);
    expect(danielSBlocks[0].amounts[0]).toBe('14');

    const danielPBlocks = parseUserWorkMonths(rows, 'Դանիել Պ');
    expect(danielPBlocks).toHaveLength(1);
    expect(danielPBlocks[0].amounts[0]).toBe('12');
  });

  it('keeps բ prefixed names separate from the same name without prefix', () => {
    const rows = [
      buildMonthTitleRow('Մայիս'),
      buildDayHeaderRow(3),
      ['Դանել', 12, '', '8', '8', ''],
      buildDayHeaderRow(3),
      ['Դանել', 12, '', '100', '100', ''],
      ['Հունիս', '', '', '', '', '', ''],
      buildDayHeaderRow(3),
      ['Ատլանտիս', 'բ Դանել', 17, '', '4', ''],
      ['Ատլանտիս', 'բ Սերգեյ', 16, '', '13', ''],
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers.some((worker) => worker.name === 'Դանել')).toBe(true);
    expect(workers.some((worker) => worker.name === 'բ Դանել')).toBe(true);
    expect(workers.filter((worker) => worker.name === 'բ Դանել')).toHaveLength(1);

    expect(parseUserWorkMonths(rows, 'Դանել').some((block) => block.month === 'Մայիս')).toBe(true);
    expect(parseUserWorkMonths(rows, 'Դանել').some((block) => block.month === 'Հունիս')).toBe(false);
    expect(parseUserWorkMonths(rows, 'բ Դանել')).toHaveLength(1);
    expect(parseUserWorkMonths(rows, 'բ Դանել')[0].month).toBe('Հունիս');

    const daniel = workers.find((worker) => worker.name === 'Դանել');
    const bDaniel = workers.find((worker) => worker.name === 'բ Դանել');
    expect(findWorkerForLogin(workers, 'Դանել', daniel.password).ok).toBe(true);
    expect(findWorkerForLogin(workers, 'բ Դանել', bDaniel.password).ok).toBe(true);
    expect(findWorkerForLogin(workers, 'Դանել', bDaniel.password).ok).toBe(false);
  });

  it('logs in with optional բ prefix and normalized password', () => {
    const rows = [
      ['Հունիս', '', '', '', '', '', ''],
      buildDayHeaderRow(3),
      ['Ավանի', 'բ Սերգեյ', 16, '', '13', ''],
    ];
    const workers = extractWorkersFromSheet(rows);
    const login = findWorkerForLogin(workers, 'Սերգեյ', 'սերգեյ1123');
    expect(login.ok).toBe(true);
    expect(login.user.name).toBe('բ Սերգեյ');
  });

  it('parses real OneDrive June layout: month in B, days and sums from D, large gaps', () => {
    const monthTitle = new Array(40).fill('');
    monthTitle[1] = 'ՀՈՒՆԻՍ';

    function juneUser(name, values = {}) {
      const row = new Array(40).fill('');
      row[1] = name;
      Object.entries(values).forEach(([day, value]) => {
        row[2 + Number(day)] = value;
      });
      return row;
    }

    const rows = [
      monthTitle,
      buildDayHeaderFromColumnD(30),
      juneUser('Դանել Պ', { 1: '16', 2: '14,8 22,2' }),
      juneUser('Վահ', { 1: '8' }),
      juneUser('Արամ', { 1: '18.4' }),
      juneUser('բ Սերգեյ', { 1: '13' }),
      ...new Array(28).fill(null).map(() => new Array(40).fill('')),
      buildDayHeaderFromColumnD(30),
      juneUser('Դանել Ս', { 1: '9' }),
      juneUser('Լյով', { 1: '14.8' }),
      juneUser('Դանիել Պ', { 1: '2' }),
      ...new Array(5).fill(null).map(() => new Array(40).fill('')),
      buildDayHeaderFromColumnD(30),
      juneUser('Աշոտ', { 1: '52.5' }),
      juneUser('Գոռ', { 1: '4' }),
    ];

    const workers = extractWorkersFromSheet(rows);
    expect(workers.some((worker) => worker.name === 'բ Սերգեյ')).toBe(true);
    expect(workers.some((worker) => worker.name === 'Վահ')).toBe(true);
    expect(workers.filter((worker) => worker.name.includes('Դանել Պ'))).toHaveLength(1);

    const aramBlocks = parseUserWorkMonths(rows, 'Արամ');
    expect(aramBlocks).toHaveLength(1);
    expect(aramBlocks[0].month).toBe('Հունիս');
    expect(aramBlocks[0].amounts[0]).toBe('18.4');

    const danielPBlocks = parseUserWorkMonths(rows, 'Դանել Պ');
    expect(danielPBlocks).toHaveLength(1);
    expect(danielPBlocks[0].amounts[0]).toBe('18');

    const lyovBlocks = parseUserWorkMonths(rows, 'Լյով');
    expect(lyovBlocks[0].amounts[0]).toBe('14.8');
  });

  it('treats June day-header rows with department label in column A as headers', () => {
    const monthTitle = new Array(40).fill('');
    monthTitle[0] = 'ՀՈՒՆԻՍ';

    const dayHeader = buildDayHeaderFromColumnD(5);
    dayHeader[0] = 'Ավանի Քանաքեռի մասնաճյուղ';

    const rows = [
      monthTitle,
      dayHeader,
      ['', 'Արամ', 17, '18.4', '22.3', '', ''],
      ['', 'Հարութ', 17, '', '22.3', '', ''],
    ];

    const aramBlocks = parseUserWorkMonths(rows, 'Արամ');
    expect(aramBlocks.some((block) => block.month === 'Հունիս')).toBe(true);
    expect(aramBlocks.find((block) => block.month === 'Հունիս').amounts[0]).toBe('18.4');

    const harutBlocks = parseUserWorkMonths(rows, 'Հարութ');
    expect(harutBlocks.some((block) => block.month === 'Հունիս')).toBe(true);
  });

  it('shows June for users listed in June even without day values yet', () => {
    const monthTitle = new Array(40).fill('');
    monthTitle[0] = 'ՀՈՒՆԻՍ';
    const dayHeader = buildDayHeaderFromColumnD(5);
    dayHeader[0] = 'Ավանի';

    const rows = [
      monthTitle,
      dayHeader,
      ['', 'Լյով', '', '', '', ''],
      ['', 'բ Մարկ', '', '', '', ''],
      ['', 'Նավո', '', '15', '', ''],
    ];

    expect(extractWorkersFromSheet(rows).some((worker) => worker.name === 'Լյով')).toBe(true);

    const lyovBlocks = parseUserWorkMonths(rows, 'Լյով');
    expect(lyovBlocks).toHaveLength(1);
    expect(lyovBlocks[0].month).toBe('Հունիս');

    const markBlocks = parseUserWorkMonths(rows, 'բ Մարկ');
    expect(markBlocks).toHaveLength(1);
    expect(markBlocks[0].month).toBe('Հունիս');
  });
});
