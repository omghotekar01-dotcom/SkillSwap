const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'fallbackUsers.json');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  } catch {
    return [];
  }
};

const protect = (req, res, next) => {
  const authHeader = String(req.headers.authorization || '').trim();
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authorization required' });
  const token = authHeader.slice(7).trim();
  if (!token) return res.status(401).json({ message: 'Authorization required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.id || String(u._id) === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { ...user };
    delete req.user.password;
    if (req.user.isActive === false) return res.status(403).json({ message: 'Account disabled' });
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ message });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authorization required' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
};

module.exports = { protect, adminOnly };
