const fs = require('fs');
const path = require('path');

const ANNOUNCEMENT_FILE = path.join(__dirname, '.announcement.json');

function readAnnouncement() {
  try {
    if (!fs.existsSync(ANNOUNCEMENT_FILE)) return null;
    const raw = fs.readFileSync(ANNOUNCEMENT_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !String(data.text || '').trim()) return null;
    return {
      text: String(data.text).trim(),
      recipientIds: Array.isArray(data.recipientIds)
        ? data.recipientIds.map((id) => Number(id)).filter((id) => id > 0)
        : [],
      recipientKeys: Array.isArray(data.recipientKeys)
        ? data.recipientKeys.map((key) => String(key || '').trim().toLowerCase()).filter(Boolean)
        : [],
      createdBy: data.createdBy || '',
      updatedAt: data.updatedAt || '',
    };
  } catch (error) {
    return null;
  }
}

function normalizeUserKey(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeAdminName(value) {
  const firstWord = String(value || '').trim().split(/\s+/)[0] || '';
  return firstWord.toLowerCase();
}

function saveAnnouncement({ text, recipientIds, recipientKeys, createdBy, adminUserId, adminUserName }) {
  const idSet = new Set((recipientIds || []).map((id) => Number(id)).filter((id) => id > 0));
  const keySet = new Set(
    (recipientKeys || []).map((key) => normalizeUserKey(key)).filter(Boolean)
  );
  const adminId = Number(adminUserId);
  if (adminId > 0) {
    idSet.add(adminId);
  }
  const adminKey = normalizeUserKey(adminUserName);
  if (adminKey) {
    keySet.add(adminKey);
  }

  const payload = {
    text: String(text || '').trim(),
    recipientIds: [...idSet],
    recipientKeys: [...keySet],
    createdBy: String(createdBy || '').trim(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function clearAnnouncement() {
  try {
    if (fs.existsSync(ANNOUNCEMENT_FILE)) {
      fs.unlinkSync(ANNOUNCEMENT_FILE);
    }
  } catch (error) {
    // Ignore delete failures.
  }
  return null;
}

function isAnnouncementAdmin({ userId, userName }) {
  if (Number(userId) === 1) return true;
  const normalized = normalizeAdminName(userName);
  return normalized === 'իսո' || normalized === 'iso';
}

module.exports = {
  clearAnnouncement,
  isAnnouncementAdmin,
  readAnnouncement,
  saveAnnouncement,
};
