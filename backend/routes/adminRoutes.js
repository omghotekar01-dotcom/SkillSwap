const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats, getUsers, toggleUser, deleteUser,
  getAllServices, toggleService, getAllNotes
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats',              getStats);
router.get('/users',              getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id',       deleteUser);
router.get('/services',           getAllServices);
router.patch('/services/:id/toggle', toggleService);
router.get('/notes',              getAllNotes);

module.exports = router;