/**
 * vCard generator
 */

export function generateVCard(card) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name || ''}`,
    `TITLE:${card.title || ''}`,
    `NOTE:${card.bio || ''}`,
  ];

  if (card.phone) {
    lines.push(`TEL;TYPE=CELL:${card.phone}`);
  }

  if (card.email) {
    lines.push(`EMAIL:${card.email}`);
  }

  // Parse links for website
  if (card.links) {
    const links = typeof card.links === 'string' ? JSON.parse(card.links) : card.links;
    for (const link of links) {
      if (link.type === 'website' && link.url) {
        lines.push(`URL:${link.url}`);
      }
    }
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(card) {
  const vcardData = generateVCard(card);
  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${card.username || 'contact'}.vcf`;
  a.click();

  URL.revokeObjectURL(url);
}
