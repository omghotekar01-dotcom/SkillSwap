require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.json({ message: 'SkillSwap API running' }));

// Socket.io — real-time messaging
const onlineUsers = new Map();

io.on('connection', socket => {
  socket.on('join', userId => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    socket.to(roomId).emit('receiveMessage', message);
  });

  socket.on('joinRoom', roomId => socket.join(roomId));

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers)
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;

// Attempt to connect to MongoDB — if it fails, use a file-based fallback for auth
const setupRoutes = async () => {
  try {
    await connectDB();
    console.log('Using MongoDB-backed routes');
    app.use('/api/auth',     require('./routes/authRoutes'));
  } catch (err) {
    console.error('MongoDB connect failed — falling back to file-based auth:', err.message || err);
    app.use('/api/auth', require('./routes/authFallback'));
  }

  // Mount other routes (they will still try to use Mongoose if present)
  app.use('/api/services', require('./routes/serviceRoutes'));
  app.use('/api/notes',    require('./routes/noteRoutes'));
  app.use('/api/reviews',  require('./routes/reviewRoutes'));
  app.use('/api/messages', require('./routes/messageRoutes'));
  app.use('/api/admin',    require('./routes/adminRoutes'));

  server.listen(PORT, () => console.log(`Server on port ${PORT}`));
};

setupRoutes();