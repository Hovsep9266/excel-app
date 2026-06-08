const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '.auth-tokens.json');

const tokenCache = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
  account: null,
  state: '',
  stateExpiresAt: 0,
};

function loadTokenCache() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf8');
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;

    tokenCache.accessToken = saved.accessToken || '';
    tokenCache.refreshToken = saved.refreshToken || '';
    tokenCache.expiresAt = Number(saved.expiresAt || 0);
    tokenCache.account = saved.account || null;
  } catch (error) {
    // Ignore missing or invalid token cache.
  }
}

function persistTokenCache() {
  try {
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify({
        accessToken: tokenCache.accessToken,
        refreshToken: tokenCache.refreshToken,
        expiresAt: tokenCache.expiresAt,
        account: tokenCache.account,
      }),
      'utf8'
    );
  } catch (error) {
    // Ignore token persistence failures.
  }
}

loadTokenCache();

function createAuthError(message, statusCode = 500, code = 'AUTH_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function getTenantId() {
  return process.env.MS_TENANT_ID || 'common';
}

function getRedirectUri() {
  if (process.env.MS_REDIRECT_URI) {
    return process.env.MS_REDIRECT_URI;
  }
  const port = process.env.PORT || 4000;
  return `http://localhost:${port}/api/auth/callback`;
}

function getScopes() {
  return process.env.MS_SCOPES || 'offline_access openid profile Files.Read User.Read';
}

function ensureAuthConfig() {
  const clientId = process.env.MS_CLIENT_ID;
  if (!clientId) {
    throw createAuthError('Missing MS_CLIENT_ID in server .env.', 500, 'AUTH_CONFIG_MISSING');
  }
}

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

function buildAuthorizeUrl() {
  ensureAuthConfig();
  const state = crypto.randomBytes(16).toString('hex');
  tokenCache.state = state;
  tokenCache.stateExpiresAt = Date.now() + 10 * 60 * 1000;

  const params = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    response_mode: 'query',
    scope: getScopes(),
    state,
    prompt: 'select_account',
  });

  return `https://login.microsoftonline.com/${getTenantId()}/oauth2/v2.0/authorize?${params.toString()}`;
}

async function exchangeToken(formData) {
  const tokenUrl = `https://login.microsoftonline.com/${getTenantId()}/oauth2/v2.0/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  const payload = await response.json();

  if (!response.ok) {
    const details = payload.error_description || payload.error || 'unknown_auth_error';
    throw createAuthError(`Microsoft token error: ${details}`, 401, 'AUTH_TOKEN_REQUEST_FAILED');
  }

  return payload;
}

function saveTokens(payload) {
  const now = Date.now();
  tokenCache.accessToken = payload.access_token || '';
  tokenCache.refreshToken = payload.refresh_token || tokenCache.refreshToken;
  tokenCache.expiresAt = now + Number(payload.expires_in || 3600) * 1000;
  const claims = payload.id_token ? decodeJwtPayload(payload.id_token) : null;
  tokenCache.account = claims
    ? {
      name: claims.name || '',
      username: claims.preferred_username || claims.upn || '',
    }
    : tokenCache.account;
  persistTokenCache();
}

async function handleAuthCallback({ code, state }) {
  ensureAuthConfig();

  if (!code) {
    throw createAuthError('Authorization code is missing.', 400, 'AUTH_CODE_MISSING');
  }

  if (!state || state !== tokenCache.state || Date.now() > tokenCache.stateExpiresAt) {
    throw createAuthError('OAuth state is invalid or expired.', 400, 'AUTH_STATE_INVALID');
  }

  const formData = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    scope: getScopes(),
  });

  if (process.env.MS_CLIENT_SECRET) {
    formData.set('client_secret', process.env.MS_CLIENT_SECRET);
  }

  const payload = await exchangeToken(formData);
  saveTokens(payload);
  tokenCache.state = '';
  tokenCache.stateExpiresAt = 0;
  return getAuthStatus();
}

async function refreshAccessToken() {
  ensureAuthConfig();
  if (!tokenCache.refreshToken) {
    throw createAuthError(
      'User login required. Open /api/auth/login first.',
      401,
      'AUTH_LOGIN_REQUIRED'
    );
  }

  const formData = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: tokenCache.refreshToken,
    redirect_uri: getRedirectUri(),
    scope: getScopes(),
  });

  if (process.env.MS_CLIENT_SECRET) {
    formData.set('client_secret', process.env.MS_CLIENT_SECRET);
  }

  const payload = await exchangeToken(formData);
  saveTokens(payload);
  return tokenCache.accessToken;
}

async function getAccessToken() {
  ensureAuthConfig();
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.accessToken;
  }
  return refreshAccessToken();
}

function getAuthStatus() {
  const authenticated = Boolean(tokenCache.accessToken && tokenCache.expiresAt > Date.now());
  return {
    ok: true,
    authenticated,
    account: tokenCache.account,
    expiresAt: tokenCache.expiresAt || 0,
  };
}

module.exports = {
  buildAuthorizeUrl,
  createAuthError,
  getAccessToken,
  getAuthStatus,
  handleAuthCallback,
};
