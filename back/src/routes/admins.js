const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/* ── GET all admins ── */
router.get('/', authenticate, requireStaff, async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        login: true,
        displayName: true,
        email: true,
        createdAt: true,
      },
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

/* ── POST create a new admin ── */
router.post('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { login: email }] }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // IntraId is set to a negative random number to avoid collision with real 42 IDs
    const intraId = -Math.floor(Math.random() * 1000000) - 1;

    const newAdmin = await prisma.user.create({
      data: {
        intraId,
        login: email, // use email as login for admins
        displayName: name,
        email,
        password: hashedPassword,
        role: 'STAFF',
      },
      select: {
        id: true,
        login: true,
        displayName: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(201).json(newAdmin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

/* ── DELETE an admin ── */
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    const adminId = parseInt(req.params.id);
    
    // Check if trying to delete self
    if (req.user.id === adminId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    
    if (!admin || admin.role !== 'STAFF') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Ensure we don't delete the last admin
    const adminCount = await prisma.user.count({ where: { role: 'STAFF' } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }

    await prisma.user.delete({ where: { id: adminId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

module.exports = router;
