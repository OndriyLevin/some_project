/**
 * Card Editor page
 */
import { renderNavbar, attachNavbarEvents } from '../components/navbar.js';
import { api, isLoggedIn } from '../utils/api.js';
import { showToast } from '../utils/toast.js';
import { navigateTo } from '../router.js';
import { renderQRCode } from '../components/qrcode.js';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

const SOCIAL_TYPES = [
  { value: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/79991234567' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { value: 'vk', label: 'VK', placeholder: 'https://vk.com/username' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { value: 'twitter', label: 'Twitter/X', placeholder: 'https://x.com/username' },
  { value: 'website', label: 'Сайт', placeholder: 'https://example.com' },
];

export function renderEditor(app) {
  if (!isLoggedIn()) {
    navigateTo('/login');
    return;
  }

  let card = {
    username: '',
    name: '',
    title: '',
    bio: '',
    phone: '',
    email: '',
    avatar: '',
    links: [],
  };

  let isLoading = true;
  let isSaving = false;
  let cropperInstance = null;

  async function loadCard() {
    try {
      const data = await api('/cards/my');
      if (data.card) {
        card = {
          ...data.card,
          links: data.card.links ? JSON.parse(data.card.links) : [],
        };
      }
    } catch (err) {
      // No card yet — that's fine
    }
    isLoading = false;
    render();
  }

  function render() {
    const linksHtml = card.links.map((link, i) => {
      const typeDef = SOCIAL_TYPES.find(t => t.value === link.type) || SOCIAL_TYPES[0];
      return `
      <div class="link-item">
        <select data-index="${i}" class="link-type-select form-input" style="padding-right:32px; cursor:pointer;">
          ${SOCIAL_TYPES.map(t => `
            <option value="${t.value}" ${t.value === link.type ? 'selected' : ''}>${t.label}</option>
          `).join('')}
        </select>
        <input class="form-input link-url-input" data-index="${i}" 
          placeholder="${typeDef.placeholder}" value="${link.url || ''}" />
        <button class="btn--remove" data-index="${i}" title="Удалить">✕</button>
      </div>
    `}).join('');

    const avatarSrc = card.avatar ? `/uploads/${card.avatar}` : 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <rect width="256" height="256" fill="#1a1a2e"/>
        <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" fill="#7c5cfc"/>
      </svg>
    `);

    app.innerHTML = `
      ${renderNavbar()}
      <div class="container editor">
        <h2 style="margin-bottom:var(--space-lg);"><i class="ph-duotone ph-pencil-simple" style="color: var(--accent);"></i> Редактор визитки</h2>

        ${card.username ? `
          <div class="editor__preview-link">
            <i class="ph-duotone ph-link" style="color: var(--accent-light);"></i> Ваша визитка: <a href="#/card/${card.username}" target="_blank">${location.origin}/#/card/${card.username}</a>
          </div>
        ` : ''}

        ${isLoading ? `
          <div style="text-align:center;padding:var(--space-3xl) 0;">
            <span class="spinner"></span>
          </div>
        ` : `
          <form id="editor-form">
            <div class="glass editor__section">
              <h3 class="editor__section-title"><i class="ph-duotone ph-user" style="color: var(--accent);"></i> Основная информация</h3>
              
              <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-md);">
                <div class="avatar-upload">
                  <img class="avatar avatar--lg" src="${avatarSrc}" alt="Аватар" id="avatar-preview" />
                  <div class="avatar-upload__icon"><i class="ph-fill ph-camera"></i></div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" id="avatar-input" />
                </div>
                <div style="flex:1;">
                  <div class="form-group">
                    <label class="form-label" for="name">Имя</label>
                    <input class="form-input" id="name" value="${card.name || ''}" placeholder="Иван Петров" />
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label" for="title">Должность / роль</label>
                    <input class="form-input" id="title" value="${card.title || ''}" placeholder="UX-дизайнер" />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="bio">О себе</label>
                <textarea class="form-input" id="bio" rows="3" placeholder="Пара слов о себе...">${card.bio || ''}</textarea>
              </div>
            </div>

            <div class="glass editor__section">
              <h3 class="editor__section-title"><i class="ph-duotone ph-phone" style="color: #34C759;"></i> Контакты</h3>
              <div class="form-group">
                <label class="form-label" for="phone">Телефон</label>
                <input class="form-input" id="phone" type="tel" value="${card.phone || ''}" placeholder="+7 999 123-45-67" />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="contact-email">Email</label>
                <input class="form-input" id="contact-email" type="email" value="${card.email || ''}" placeholder="ivan@example.com" />
              </div>
            </div>

            <div class="glass editor__section">
              <h3 class="editor__section-title"><i class="ph-duotone ph-link" style="color: var(--accent-light);"></i> Ссылки на соцсети</h3>
              <div class="link-items" id="link-items">
                ${linksHtml}
              </div>
              <button type="button" class="btn btn--secondary" id="add-link-btn" style="margin-top:var(--space-md);">
                + Добавить ссылку
              </button>
            </div>

            <button type="submit" class="btn btn--primary btn--block btn--lg" id="save-btn">
              <i class="ph-duotone ph-floppy-disk"></i> Сохранить визитку
            </button>

            ${card.username ? `
              <div class="glass glass--static editor__section" style="margin-top:var(--space-md);text-align:center;">
                <h3 class="editor__section-title" style="justify-content:center;"><i class="ph-duotone ph-share-network" style="color: #7c6cfc;"></i> QR-код для шеринга</h3>
                <p class="text-secondary" style="font-size:0.85rem;margin-bottom:var(--space-md);">
                  Этот QR ведёт на вашу визитку
                </p>
                <div class="card-profile__qr" id="editor-qr" style="margin:0 auto;">
                  <span class="spinner"></span>
                </div>
                <p class="text-muted" style="margin-top:var(--space-sm);font-size:0.75rem;">
                  ${location.origin}/#/card/${card.username}
                </p>
              </div>
            ` : ''}
          </form>
        `}
      </div>

      <!-- Avatar Cropper Modal -->
      <div class="modal-overlay" id="cropper-modal">
        <div class="modal-content">
          <h3 style="margin-bottom:var(--space-md); text-align:center;"><i class="ph-duotone ph-crop" style="color: var(--accent);"></i> Обрезка фото</h3>
          <div class="cropper-container-wrapper">
            <img id="cropper-image" src="" alt="Обрезаемое фото" style="max-width: 100%; display: block;" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--secondary" id="cropper-cancel-btn">Отмена</button>
            <button type="button" class="btn btn--primary" id="cropper-apply-btn">Применить</button>
          </div>
        </div>
      </div>
    `;

    attachNavbarEvents();
    if (!isLoading) {
      attachEditorEvents();
      // Render QR code for page link in editor
      const editorQr = document.getElementById('editor-qr');
      if (editorQr && card.username) {
        const pageUrl = `${window.location.origin}/#/card/${card.username}`;
        renderQRCode(editorQr, pageUrl);
      }
    }
  }

  function attachEditorEvents() {
    // Avatar upload & cropping
    const avatarInput = document.getElementById('avatar-input');
    const cropperModal = document.getElementById('cropper-modal');
    const cropperImage = document.getElementById('cropper-image');
    const btnCancelCrop = document.getElementById('cropper-cancel-btn');
    const btnApplyCrop = document.getElementById('cropper-apply-btn');

    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          showToast('Файл слишком большой (макс 2MB)', 'error');
          avatarInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          cropperImage.src = event.target.result;
          cropperModal.classList.add('active');

          if (cropperInstance) {
            cropperInstance.destroy();
          }

          // Delay initialization so CSS transitions finish and dimensions are computed
          setTimeout(() => {
            cropperInstance = new Cropper(cropperImage, {
              aspectRatio: 1, // enforce 1:1 for perfect circle avatars
              viewMode: 1,
              dragMode: 'move',
              autoCropArea: 0.8,
              restore: false,
              guides: false, // Turn off guides to clean up the UI
              center: false,
              highlight: false,
              cropBoxMovable: true,
              cropBoxResizable: true,
              toggleDragModeOnDblclick: false,
              ready() {
                // Apply circular mask via reliable selectors
                const wrapper = document.querySelector('.cropper-container-wrapper');
                if (!wrapper) return;
                
                const face = wrapper.querySelector('.cropper-face');
                if (face) {
                  face.style.borderRadius = '50%';
                  face.style.border = '2px solid rgba(255, 255, 255, 0.8)';
                  face.style.boxShadow = '0 0 0 9999px rgba(10, 10, 15, 0.85)';
                }
                const viewBox = wrapper.querySelector('.cropper-view-box');
                if (viewBox) {
                  viewBox.style.borderRadius = '50%';
                  viewBox.style.outline = 'none';
                }
              }
            });
          }, 150);
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnCancelCrop) {
      btnCancelCrop.addEventListener('click', () => {
        closeCropper();
      });
    }

    if (btnApplyCrop) {
      btnApplyCrop.addEventListener('click', () => {
        if (!cropperInstance) return;

        const btn = btnApplyCrop;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;

        cropperInstance.getCroppedCanvas({
          width: 500,
          height: 500,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        }).toBlob(async (blob) => {
          if (!blob) {
            showToast('Ошибка при обрезке', 'error');
            closeCropper();
            return;
          }

          // Random filename for Blob
          const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('avatar', file);

          try {
            const data = await api('/upload/avatar', {
              method: 'POST',
              body: formData,
            });
            card.avatar = data.filename;
            document.getElementById('avatar-preview').src = `/uploads/${data.filename}`;
            showToast('Аватар обновлен! <i class="ph-duotone ph-camera"></i>');
          } catch (err) {
            showToast(err.message, 'error');
          } finally {
            closeCropper();
            btn.textContent = 'Применить';
            btn.disabled = false;
          }
        }, 'image/jpeg', 0.9);
      });
    }

    function closeCropper() {
      cropperModal.classList.remove('active');
      if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
      }
      if (avatarInput) avatarInput.value = ''; // Reset input so same file can be selected again
      cropperImage.src = '';
    }

    // Add link
    document.getElementById('add-link-btn')?.addEventListener('click', () => {
      card.links.push({ type: 'telegram', url: '' });
      render();
    });

    // Remove link
    document.querySelectorAll('.btn--remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        card.links.splice(idx, 1);
        render();
      });
    });

    // Link type change
    document.querySelectorAll('.link-type-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const newValue = e.target.value;
        card.links[idx].type = newValue;
        
        // Update placeholder immediately
        const typeDef = SOCIAL_TYPES.find(t => t.value === newValue);
        if (typeDef) {
          const input = document.querySelector(`.link-url-input[data-index="${idx}"]`);
          if (input) input.placeholder = typeDef.placeholder;
        }
      });
    });

    // Link URL change
    document.querySelectorAll('.link-url-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        card.links[idx].url = e.target.value;
      });
    });

    // Save form
    document.getElementById('editor-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('save-btn');
      if (isSaving) return;
      isSaving = true;
      btn.innerHTML = '<span class="spinner"></span>';

      // Collect values from inputs
      card.name = document.getElementById('name').value.trim();
      card.title = document.getElementById('title').value.trim();
      card.bio = document.getElementById('bio').value.trim();
      card.phone = document.getElementById('phone').value.trim();
      card.email = document.getElementById('contact-email').value.trim();

      try {
        await api('/cards/my', {
          method: 'PUT',
          body: JSON.stringify({
            name: card.name,
            title: card.title,
            bio: card.bio,
            phone: card.phone,
            email: card.email,
            avatar: card.avatar,
            links: JSON.stringify(card.links),
          }),
        });
        showToast('Визитка сохранена! <i class="ph-fill ph-check-circle" style="color: #34C759;"></i>');
        render();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        isSaving = false;
      }
    });
  }

  render();
  loadCard();
}
