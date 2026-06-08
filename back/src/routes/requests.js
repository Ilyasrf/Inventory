const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireStaff } = require('../middleware/auth');
const { sendMail } = require('../config/mailer');
const { newRequestEmail, statusUpdateEmail } = require('../emails/templates');

const router = express.Router();
const prisma = new PrismaClient();

/* ── GET requests ── */
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'STAFF' ? {} : { userId: req.user.id };
    const { status } = req.query;
    if (status && status !== 'ALL') where.status = status;

    const requests = await prisma.request.findMany({
      where,
      include: {
        user: { select: { id: true, login: true, displayName: true, avatar: true } },
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/* ── POST create request ── */
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectName, projectDescription, items } = req.body;

    if (!projectName || !items?.length) {
      return res.status(400).json({ error: 'Project name and at least one item required' });
    }

    // Validate availability
    for (const ri of items) {
      const item = await prisma.item.findUnique({ where: { id: ri.itemId } });
      if (!item) return res.status(400).json({ error: `Item ${ri.itemId} not found` });
      if (item.availableQuantity < ri.quantity) {
        return res.status(400).json({ error: `Not enough "${item.name}" available (${item.availableQuantity} left)` });
      }
    }

    const request = await prisma.request.create({
      data: {
        userId: req.user.id,
        projectName,
        projectDescription: projectDescription || '',
        items: {
          create: items.map((ri) => ({ itemId: ri.itemId, quantity: ri.quantity })),
        },
      },
      include: { items: { include: { item: true } }, user: true },
    });

    // Notify all staff via email
    const staffUsers = await prisma.user.findMany({ where: { role: 'STAFF' } });
    for (const staff of staffUsers) {
      await sendMail({
        to: staff.email,
        subject: `New Request from ${req.user.displayName}`,
        html: newRequestEmail(request),
      });
    }

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

/* ── PUT mark requests as seen (member) ── */
router.put('/seen', authenticate, async (req, res) => {
  try {
    await prisma.request.updateMany({
      where: {
        userId: req.user.id,
        userSeen: false,
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      data: { userSeen: true }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark requests as seen' });
  }
});

/* ── PUT update request status (staff) ── */
router.put('/:id/status', authenticate, requireStaff, async (req, res) => {
  try {
    const { status, staffNote } = req.body;
    if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await prisma.request.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: { include: { item: true } }, user: true },
    });
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    // Update inventory quantities
    if (status === 'APPROVED' && existing.status === 'PENDING') {
      for (const ri of existing.items) {
        await prisma.item.update({
          where: { id: ri.itemId },
          data: { availableQuantity: { decrement: ri.quantity } },
        });
      }
    } else if (status === 'RETURNED' && existing.status === 'APPROVED') {
      for (const ri of existing.items) {
        await prisma.item.update({
          where: { id: ri.itemId },
          data: { availableQuantity: { increment: ri.quantity } },
        });
      }
    }

    const updated = await prisma.request.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status, 
        staffNote: staffNote || null,
        processedBy: req.user.displayName,
        userSeen: false,
      },
      include: { items: { include: { item: true } }, user: true },
    });

    // Notify member
    await sendMail({
      to: updated.user.email,
      subject: `Request ${status.toLowerCase()} – Makina Masters`,
      html: statusUpdateEmail(updated),
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

module.exports = router;
