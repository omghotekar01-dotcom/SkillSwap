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

const normalizeEmail = email => String(email || '').trim().toLowerCase();
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const signToken = id => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// Seed demo users when the fallback file is empty
try {
  const existing = readUsers();
  // Ensure demo users exist; only add them if missing to avoid repeatedly rewriting the file
  const users = existing || [];
  let changed = false;
  const ensurePresent = (email, name, pass, role) => {
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) {
      const hashed = bcrypt.hashSync(pass, 10);
      users.push({ id: String(Date.now()) + Math.floor(Math.random()*10000), name, email, password: hashed, role, college: 'Demo College', avatar: '', bio: `Demo ${role} account for testing`, skills: [] });
      changed = true;
    }
  };

  ensurePresent('student@demo.com', 'Demo Student', 'demo123', 'student');
  ensurePresent('admin@demo.com',   'Demo Admin',   'admin123', 'admin');
  if (changed) writeUsers(users);
} catch (e) {
  // if seeding fails, ignore and continue with empty list
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, skills, interests, semester } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = String(name || '').trim();
    const trimmedPassword = String(password || '');

    if (!trimmedName || !normalizedEmail || !trimmedPassword)
      return res.status(400).json({ message: 'Name, email, and password are required' });
    if (!isValidEmail(normalizedEmail))
      return res.status(400).json({ message: 'Invalid email address' });
    if (trimmedPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const users = readUsers();
    if (users.find(u => u.email === normalizedEmail))
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(trimmedPassword, 10);
    const genId = String(Date.now()) + Math.floor(Math.random() * 10000);
    const user = {
      id: genId,
      _id: genId,
      name: trimmedName,
      email: normalizedEmail,
      password: hashed,
      role: 'student',
      college: String(college || '').trim(),
      semester: Number(semester) || 1,
      interests: Array.isArray(interests) ? interests : String(interests || '').split(',').map(i => i.trim()).filter(Boolean),
      avatar: '',
      bio: '',
      skills: Array.isArray(skills) ? skills : String(skills || '').split(',').map(s => s.trim()).filter(Boolean)
    };
    users.push(user);
    writeUsers(users);
    const o = { ...user }; delete o.password;
    res.status(201).json({ token: signToken(user.id), user: o });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = String(password || '');

    if (!normalizedEmail || !trimmedPassword)
      return res.status(400).json({ message: 'Email and password are required' });
    if (!isValidEmail(normalizedEmail))
      return res.status(400).json({ message: 'Invalid email address' });

    const users = readUsers();
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isActive === false) return res.status(403).json({ message: 'Account disabled' });
    const ok = await bcrypt.compare(trimmedPassword, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const u = { ...user, _id: user._id || user.id };
    delete u.password;
    res.json({ token: signToken(user.id), user: u });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protect middleware for fallback
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authorization required' });
  const token = authHeader.slice(7).trim();
  if (!token) return res.status(401).json({ message: 'Authorization required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.id || String(u._id) === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isActive === false) return res.status(403).json({ message: 'Account disabled' });
    req.user = { ...user, _id: user._id || user.id };
    delete req.user.password;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/me', protect, (req, res) => {
  const u = { ...req.user, _id: req.user._id || req.user.id };
  res.json(u);
});

router.put('/profile', protect, (req, res) => {
  try {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    const allowed = ['name', 'bio', 'skills', 'college', 'avatar', 'semester', 'interests'];
    for (const k of Object.keys(req.body)) {
      if (!allowed.includes(k)) continue;
      if (k === 'skills' || k === 'interests') {
        users[idx][k] = Array.isArray(req.body[k]) ? req.body[k] : String(req.body[k]).split(',').map(v => v.trim()).filter(Boolean);
      } else {
        users[idx][k] = req.body[k];
      }
    }
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
