import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cardly-secret-change-me-in-production';

// Middleware to verify JWT
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Токен истёк или невалиден' });
  }
}

// Get current user's card
router.get('/my', authenticate, (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE user_id = ?').get(req.user.userId);
    res.json({ card: card || null });
  } catch (err) {
    console.error('Get card error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Update current user's card
router.put('/my', authenticate, (req, res) => {
  try {
    const { name, title, bio, phone, email, avatar, links } = req.body;

    const existing = db.prepare('SELECT * FROM cards WHERE user_id = ?').get(req.user.userId);

    if (existing) {
      db.prepare(`
        UPDATE cards SET 
          name = ?, title = ?, bio = ?, phone = ?, email = ?, avatar = ?, links = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        name || '', title || '', bio || '', phone || '', email || '',
        avatar || existing.avatar || '', links || '[]',
        req.user.userId
      );
    } else {
      db.prepare(`
        INSERT INTO cards (user_id, username, name, title, bio, phone, email, avatar, links)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.userId, req.user.username,
        name || '', title || '', bio || '', phone || '', email || '',
        avatar || '', links || '[]'
      );
    }

    const card = db.prepare('SELECT * FROM cards WHERE user_id = ?').get(req.user.userId);
    res.json({ card });
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Download vCard file by username
router.get('/:username/vcard', (req, res) => {
  try {
    const { username } = req.params;
    const card = db.prepare('SELECT * FROM cards WHERE username = ?').get(username.toLowerCase());

    if (!card) {
      return res.status(404).send('Not found');
    }

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.name || username}`,
    ];

    if (card.title) lines.push(`TITLE:${card.title}`);
    if (card.bio) lines.push(`NOTE:${card.bio}`);
    if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
    if (card.email) lines.push(`EMAIL:${card.email}`);

    // Add website links
    if (card.links) {
      try {
        const links = JSON.parse(card.links);
        for (const link of links) {
          if (link.url) {
            lines.push(`URL:${link.url}`);
          }
        }
      } catch {}
    }

    lines.push('END:VCARD');

    const vcfContent = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${username}.vcf"`);
    res.send(vcfContent);
  } catch (err) {
    console.error('vCard download error:', err);
    res.status(500).send('Server error');
  }
});

// Get public card by username
router.get('/:username', (req, res) => {
  try {
    const { username } = req.params;
    const card = db.prepare('SELECT username, name, title, bio, avatar, phone, email, links, theme FROM cards WHERE username = ?').get(username.toLowerCase());

    if (!card) {
      return res.status(404).json({ error: 'Визитка не найдена' });
    }

    res.json({ card });
  } catch (err) {
    console.error('Get public card error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
