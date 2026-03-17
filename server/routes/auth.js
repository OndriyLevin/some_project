import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cardly-secret-change-me-in-production';

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });
    }

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Имя пользователя: 3-30 символов, только a-z, 0-9, _, -' });
    }

    const lowerUsername = username.toLowerCase();

    // Check if email or username exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, lowerUsername);
    if (existing) {
      return res.status(409).json({ error: 'Email или имя пользователя уже заняты' });
    }

    // Hash password and create user
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)').run(email, lowerUsername, passwordHash);

    // Create empty card
    db.prepare('INSERT INTO cards (user_id, username) VALUES (?, ?)').run(result.lastInsertRowid, lowerUsername);

    // Generate token
    const token = jwt.sign({ userId: result.lastInsertRowid, username: lowerUsername }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, username: lowerUsername });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, username, created_at FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Токен истёк или невалиден' });
  }
});

export default router;
