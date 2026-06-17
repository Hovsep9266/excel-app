const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL !== undefined
    ? process.env.REACT_APP_API_BASE_URL
    : process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:4000';

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

export async function getAnnouncement() {
  const response = await fetch(`${API_BASE_URL}/api/announcements?_ts=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  const data = await parseJson(response);
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Failed to load announcement');
  }
  return data.announcement || null;
}

export async function saveAnnouncement({ text, recipientIds, recipientKeys, userId, userName }) {
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      text,
      recipientIds,
      recipientKeys,
      userId,
      userName,
    }),
  });
  const data = await parseJson(response);
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Failed to save announcement');
  }
  if (!data.announcement?.text) {
    throw new Error('Failed to save announcement');
  }
  return data.announcement;
}

export async function deleteAnnouncement({ userId, userName }) {
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      userId,
      userName,
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete announcement');
  }
  return null;
}
