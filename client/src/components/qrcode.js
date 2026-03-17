/**
 * QR Code generator wrapper
 */
import QRCode from 'qrcode';

export async function renderQRCode(container, url) {
  try {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, url, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0a0a0f',
        light: '#ffffff',
      },
    });
    container.innerHTML = '';
    container.appendChild(canvas);
  } catch (err) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">QR недоступен</p>';
  }
}
