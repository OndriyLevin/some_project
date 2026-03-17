/**
 * Theme toggle utility
 */

const STORAGE_KEY = 'cardly_theme';

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}

// Apply saved theme on load
export function initTheme() {
  setTheme(getTheme());
}
