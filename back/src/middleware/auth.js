const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'makina-masters-secret-key';

/**
 * Verify JWT from cookie and attach user to req.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require STAFF role.
 */
function requireStaff(req, res, next) {
  if (req.user.role !== 'STAFF') {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
}

module.exports = { authenticate, requireStaff };
