require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'fallbackUsers.json');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  } catch {
    return [];
  }
};
const fallbackProtect = (req, res, next) => {
  const authHeader = String(req.headers.authorization || '').trim();
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authorization required' });
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
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST'] }
});

app.disable('x-powered-by');
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: false, limit: '15kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
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
const SHARES = new Map();

// Attempt to connect to MongoDB — if it fails, use a file-based fallback for auth
const setupRoutes = async () => {
  let mongoConnected = false;
  const connected = await connectDB();
  if (connected) {
    console.log('Using MongoDB-backed routes');
    mongoConnected = true;
    app.use('/api/auth', require('./routes/authRoutes'));
  } else {
    console.warn('Falling back to file-based auth routes. MongoDB is unavailable or not configured.');
    mongoConnected = false;
    app.use('/api/auth', require('./routes/authFallback'));
  }

  app.use('/api/upload', require('./routes/uploadRoutes'));

  // Mount MongoDB-dependent routes only if connected
  if (mongoConnected) {
    app.use('/api/services', require('./routes/serviceRoutes'));
    app.use('/api/notes',    require('./routes/noteRoutes'));
    app.use('/api/reviews',  require('./routes/reviewRoutes'));
    app.use('/api/messages', require('./routes/messageRoutes'));
    app.use('/api/admin',    require('./routes/adminRoutes'));
    app.use('/api/ai',       require('./routes/aiRoutes'));

    // Persisted share endpoints using MongoDB
    try {
      const Share = require('./models/Share');
      app.post('/api/share', async (req, res) => {
        try {
          const { title, code, language, meta, expiresIn } = req.body || {};
          let expiresAt = null;
          if (expiresIn) {
            // expiresIn in seconds
            expiresAt = new Date(Date.now() + Number(expiresIn) * 1000);
          }
          const s = await Share.create({ title, code, language, meta, expiresAt });
          return res.json({ id: s._id, url: `${clientUrl.replace(/\/$/, '')}/share/${s._id}` });
        } catch (err) {
          return res.status(500).json({ message: 'Share failed' });
        }
      });

      app.get('/api/share/:id', async (req, res) => {
        try {
          // increment views atomically and return the doc
          const s = await Share.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
          if (!s) return res.status(404).json({ message: 'Not found' });
          return res.json({ id: s._id, title: s.title, code: s.code, language: s.language, createdAt: s.createdAt, views: s.views, expiresAt: s.expiresAt });
        } catch (err) {
          return res.status(500).json({ message: 'Not found' });
        }
      });

      // Admin endpoints for shares (simple header-based auth)
      app.get('/api/admin/shares', async (req, res) => {
        const key = req.header('x-admin-key');
        if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(403).json({ message: 'Forbidden' });
        const list = await Share.find().sort({ createdAt: -1 }).lean();
        return res.json(list.map(s => ({ id: s._id, title: s.title, createdAt: s.createdAt, views: s.views, expiresAt: s.expiresAt })));
      });

      app.delete('/api/admin/shares/:id', async (req, res) => {
        const key = req.header('x-admin-key');
        if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(403).json({ message: 'Forbidden' });
        try {
          await Share.findByIdAndDelete(req.params.id);
          return res.json({ message: 'Deleted' });
        } catch (err) {
          return res.status(500).json({ message: 'Delete failed' });
        }
      });
    } catch (err) {
      console.error('Failed to wire Share model:', err.message || err);
    }
  } else {
    // In-memory share endpoints (fallback)
    app.post('/api/share', (req, res) => {
      try {
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
        const payload = req.body || {};
        SHARES.set(id, { ...payload, createdAt: new Date().toISOString() });
        return res.json({ id, url: `${clientUrl.replace(/\/$/, '')}/share/${id}` });
      } catch (err) {
        return res.status(500).json({ message: 'Share failed' });
      }
    });

    app.get('/api/share/:id', (req, res) => {
      const item = SHARES.get(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      return res.json({ id: req.params.id, ...item });
    });
    const DEMO_SELLER = {
      _id: 'demo-seller',
      name: 'Demo Student',
      college: 'Demo College',
      bio: 'Experienced campus tutor and project collaborator.',
      skills: ['React', 'Figma', 'Python'],
      rating: 4.9,
      totalReviews: 32,
    };

    const DEMO_SERVICES = [
      {
        _id: 'svc-1',
        title: 'React project setup & debugging',
        description: 'I will help you build, debug, and optimize React applications for college projects.',
        category: 'coding',
        price: 750,
        deliveryDays: 2,
        rating: 4.8,
        totalReviews: 26,
        tags: ['React', 'Web', 'Debug'],
        seller: DEMO_SELLER,
        isActive: true,
      },
      {
        _id: 'svc-2',
        title: 'Design beautiful UI for your assignment',
        description: 'Custom UI/UX design for apps, presentations, and student portfolios.',
        category: 'design',
        price: 1200,
        deliveryDays: 3,
        rating: 4.7,
        totalReviews: 18,
        tags: ['UI', 'Figma', 'Branding'],
        seller: DEMO_SELLER,
        isActive: true,
      },
      {
        _id: 'svc-3',
        title: 'Notes compilation & summaries',
        description: 'Create concise, exam-ready summaries and notes for your subjects.',
        category: 'notes',
        price: 399,
        deliveryDays: 1,
        rating: 4.9,
        totalReviews: 14,
        tags: ['Notes', 'Summary', 'Study'],
        seller: DEMO_SELLER,
        isActive: true,
      },
    ];

    const DEMO_NOTES = [
      {
        _id: 'note-1',
        title: 'Data Structures Exam Notes',
        description: 'Complete DS notes covering trees, graphs, and algorithms.',
        subject: 'Data Structures',
        semester: 4,
        college: 'Demo College',
        price: 199,
        fileUrl: 'https://example.com/demo-note.pdf',
        downloads: 24,
      },
      {
        _id: 'note-2',
        title: 'Advanced Python Cheat Sheet',
        description: 'Python snippets, examples, and best practices for your semester project.',
        subject: 'Programming',
        semester: 3,
        college: 'Demo College',
        price: 149,
        fileUrl: 'https://example.com/python-cheatsheet.pdf',
        downloads: 19,
      },
    ];

    const DEMO_REVIEWS = [
      {
        _id: 'rev-1',
        targetId: 'svc-1',
        targetType: 'Service',
        rating: 5,
        comment: 'Amazing support and fast turnaround!',
        reviewer: { _id: 'rev-user-1', name: 'Priya' },
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'rev-2',
        targetId: 'svc-1',
        targetType: 'Service',
        rating: 4,
        comment: 'Very helpful and responsive.',
        reviewer: { _id: 'rev-user-2', name: 'Rahul' },
        createdAt: new Date().toISOString(),
      },
    ];

    const DEMO_MESSAGES = [
      { _id: 'msg-1', sender: { _id: 'demo-seller', name: 'Demo Student' }, content: 'Hi there! How can I help with your campus project?', createdAt: new Date().toISOString() },
      { _id: 'msg-2', sender: { _id: 'demo-user', name: 'You' }, content: 'I need tutoring for my React assignment.', createdAt: new Date().toISOString() },
    ];

    let nextDemoServiceId = DEMO_SERVICES.length + 1;
    app.get('/api/services/mine', (req, res) => res.json(DEMO_SERVICES));
    app.get('/api/services', (req, res) => {
      const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
      let list = [...DEMO_SERVICES];
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(s =>
          String(s.title).toLowerCase().includes(q) ||
          String(s.description).toLowerCase().includes(q) ||
          (s.tags || []).some(tag => String(tag).toLowerCase().includes(q))
        );
      }
      if (category) list = list.filter(s => s.category === category);
      if (minPrice) list = list.filter(s => Number(s.price) >= Number(minPrice));
      if (maxPrice) list = list.filter(s => Number(s.price) <= Number(maxPrice));
      const sortMap = {
        newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        price_asc: (a, b) => Number(a.price) - Number(b.price),
        price_desc: (a, b) => Number(b.price) - Number(a.price),
        rating: (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      };
      if (sort && sortMap[sort]) list.sort(sortMap[sort]);
      const pageNum = Number(page) || 1;
      const lim = Number(limit) || 12;
      const paged = list.slice((pageNum - 1) * lim, pageNum * lim);
      res.json({ services: paged, total: list.length, page: pageNum, pages: Math.max(1, Math.ceil(list.length / lim)) });
    });
    app.post('/api/services', fallbackProtect, (req, res) => {
      try {
        const { title, description, category, price, deliveryDays, tags, images } = req.body || {};
        if (!title || !description || !category || price == null) {
          return res.status(400).json({ message: 'Title, description, category, and price are required' });
        }
        const newService = {
          _id: `svc-${Date.now()}-${nextDemoServiceId++}`,
          title: String(title).trim(),
          description: String(description).trim(),
          category: String(category).trim(),
          price: Number(price),
          deliveryDays: Number(deliveryDays) || 3,
          tags: Array.isArray(tags) ? tags : [],
          images: Array.isArray(images) ? images : [],
          seller: {
            _id: req.user._id,
            name: req.user.name,
            college: req.user.college || '',
            avatar: req.user.avatar || '',
            rating: Number(req.user.rating || 0),
            totalReviews: Number(req.user.totalReviews || 0)
          },
          rating: 0,
          totalReviews: 0,
          totalOrders: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        DEMO_SERVICES.unshift(newService);
        res.status(201).json(newService);
      } catch (err) {
        res.status(500).json({ message: 'Service creation failed' });
      }
    });
    app.get('/api/services/:id', (req, res) => {
      const service = DEMO_SERVICES.find(s => s._id === req.params.id) || DEMO_SERVICES[0];
      res.json(service);
    });
    app.put('/api/services/:id', fallbackProtect, (req, res) => {
      try {
        const id = req.params.id;
        const idx = DEMO_SERVICES.findIndex(s => s._id === id);
        if (idx === -1) return res.status(404).json({ message: 'Not found' });
        const svc = DEMO_SERVICES[idx];
        // Only owner or admin may update
        const userId = req.user && req.user._id;
        const isOwner = svc.seller && String(svc.seller._id) === String(userId);
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin === true);
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

        const allowed = ['title', 'description', 'category', 'price', 'deliveryDays', 'tags', 'images', 'isActive'];
        allowed.forEach(k => { if (k in req.body) svc[k] = req.body[k]; });
        svc.updatedAt = new Date().toISOString();
        DEMO_SERVICES[idx] = svc;
        return res.json(svc);
      } catch (err) {
        return res.status(500).json({ message: 'Update failed' });
      }
    });
    app.delete('/api/services/:id', fallbackProtect, (req, res) => {
      try {
        const id = req.params.id;
        const idx = DEMO_SERVICES.findIndex(s => s._id === id);
        if (idx === -1) return res.status(404).json({ message: 'Not found' });
        const svc = DEMO_SERVICES[idx];
        const userId = req.user && req.user._id;
        const isOwner = svc.seller && String(svc.seller._id) === String(userId);
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin === true);
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });
        DEMO_SERVICES.splice(idx, 1);
        return res.json({ message: 'Deleted' });
      } catch (err) {
        return res.status(500).json({ message: 'Delete failed' });
      }
    });
    
    app.get('/api/notes', (req, res) => res.json(DEMO_NOTES));
    let nextDemoNoteId = DEMO_NOTES.length + 1;
    app.post('/api/notes', fallbackProtect, (req, res) => {
      try {
        const { title, description, subject, semester, college, price, fileUrl } = req.body || {};
        if (!title || !description || !subject || !fileUrl || price == null) {
          return res.status(400).json({ message: 'Title, description, subject, fileUrl and price are required' });
        }
        const newNote = {
          _id: `note-${Date.now()}-${nextDemoNoteId++}`,
          title: String(title).trim(),
          description: String(description).trim(),
          subject: String(subject).trim(),
          semester: Number(semester) || 1,
          college: String(college || req.user.college || 'Demo College').trim(),
          price: Number(price),
          fileUrl: String(fileUrl),
          downloads: 0,
          seller: { _id: req.user._id, name: req.user.name, college: req.user.college || '' },
          createdAt: new Date().toISOString()
        };
        DEMO_NOTES.unshift(newNote);
        return res.status(201).json(newNote);
      } catch (err) {
        return res.status(500).json({ message: 'Note creation failed' });
      }
    });
    app.get('/api/notes/mine', fallbackProtect, (req, res) => {
      try {
        const list = DEMO_NOTES.filter(n => n.seller && n.seller._id === req.user._id);
        return res.json(list);
      } catch (err) { return res.json([]); }
    });
    app.get('/api/notes/:id', (req, res) => {
      const note = DEMO_NOTES.find(n => n._id === req.params.id) || DEMO_NOTES[0];
      res.json(note);
    });
    app.put('/api/notes/:id', fallbackProtect, (req, res) => {
      try {
        const id = req.params.id;
        const idx = DEMO_NOTES.findIndex(n => n._id === id);
        if (idx === -1) return res.status(404).json({ message: 'Not found' });
        const note = DEMO_NOTES[idx];
        const userId = req.user && req.user._id;
        const isOwner = note.seller && String(note.seller._id) === String(userId);
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin === true);
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

        const allowed = ['title', 'description', 'subject', 'semester', 'college', 'price', 'fileUrl', 'previewUrl', 'pages', 'isActive'];
        allowed.forEach(k => { if (k in req.body) note[k] = req.body[k]; });
        note.updatedAt = new Date().toISOString();
        DEMO_NOTES[idx] = note;
        return res.json(note);
      } catch (err) {
        return res.status(500).json({ message: 'Update failed' });
      }
    });
    app.delete('/api/notes/:id', fallbackProtect, (req, res) => {
      try {
        const id = req.params.id;
        const idx = DEMO_NOTES.findIndex(n => n._id === id);
        if (idx === -1) return res.status(404).json({ message: 'Not found' });
        const note = DEMO_NOTES[idx];
        const userId = req.user && req.user._id;
        const isOwner = note.seller && String(note.seller._id) === String(userId);
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin === true);
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });
        DEMO_NOTES.splice(idx, 1);
        return res.json({ message: 'Deleted' });
      } catch (err) {
        return res.status(500).json({ message: 'Delete failed' });
      }
    });
    
    app.get('/api/reviews', (req, res) => {
      const { targetId, targetType } = req.query;
      const filtered = DEMO_REVIEWS.filter(r => r.targetId === targetId && r.targetType === targetType);
      res.json(filtered.length ? filtered : DEMO_REVIEWS);
    });
    app.post('/api/reviews', (req, res) => res.status(201).json({ message: 'Review requires MongoDB' }));
    app.get('/api/reviews/:id', (req, res) => {
      const review = DEMO_REVIEWS.find(r => r._id === req.params.id) || DEMO_REVIEWS[0];
      res.json(review);
    });
    app.delete('/api/reviews/:id', (req, res) => res.json({ message: 'Delete requires MongoDB' }));
    
    let nextDemoMessageId = 3;
    app.get('/api/messages', (req, res) => res.json(DEMO_MESSAGES));
    app.post('/api/messages', (req, res) => res.status(201).json({ message: 'Message requires MongoDB' }));
    app.post('/api/messages/:userId', (req, res) => {
      const content = String(req.body?.content || '').trim();
      if (!content) return res.status(400).json({ message: 'Message content cannot be empty' });
      const newMsg = {
        _id: `msg-${nextDemoMessageId++}`,
        sender: { _id: 'demo-user', name: 'You' },
        content,
        createdAt: new Date().toISOString(),
      };
      DEMO_MESSAGES.push(newMsg);
      res.status(201).json(newMsg);
    });
    app.get('/api/messages/:userId', (req, res) => res.json(DEMO_MESSAGES));
    
    app.get('/api/ai/analytics', (req, res) => {
      const tagCounts = new Map();
      const subjectCounts = new Map();
      const categoryCounts = new Map();

      DEMO_SERVICES.forEach(svc => {
        (svc.tags || []).forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
        if (svc.category) categoryCounts.set(svc.category, (categoryCounts.get(svc.category) || 0) + 1);
      });
      DEMO_NOTES.forEach(note => {
        if (note.subject) subjectCounts.set(note.subject, (subjectCounts.get(note.subject) || 0) + 1);
      });

      const mapToArray = map => Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value }));

      return res.json({
        trendingSkills: mapToArray(tagCounts).slice(0, 8),
        popularSubjects: mapToArray(subjectCounts).slice(0, 6),
        mostRequestedCategories: mapToArray(categoryCounts).slice(0, 6),
        averageTrustScore: 78,
        usersCount: readUsers().length,
        notesCount: DEMO_NOTES.length,
        servicesCount: DEMO_SERVICES.length,
        summary: 'Demo analytics generated from campus service and note activity.'
      });
    });

    app.get('/api/ai/recommend/collaborators', fallbackProtect, (req, res) => {
      const currentId = req.user._id;
      const candidates = readUsers()
        .filter(u => String(u.id || u._id) !== String(currentId) && u.isActive !== false)
        .slice(0, 8)
        .map((user, index) => ({
          _id: user.id || user._id,
          name: user.name,
          college: user.college || 'Campus',
          semester: user.semester || 1,
          skills: user.skills || [],
          score: Math.round((Math.max(65, 80 - index * 3) + Math.random() * 5) * 100) / 100
        }));
      res.json({ collaborators: candidates, summary: 'Recommended collaborators based on available campus profiles.' });
    });

    app.get('/api/ai/recommend/projects', fallbackProtect, (req, res) => {
      const suggestedNotes = DEMO_NOTES.slice(0, 4).map(note => ({
        id: note._id,
        type: 'note',
        title: note.title,
        subject: note.subject,
        seller: note.seller,
        score: Math.round((Math.random() * 20 + 70) * 100) / 100
      }));
      const suggestedServices = DEMO_SERVICES.slice(0, 4).map(svc => ({
        id: svc._id,
        type: 'service',
        title: svc.title,
        category: svc.category,
        seller: svc.seller,
        score: Math.round((Math.random() * 20 + 70) * 100) / 100
      }));
      res.json({ suggestedNotes, suggestedServices, summary: 'Demo project recommendations based on campus trends.' });
    });

    app.post('/api/ai/notes/:id/summary', fallbackProtect, (req, res) => {
      const note = DEMO_NOTES.find(item => item._id === req.params.id);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      const summary = `${note.title} is a ${note.subject} note designed for semester ${note.semester}. It covers core ideas, practice examples, and exam-ready summaries for students.`;
      res.json({ summary, importantTopics: (note.title + ' ' + note.description).split(' ').slice(0, 8), revisionPoints: ['Review key concepts', 'Practice sample problems', 'Summarize each section'] });
    });

    app.post('/api/ai/notes/:id/plagiarism', fallbackProtect, (req, res) => {
      const note = DEMO_NOTES.find(item => item._id === req.params.id);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      const duplicates = DEMO_NOTES.filter(item => item._id !== note._id).map(item => ({ id: item._id, title: item.title, similarity: Math.round((Math.random() * 0.25 + 0.6) * 100) / 100 }));
      res.json({ duplicates, summary: duplicates.length ? 'Potential overlap detected with other notes.' : 'No duplicate content detected.' });
    });

    app.get('/api/admin', (req, res) => res.status(403).json({ message: 'Admin requires MongoDB' }));
    app.post('/api/admin', (req, res) => res.status(403).json({ message: 'Admin requires MongoDB' }));
    app.put('/api/admin/:id', (req, res) => res.status(403).json({ message: 'Admin requires MongoDB' }));
    app.delete('/api/admin/:id', (req, res) => res.status(403).json({ message: 'Admin requires MongoDB' }));
  }

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: 'Internal server error' });
  });

  server.listen(PORT, () => console.log(`Server on port ${PORT}`));
};

setupRoutes();