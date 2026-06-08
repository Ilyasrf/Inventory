const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'makina-masters-secret-key';

/* ── Redirect to 42 Intra OAuth ── */
router.get('/42', (_req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.INTRA_CLIENT_ID,
    redirect_uri: process.env.INTRA_REDIRECT_URI,
    response_type: 'code',
    scope: 'public',
  });
  res.redirect(`https://api.intra.42.fr/oauth/authorize?${params}`);
});

/* ── 42 OAuth callback ── */
router.get('/42/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/?error=no_code`);

    // Exchange code for access token
    const tokenRes = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.INTRA_CLIENT_ID,
        client_secret: process.env.INTRA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.INTRA_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${process.env.FRONTEND_URL}/?error=token_failed`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    // 42 users are always MEMBER — admin uses separate login
    const user = await prisma.user.upsert({
      where: { intraId: profile.id },
      update: {
        displayName: profile.displayname || profile.login,
        email: profile.email,
        avatar: profile.image?.link || profile.image?.versions?.medium || null,
        role: 'MEMBER',
      },
      create: {
        intraId: profile.id,
        login: profile.login,
        displayName: profile.displayname || profile.login,
        email: profile.email,
        avatar: profile.image?.link || profile.image?.versions?.medium || null,
        role: 'MEMBER',
      },
    });

    // Issue JWT cookie
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/catalog`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/?error=oauth_failed`);
  }
});

/* ── Admin login (name/email + password) ── */
router.post('/admin/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Support the legacy default admin credentials or DB
    const adminName = process.env.ADMIN_NAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.SMTP_USER || 'admin@makina-masters.local';

    let user = await prisma.user.findFirst({
      where: {
        role: 'STAFF',
        OR: [{ login: name }, { email: name }, { displayName: name }]
      }
    });

    if (user && user.password) {
      // Validate with bcrypt
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    } else if (name === adminName && password === adminPassword) {
      // Legacy fallback for the initial setup
      user = await prisma.user.upsert({
        where: { login: 'admin' },
        update: { displayName: adminName, role: 'STAFF', email: adminEmail },
        create: {
          intraId: 0,
          login: 'admin',
          displayName: adminName,
          email: adminEmail,
          role: 'STAFF',
        },
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: 'STAFF' }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(user);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ── Current user ── */
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

/* ── Logout ── */
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

/* ── List users (staff) ── */
router.get('/users', authenticate, async (req, res) => {
  if (req.user.role !== 'STAFF') return res.status(403).json({ error: 'Forbidden' });
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
});

/* ── Update role (staff) ── */
router.put('/users/:id/role', authenticate, async (req, res) => {
  if (req.user.role !== 'STAFF') return res.status(403).json({ error: 'Forbidden' });
  const { role } = req.body;
  if (!['MEMBER', 'STAFF'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: { role },
  });
  res.json(user);
});

module.exports = router;
