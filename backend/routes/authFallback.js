const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'fallbackUsers.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
const writeUsers = (u) => fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2));

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
    const users = readUsers();
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: String(Date.now()), name, email, password: hashed, role: 'student', college: college || '', avatar: '', bio: '', skills: [] };
    users.push(user);
    writeUsers(users);
    res.status(201).json({ token: signToken(user.id), user: (() => { const o = { ...user }; delete o.password; return o; })() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const u = { ...user }; delete u.password;
    res.json({ token: signToken(user.id), user: u });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protect middleware for fallback
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const users = readUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { ...user }; delete req.user.password;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/me', protect, (req, res) => res.json(req.user));

router.put('/profile', protect, (req, res) => {
  try {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    const allowed = ['name', 'bio', 'skills', 'college', 'avatar'];
    for (const k of Object.keys(req.body)) if (allowed.includes(k)) users[idx][k] = req.body[k];
    writeUsers(users);
    const u = { ...users[idx] }; delete u.password;
    res.json(u);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(oldPassword, users[idx].password);
    if (!match) return res.status(400).json({ message: 'Incorrect current password' });
    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
