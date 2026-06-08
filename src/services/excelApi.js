const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

class ExcelApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'ExcelApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  const data = await parseJson(response);
  return { response, data };
}

export async function getExcelRange({ sheet, range }) {
  const params = new URLSearchParams({ sheet, range, _ts: String(Date.now()) });
  const requestUrl = `${API_BASE_URL}/api/excel/range?${params.toString()}`;

  const { response, data } = await fetchJson(requestUrl);

  if (!response.ok) {
    throw new ExcelApiError(
      data.error || 'Failed to fetch Excel range',
      response.status,
      data.code || 'RANGE_REQUEST_FAILED'
    );
  }

  return data;
}

export async function getExcelHealth() {
  const requestUrl = `${API_BASE_URL}/api/excel/health?_ts=${Date.now()}`;
  const { response, data } = await fetchJson(requestUrl);

  if (!response.ok) {
    throw new ExcelApiError(
      data.error || 'Excel API health check failed',
      response.status,
      data.code || 'HEALTH_REQUEST_FAILED'
    );
  }

  return data;
}

export async function getExcelSourceInfo() {
  const requestUrl = `${API_BASE_URL}/api/excel/source?_ts=${Date.now()}`;
  const { response, data } = await fetchJson(requestUrl);

  if (!response.ok) {
    throw new ExcelApiError(
      data.error || 'Excel source request failed',
      response.status,
      data.code || 'SOURCE_REQUEST_FAILED'
    );
  }

  return data;
}

export async function getAuthStatus() {
  const response = await fetch(`${API_BASE_URL}/api/auth/status`);
  const data = await parseJson(response);

  if (!response.ok) {
    throw new ExcelApiError(
      data.error || 'Auth status request failed',
      response.status,
      data.code || 'AUTH_STATUS_FAILED'
    );
  }

  return data;
}

export async function getLoginUrl() {
  const response = await fetch(`${API_BASE_URL}/api/auth/login-url`);
  const data = await parseJson(response);

  if (!response.ok) {
    throw new ExcelApiError(
      data.error || 'Login URL request failed',
      response.status,
      data.code || 'AUTH_LOGIN_URL_FAILED'
    );
  }

  return data.url;
}

export { ExcelApiError };
