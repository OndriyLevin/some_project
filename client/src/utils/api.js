/**
 * API utility with JWT auth
 */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('cardly_token');
}

export function setToken(token) {
  localStorage.setItem('cardly_token', token);
}

export function removeToken() {
  localStorage.removeItem('cardly_token');
}

export function isLoggedIn() {
  return !!getToken();
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Произошла ошибка');
  }

  return data;
}
