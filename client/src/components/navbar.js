/**
 * Navbar component with theme toggle
 */
import { isLoggedIn, removeToken } from '../utils/api.js';
import { getTheme, toggleTheme } from '../utils/theme.js';

export function renderNavbar() {
  const loggedIn = isLoggedIn();
  const theme = getTheme();
  const icon = theme === 'dark' ? '<i class="ph-fill ph-moon" style="color: #F6F1D5;"></i>' : '<i class="ph-fill ph-sun" style="color: #FFD43B;"></i>';

  return `
    <nav class="navbar">
      <div class="navbar__inner">
        <a href="#/" class="navbar__logo">
          <span class="text-gradient">Cardly</span>
        </a>
        <div class="navbar__actions">
          <div class="theme-toggle" id="theme-toggle" title="Переключить тему">
            <div class="theme-toggle__knob" id="theme-icon">${icon}</div>
          </div>
          ${loggedIn ? `
            <a href="#/editor" class="btn btn--ghost"><i class="ph-duotone ph-pencil-simple"></i> Редактор</a>
            <button class="btn btn--ghost" id="logout-btn"><i class="ph-duotone ph-sign-out"></i> Выйти</button>
          ` : `
            <a href="#/login" class="btn btn--primary">Войти</a>
          `}
        </div>
      </div>
    </nav>
  `;
}

export function attachNavbarEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeToken();
      window.location.hash = '#/';
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = toggleTheme();
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.innerHTML = newTheme === 'dark' ? '<i class="ph-fill ph-moon" style="color: #F6F1D5;"></i>' : '<i class="ph-fill ph-sun" style="color: #FFD43B;"></i>';
      }
    });
  }
}
