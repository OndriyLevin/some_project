/**
 * Home / Landing page
 */
import { renderNavbar, attachNavbarEvents } from '../components/navbar.js';
import { isLoggedIn } from '../utils/api.js';

export function renderHome(app) {
  const ctaHref = isLoggedIn() ? '#/editor' : '#/login';
  const ctaText = isLoggedIn() ? '<i class="ph-duotone ph-pencil-simple"></i> Мой редактор' : '<i class="ph-duotone ph-rocket"></i> Создать визитку';

  app.innerHTML = `
    ${renderNavbar()}

    <div class="container">
      <section class="hero">
        <h1 class="hero__title">
          Ваша <span class="text-gradient">цифровая визитка</span><br/>за 1 минуту
        </h1>
        <p class="hero__subtitle">
          Создайте стильную страницу с контактами, соцсетями и QR-кодом. 
          Работает на любом устройстве.
        </p>
        <div class="hero__cta">
          <a href="${ctaHref}" class="btn btn--primary btn--lg">${ctaText}</a>
          <a href="#demo-section" class="btn btn--secondary btn--lg">Как это работает?</a>
        </div>
      </section>

      <section class="features" id="demo-section">
        <div class="glass glass--static feature-card">
          <span class="feature-card__icon" style="color: #409cff;"><i class="ph-duotone ph-device-mobile"></i></span>
          <h3 class="feature-card__title">PWA</h3>
          <p class="feature-card__desc">Установите на телефон как обычное приложение. Работает оффлайн.</p>
        </div>
        <div class="glass glass--static feature-card">
          <span class="feature-card__icon" style="color: #34C759;"><i class="ph-duotone ph-link"></i></span>
          <h3 class="feature-card__title">Все ссылки</h3>
          <p class="feature-card__desc">Telegram, WhatsApp, Instagram, GitHub — всё в одном месте.</p>
        </div>
        <div class="glass glass--static feature-card">
          <span class="feature-card__icon" style="color: #7c6cfc;"><i class="ph-duotone ph-qr-code"></i></span>
          <h3 class="feature-card__title">QR-код</h3>
          <p class="feature-card__desc">Покажите QR с экрана или распечатайте на обычной визитке.</p>
        </div>
        <div class="glass glass--static feature-card">
          <span class="feature-card__icon" style="color: #FF9500;"><i class="ph-duotone ph-address-book"></i></span>
          <h3 class="feature-card__title">vCard</h3>
          <p class="feature-card__desc">Одно нажатие — и ваш контакт сохранён в телефоне собеседника.</p>
        </div>
      </section>

      <section style="text-align:center; padding: var(--space-2xl) 0;">
        <h2 style="margin-bottom: var(--space-md);">Готовы начать?</h2>
        <p class="text-secondary" style="margin-bottom: var(--space-xl);">Бесплатно. Без рекламы. Навсегда.</p>
        <a href="${ctaHref}" class="btn btn--primary btn--lg">${ctaText}</a>
      </section>

      <footer class="footer">
        <p>Cardly © 2026 — Сделано с <i class="ph-fill ph-heart" style="color: var(--primary); vertical-align: middle;"></i></p>
      </footer>
    </div>
  `;

  attachNavbarEvents();

  // Auto-scroll mobile carousel
  setTimeout(() => {
    const features = document.querySelector('.features');
    if (!features || window.innerWidth > 600) return;

    let currentIndex = 0;
    const cards = features.querySelectorAll('.feature-card');
    
    const interval = setInterval(() => {
      if (!document.querySelector('.features')) {
        clearInterval(interval);
        return;
      }
      const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(features).gap || 16);
      currentIndex++;
      if (currentIndex >= cards.length) {
        currentIndex = 0;
      }
      features.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
    }, 3500);

    features.addEventListener('touchstart', () => clearInterval(interval), { passive: true });
  }, 100);
}
