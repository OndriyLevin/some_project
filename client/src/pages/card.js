/**
 * Public Card page
 */
import { renderQRCode } from '../components/qrcode.js';
import { downloadVCard } from '../components/vcard.js';

const SOCIAL_ICONS = {
  telegram: '<i class="ph-fill ph-telegram-logo"></i>',
  whatsapp: '<i class="ph-fill ph-whatsapp-logo"></i>',
  instagram: '<i class="ph-fill ph-instagram-logo"></i>',
  vk: '<i class="ph-fill ph-users"></i>',
  github: '<i class="ph-fill ph-github-logo"></i>',
  linkedin: '<i class="ph-fill ph-linkedin-logo"></i>',
  youtube: '<i class="ph-fill ph-youtube-logo"></i>',
  twitter: '<i class="ph-fill ph-twitter-logo"></i>',
  website: '<i class="ph-fill ph-globe"></i>',
  email: '<i class="ph-fill ph-envelope-simple"></i>',
  phone: '<i class="ph-fill ph-phone"></i>',
};

const SOCIAL_LABELS = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  vk: 'VKontakte',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'Twitter/X',
  website: 'Сайт',
};

export function renderCard(app, params) {
  const { username } = params;

  app.innerHTML = `
    <div class="card-page">
      <div style="text-align:center;">
        <span class="spinner"></span>
        <p class="text-secondary" style="margin-top:var(--space-md);">Загрузка визитки...</p>
      </div>
    </div>
  `;

  loadCard(app, username);
}

async function loadCard(app, username) {
  try {
    const res = await fetch(`/api/cards/${username}`);
    const data = await res.json();

    if (!res.ok) {
      app.innerHTML = `
        <div class="card-page">
          <div class="glass" style="text-align:center;padding:var(--space-2xl);max-width:400px;">
            <h2 style="font-size:3rem;margin-bottom:var(--space-md);"><i class="ph-duotone ph-smiley-sad" style="color: #FF6961;"></i></h2>
            <h3>Визитка не найдена</h3>
            <p class="text-secondary" style="margin-top:var(--space-sm);">Пользователь <strong>${username}</strong> не существует</p>
            <a href="#/" class="btn btn--primary" style="margin-top:var(--space-xl);">На главную</a>
          </div>
        </div>
      `;
      return;
    }

    const card = data.card;
    const links = card.links ? JSON.parse(card.links) : [];

    const avatarSrc = card.avatar ? `/uploads/${card.avatar}` : 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <rect width="256" height="256" fill="#1a1a2e"/>
        <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" fill="#7c5cfc"/>
      </svg>
    `);

    // Build contact links (phone + email)
    const contactLinks = [];
    if (card.phone) {
      contactLinks.push({ type: 'phone', url: `tel:${card.phone}`, label: card.phone });
    }
    if (card.email) {
      contactLinks.push({ type: 'email', url: `mailto:${card.email}`, label: card.email });
    }

    // Build social links HTML
    const allLinks = [...contactLinks.map(l => ({ ...l, type: l.type })), ...links.filter(l => l.url)];
    
    const socialLinksHtml = allLinks.map(link => {
      const icon = SOCIAL_ICONS[link.type] || '<i class="ph-duotone ph-link"></i>';
      const label = link.label || SOCIAL_LABELS[link.type] || link.type;
      return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
           class="social-link social-link--${link.type}">
          <span>${icon}</span>
          <span>${label}</span>
        </a>
      `;
    }).join('');

    app.innerHTML = `
      <div class="card-page">
        <div class="glass card-profile">
          <img class="avatar avatar--lg" src="${avatarSrc}" alt="${card.name || 'Avatar'}" 
               style="margin:0 auto;border-color:var(--accent);" />
          
          <h1 class="card-profile__name">${card.name || username}</h1>
          ${card.title ? `<p class="card-profile__title">${card.title}</p>` : ''}
          ${card.bio ? `<p class="card-profile__bio">${card.bio}</p>` : ''}

          ${allLinks.length > 0 ? `
            <div class="card-links-list">
              ${socialLinksHtml}
            </div>
          ` : ''}

          <div class="card-links-list" style="margin-top:var(--space-sm);">
            <button class="btn btn--primary btn--block" id="download-vcard">
              <i class="ph-duotone ph-address-book"></i> Сохранить контакт
            </button>
            <button class="btn btn--secondary btn--block" id="share-btn">
              <i class="ph-duotone ph-share-network"></i> Поделиться
            </button>
          </div>

          <div class="card-profile__qr" id="qr-container">
            <span class="spinner"></span>
          </div>
          <p class="text-muted" style="margin-top:var(--space-sm);font-size:0.75rem;">
            Сканируйте — контакт сохранится в телефон
          </p>

          <div class="footer" style="border:none;margin-top:var(--space-xl);padding-bottom:0;">
            <a href="#/" class="text-muted" style="font-size:0.75rem;">
              Сделано на <span class="text-gradient" style="font-weight:700;">Cardly</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // QR code → vCard download endpoint (scan = save contact)
    const vcardUrl = `${window.location.origin}/api/cards/${username}/vcard`;
    const qrContainer = document.getElementById('qr-container');
    renderQRCode(qrContainer, vcardUrl);

    // Download vCard button
    document.getElementById('download-vcard').addEventListener('click', () => {
      window.location.href = `/api/cards/${username}/vcard`;
    });

    // Share button
    document.getElementById('share-btn').addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${card.name || username} — Цифровая визитка`,
            url: cardUrl,
          });
        } catch (e) {
          // User cancelled or share failed
        }
      } else {
        await navigator.clipboard.writeText(cardUrl);
        const btn = document.getElementById('share-btn');
        btn.innerHTML = '<i class="ph-fill ph-check-circle"></i> Скопировано!';
        setTimeout(() => { btn.innerHTML = '<i class="ph ph-share-network"></i> Поделиться'; }, 2000);
      }
    });

  } catch (err) {
    app.innerHTML = `
      <div class="card-page">
        <div class="glass" style="text-align:center;padding:var(--space-2xl);max-width:400px;">
          <h2><i class="ph-duotone ph-warning" style="color: #FF9500;"></i> Ошибка загрузки</h2>
          <p class="text-secondary" style="margin-top:var(--space-sm);">${err.message}</p>
          <a href="#/" class="btn btn--primary" style="margin-top:var(--space-xl);">На главную</a>
        </div>
      </div>
    `;
  }
}
