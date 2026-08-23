const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = String(req.query.type || 'files').replace(/[^a-zA-Z0-9-_]/g, '_');
    const uploadPath = path.join(__dirname, '..', 'uploads', type);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File upload required' });
  const type = String(req.query.type || 'files').replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${type}/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.originalname });
};

module.exports = { upload, uploadFile };