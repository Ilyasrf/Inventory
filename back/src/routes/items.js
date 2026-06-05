const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/* ── Multer config ── */
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
    cb(null, ok);
  },
});

/* ── GET all items ── */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};
    if (search) where.name = { contains: search };
    if (category && category !== 'All') where.category = category;

    const items = await prisma.item.findMany({ where, orderBy: { name: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/* ── GET single item ── */
router.get('/:id', authenticate, async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

/* ── POST create item (staff) ── */
router.post('/', authenticate, requireStaff, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, totalQuantity } = req.body;
    const item = await prisma.item.create({
      data: {
        name,
        description: description || '',
        category: category || 'Other',
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: parseInt(totalQuantity),
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/* ── PUT update item (staff) ── */
router.put('/:id', authenticate, requireStaff, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, totalQuantity, availableQuantity } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (totalQuantity !== undefined) data.totalQuantity = parseInt(totalQuantity);
    if (availableQuantity !== undefined) data.availableQuantity = parseInt(availableQuantity);
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    const item = await prisma.item.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/* ── DELETE item (staff) ── */
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
