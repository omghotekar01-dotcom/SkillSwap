const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'fallbackUsers.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const hashedDemo = bcrypt.hashSync('demo123', 10);
const hashedAdmin = bcrypt.hashSync('admin123', 10);
const seed = [
  { id: '1000001', name: 'Demo Student', email: 'student@demo.com', password: hashedDemo, role: 'student', college: 'Demo College', avatar: '', bio: 'Demo student account for testing', skills: ['tutoring','note-sharing'] },
  { id: '1000002', name: 'Demo Admin', email: 'admin@demo.com', password: hashedAdmin, role: 'admin', college: 'Demo College', avatar: '', bio: 'Demo admin account for testing', skills: [] }
];
fs.writeFileSync(USERS_FILE, JSON.stringify(seed, null, 2));
console.log('Seeded', USERS_FILE);
