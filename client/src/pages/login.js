/**
 * Login / Register page
 */
import { api, setToken, isLoggedIn } from '../utils/api.js';
import { showToast } from '../utils/toast.js';
import { navigateTo } from '../router.js';

export function renderLogin(app) {
  // Redirect if already logged in
  if (isLoggedIn()) {
    navigateTo('/editor');
    return;
  }

  let isRegisterMode = false;

  function render() {
    app.innerHTML = `
      <div class="auth-page">
        <div class="glass auth-card">
          <a href="#/" class="navbar__logo" style="display:block;margin-bottom:var(--space-xl);">
            <span class="text-gradient" style="font-size:1.5rem;font-weight:800;">Cardly</span>
          </a>
          <h2 class="auth-card__title">${isRegisterMode ? 'Создать аккаунт' : 'Войти'}</h2>
          <p class="auth-card__subtitle">${isRegisterMode ? 'Зарегистрируйтесь, чтобы создать визитку' : 'Рады видеть вас снова!'}</p>
          
          <form id="auth-form">
            ${isRegisterMode ? `
              <div class="form-group">
                <label class="form-label" for="username">Имя пользователя</label>
                <input class="form-input" type="text" id="username" name="username" 
                  placeholder="ivan" required minlength="3" maxlength="30"
                  pattern="[a-zA-Z0-9_-]+" title="Только латинские буквы, цифры, _ и -" />
              </div>
            ` : ''}
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input class="form-input" type="email" id="email" name="email" 
                placeholder="ivan@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Пароль</label>
              <input class="form-input" type="password" id="password" name="password" 
                placeholder="Минимум 6 символов" required minlength="6" />
            </div>
            <button type="submit" class="btn btn--primary btn--block btn--lg" id="submit-btn">
              ${isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <p class="auth-card__toggle">
            ${isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            <a id="toggle-mode">${isRegisterMode ? 'Войти' : 'Зарегистрироваться'}</a>
          </p>
        </div>
      </div>
    `;

    // Toggle mode
    document.getElementById('toggle-mode').addEventListener('click', (e) => {
      e.preventDefault();
      isRegisterMode = !isRegisterMode;
      render();
    });

    // Form submit
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        if (isRegisterMode) {
          const username = document.getElementById('username').value.trim().toLowerCase();
          const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username }),
          });
          setToken(data.token);
          showToast('Аккаунт создан! <i class="ph-fill ph-confetti" style="color: #FF9500;"></i>');
        } else {
          const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          setToken(data.token);
          showToast('Добро пожаловать! <i class="ph-fill ph-hand-waving" style="color: #FFD43B;"></i>');
        }
        navigateTo('/editor');
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = isRegisterMode ? 'Зарегистрироваться' : 'Войти';
      }
    });
  }

  render();
}
