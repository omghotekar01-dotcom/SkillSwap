const User = require('../models/User');
const Service = require('../models/Service');
const Note = require('../models/Note');
const Review = require('../models/Review');

const getStats = async (req, res) => {
  try {
    const [users, services, notes, reviews] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Note.countDocuments(),
      Review.countDocuments()
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email college createdAt');
    res.json({ users, services, notes, reviews, recentUsers });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (String(req.user._id || req.user.id) === String(user._id || user.id))
      return res.status(400).json({ message: 'Cannot modify your own account' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(req.user._id || req.user.id) === String(user._id || user.id))
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await user.remove();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    service.isActive = !service.isActive;
    await service.save();
    res.json({ isActive: service.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getStats, getUsers, toggleUser, deleteUser, getAllServices, toggleService, getAllNotes };