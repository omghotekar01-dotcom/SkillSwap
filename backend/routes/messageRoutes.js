const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, getUsers } = require('../controllers/messageController');

router.get('/conversations',    protect, getConversations);
router.get('/users',            protect, getUsers);
router.get('/:userId',          protect, getMessages);
router.post('/:userId',         protect, sendMessage);

module.exports = router;