const { getWorksheetRangeFromLocalFile } = require('./localWorkbookClient');
const { getWorksheetRangeFromShareLink, getShareUrl } = require('./shareLinkWorkbookClient');

function toTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function hasShareLinkConfig() {
  return Boolean(getShareUrl());
}

function hasLocalFileConfig() {
  return Boolean(process.env.EXCEL_LOCAL_PATH);
}

async function getWorksheetRangeHybrid({ sheet, range }) {
  const localPromise = hasLocalFileConfig()
    ? getWorksheetRangeFromLocalFile({ sheet, range })
    : Promise.reject(new Error('Local file not configured'));
  const sharePromise = hasShareLinkConfig()
    ? getWorksheetRangeFromShareLink({ sheet, range })
    : Promise.reject(new Error('Share link not configured'));

  const [localResult, shareResult] = await Promise.allSettled([localPromise, sharePromise]);

  const localOk = localResult.status === 'fulfilled';
  const shareOk = shareResult.status === 'fulfilled';

  if (!localOk && !shareOk) {
    throw localResult.reason || shareResult.reason;
  }

  if (!localOk) {
    return { ...shareResult.value, sourceUsed: 'share_link' };
  }

  if (!shareOk) {
    return { ...localResult.value, sourceUsed: 'local_file' };
  }

  const local = localResult.value;
  const share = shareResult.value;
  const localTime = toTimestamp(local.fileLastModifiedAt);
  const shareTime = toTimestamp(share.fileLastModifiedAt);

  if (shareTime >= localTime) {
    return { ...share, sourceUsed: 'share_link' };
  }

  return { ...local, sourceUsed: 'local_file' };
}

async function checkHybridWorkbookAccess() {
  await getWorksheetRangeHybrid({
    sheet: process.env.EXCEL_DEFAULT_SHEET || 'Sheet1',
    range: process.env.EXCEL_DEFAULT_RANGE || '',
  });
  return { ok: true };
}

module.exports = {
  checkHybridWorkbookAccess,
  getWorksheetRangeHybrid,
  hasLocalFileConfig,
  hasShareLinkConfig,
};
