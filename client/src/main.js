import './styles/index.css';
import { addRoute, startRouter } from './router.js';
import { renderHome } from './pages/home.js';
import { renderLogin } from './pages/login.js';
import { renderEditor } from './pages/editor.js';
import { renderCard } from './pages/card.js';
import { initTheme } from './utils/theme.js';

// Apply saved theme before anything renders
initTheme();

// Register routes
addRoute('/', renderHome);
addRoute('/login', renderLogin);
addRoute('/editor', renderEditor);
addRoute('/card/:username', renderCard);

// Start the router
startRouter();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
