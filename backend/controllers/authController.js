const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const normalizeArray = value => Array.isArray(value)
  ? value.filter(Boolean)
  : String(value || '').split(',').map(s => s.trim()).filter(Boolean);

const normalizeObjects = (value, fields) => {
  if (!Array.isArray(value)) return [];
  return value.map(item => {
    if (!item || typeof item !== 'object') return null;
    const obj = {};
    fields.forEach(field => { obj[field] = String(item[field] || '').trim(); });
    return obj;
  }).filter(Boolean).filter(obj => Object.values(obj).some(val => val));
};

const register = async (req, res) => {
  try {
    const { name, email, password, college, skills } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const trimmedName = String(name || '').trim();
    const trimmedPassword = String(password || '');

    if (!trimmedName || !normalizedEmail || !trimmedPassword)
      return res.status(400).json({ message: 'Name, email, and password are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      return res.status(400).json({ message: 'Invalid email address' });
    if (trimmedPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.exists({ email: normalizedEmail }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: trimmedPassword,
      avatar: String(req.body.avatar || '').trim(),
      college: String(college || '').trim(),
      skills: Array.isArray(skills) ? skills : normalizeArray(skills),
      interests: normalizeArray(req.body.interests),
      semester: Number(req.body.semester) || 1,
      portfolioLinks: normalizeObjects(req.body.portfolioLinks, ['label', 'url']),
      achievements: normalizeObjects(req.body.achievements, ['title', 'description', 'year', 'link']).map(a => ({
        title: a.title,
        description: a.description,
        link: a.link,
        year: Number(a.year) || undefined
      })),
      projects: normalizeObjects(req.body.projects, ['title', 'description', 'link'])
    });
    res.status(201).json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const trimmedPassword = String(password || '');

    if (!normalizedEmail || !trimmedPassword)
      return res.status(400).json({ message: 'Email and password are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      return res.status(400).json({ message: 'Invalid email address' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.matchPassword(trimmedPassword)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isActive === false)
      return res.status(403).json({ message: 'Account disabled' });

    res.json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'skills', 'college', 'avatar', 'semester', 'interests', 'portfolioLinks', 'achievements', 'projects'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    if (updates.skills && !Array.isArray(updates.skills)) {
      updates.skills = normalizeArray(updates.skills);
    }
    if (updates.interests && !Array.isArray(updates.interests)) {
      updates.interests = normalizeArray(updates.interests);
    }
    if (updates.portfolioLinks && !Array.isArray(updates.portfolioLinks)) {
      updates.portfolioLinks = [];
    }
    if (updates.achievements && !Array.isArray(updates.achievements)) {
      updates.achievements = [];
    }
    if (updates.projects && !Array.isArray(updates.projects)) {
      updates.projects = [];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true
    }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(oldPassword)))
      return res.status(400).json({ message: 'Incorrect current password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };