const Message = require('../models/Message');
const User = require('../models/User');

const getRoomId = (a, b) => [a, b].sort().join('_');

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const msgs = await Message.aggregate([
      { $match: { roomId: new RegExp(userId) } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$roomId', lastMessage: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastMessage' } }
    ]);

    const conversations = await Promise.all(msgs.map(async m => {
      const otherId = m.roomId.split('_').find(id => id !== userId);
      const other = await User.findById(otherId).select('name avatar');
      const unread = await Message.countDocuments({ roomId: m.roomId, receiver: req.user._id, read: false });
      return { ...m, otherUser: other, unread };
    }));

    res.json(conversations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMessages = async (req, res) => {
  try {
    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 })
      .populate('sender', 'name avatar');
    await Message.updateMany({ roomId, receiver: req.user._id, read: false }, { read: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const sendMessage = async (req, res) => {
  try {
    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content: req.body.content,
      roomId
    });
    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .select('name avatar college rating').limit(20);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getConversations, getMessages, sendMessage, getUsers };