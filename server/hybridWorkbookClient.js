const { canAccessCloudWorkbook } = require('./auth');
const { getWorksheetRangeFromGraphFile } = require('./graphWorkbookClient');
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
  const sources = [];

  if (hasLocalFileConfig()) {
    sources.push(
      getWorksheetRangeFromLocalFile({ sheet, range }).then((value) => ({
        ...value,
        sourceUsed: 'local_file',
      }))
    );
  }

  if (hasShareLinkConfig()) {
    sources.push(
      getWorksheetRangeFromShareLink({ sheet, range }).then((value) => ({
        ...value,
        sourceUsed: 'share_link',
      }))
    );
  }

  if (canAccessCloudWorkbook()) {
    sources.push(
      getWorksheetRangeFromGraphFile({ sheet, range }).then((value) => ({
        ...value,
        sourceUsed: 'graph',
      }))
    );
  }

  if (!sources.length) {
    throw new Error(
      'No Excel source configured. Set EXCEL_LOCAL_PATH, EXCEL_SHARE_URL, or complete Microsoft login at /ms-login'
    );
  }

  const results = await Promise.allSettled(sources);
  const successful = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  if (!successful.length) {
    throw results[0]?.reason || new Error('All Excel sources failed');
  }

  return successful.reduce((newest, current) => {
    const newestTime = toTimestamp(newest.fileLastModifiedAt);
    const currentTime = toTimestamp(current.fileLastModifiedAt);
    return currentTime >= newestTime ? current : newest;
  });
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
