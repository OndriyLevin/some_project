/**
 * Simple hash-based SPA router
 */

const routes = {};
let currentCleanup = null;

export function addRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function getParam(pattern, hash) {
  const patternParts = pattern.split('/');
  const hashParts = hash.split('/');
  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = hashParts[i];
    }
  }
  return params;
}

function matchRoute(hash) {
  // Exact match first
  if (routes[hash]) {
    return { handler: routes[hash], params: {} };
  }

  // Pattern match (e.g. /card/:username)
  for (const pattern in routes) {
    const patternParts = pattern.split('/');
    const hashParts = hash.split('/');

    if (patternParts.length !== hashParts.length) continue;

    let isMatch = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) continue;
      if (patternParts[i] !== hashParts[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { handler: routes[pattern], params: getParam(pattern, hash) };
    }
  }

  return null;
}

export function startRouter() {
  const handle = () => {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const match = matchRoute(hash);
    if (match) {
      app.innerHTML = '';
      app.className = 'page-enter';
      const result = match.handler(app, match.params);
      if (result && typeof result === 'function') {
        currentCleanup = result;
      }
    } else {
      app.innerHTML = `
        <div class="auth-page">
          <div class="glass auth-card">
            <h2>404</h2>
            <p class="text-secondary" style="margin-top:8px;">Страница не найдена</p>
            <a href="#/" class="btn btn--primary" style="margin-top:24px;">На главную</a>
          </div>
        </div>
      `;
    }
  };

  window.addEventListener('hashchange', handle);
  handle();
}
