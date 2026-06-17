export function normalizeUserKey(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeAdminName(value) {
  const firstWord = String(value || '').trim().split(/\s+/)[0] || '';
  return firstWord.toLowerCase();
}

export function isAnnouncementAdmin(user) {
  if (!user) return false;
  if (Number(user.id) === 1) return true;
  const normalized = normalizeAdminName(user.name);
  return normalized === 'իսո' || normalized === 'iso';
}

export function canUserSeeAnnouncement(user, announcement) {
  if (!user || !announcement?.text) return false;
  if (isAnnouncementAdmin(user)) return true;

  const userId = Number(user.id);
  const userKey = normalizeUserKey(user.name);
  const ids = announcement.recipientIds || [];
  const keys = announcement.recipientKeys || [];

  return ids.includes(userId) || keys.includes(userKey);
}

export function isSelectableAnnouncementRecipient(user) {
  return Boolean(user) && !isAnnouncementAdmin(user);
}
