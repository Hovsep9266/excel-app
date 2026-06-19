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

function preferShareLink() {
  const raw = String(process.env.EXCEL_PREFER_SHARE_LINK || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

async function probeConfiguredSources({ sheet, range }) {
  const probes = [];

  if (hasLocalFileConfig()) {
    probes.push(
      getWorksheetRangeFromLocalFile({ sheet, range })
        .then((value) => ({
          sourceUsed: 'local_file',
          ok: true,
          rowCount: value.rowCount || 0,
          columnCount: value.columnCount || 0,
          fileLastModifiedAt: value.fileLastModifiedAt,
          filePath: value.filePath,
        }))
        .catch((error) => ({
          sourceUsed: 'local_file',
          ok: false,
          error: error.message || 'Local file read failed',
        }))
    );
  }

  if (hasShareLinkConfig()) {
    probes.push(
      getWorksheetRangeFromShareLink({ sheet, range })
        .then((value) => ({
          sourceUsed: 'share_link',
          ok: true,
          rowCount: value.rowCount || 0,
          columnCount: value.columnCount || 0,
          fileLastModifiedAt: value.fileLastModifiedAt,
        }))
        .catch((error) => ({
          sourceUsed: 'share_link',
          ok: false,
          error: error.message || 'Share link read failed',
        }))
    );
  }

  if (canAccessCloudWorkbook()) {
    probes.push(
      getWorksheetRangeFromGraphFile({ sheet, range })
        .then((value) => ({
          sourceUsed: 'graph',
          ok: true,
          rowCount: value.rowCount || 0,
          columnCount: value.columnCount || 0,
          fileLastModifiedAt: value.fileLastModifiedAt,
        }))
        .catch((error) => ({
          sourceUsed: 'graph',
          ok: false,
          error: error.message || 'Graph read failed',
        }))
    );
  }

  const results = await Promise.all(probes);
  return results;
}

function pickBestSource(successful) {
  const share = successful.find((entry) => entry.sourceUsed === 'share_link');
  const graph = successful.find((entry) => entry.sourceUsed === 'graph');
  const local = successful.find((entry) => entry.sourceUsed === 'local_file');

  if (preferShareLink() && share) {
    return share;
  }

  if (graph && local && graph.rowCount > local.rowCount) {
    return graph;
  }

  if (share && local && share.rowCount > local.rowCount) {
    return share;
  }

  return successful.reduce((best, current) => {
    const bestRows = best.rowCount || 0;
    const currentRows = current.rowCount || 0;
    if (currentRows !== bestRows) {
      return currentRows > bestRows ? current : best;
    }
    const priority = { graph: 3, share_link: 2, local_file: 1 };
    const bestPriority = priority[best.sourceUsed] || 0;
    const currentPriority = priority[current.sourceUsed] || 0;
    if (currentPriority !== bestPriority) {
      return currentPriority > bestPriority ? current : best;
    }
    const bestTime = toTimestamp(best.fileLastModifiedAt);
    const currentTime = toTimestamp(current.fileLastModifiedAt);
    return currentTime >= bestTime ? current : best;
  });
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

  return pickBestSource(successful);
}

async function getHybridSourceStatus({ sheet, range }) {
  const probes = await probeConfiguredSources({ sheet, range });
  const successful = probes.filter((entry) => entry.ok);
  const selected = successful.length ? pickBestSource(successful) : null;

  return {
    probes,
    selectedSource: selected?.sourceUsed || null,
    selectedRowCount: selected?.rowCount || 0,
  };
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
  getHybridSourceStatus,
  getWorksheetRangeHybrid,
  hasLocalFileConfig,
  hasShareLinkConfig,
};
