const Note = require('../models/Note');
const { paginate, isValidId, escapeRegExp } = require('../utils/helpers');

const getNotes = async (req, res) => {
  try {
    const { search, subject, semester, minPrice, maxPrice, sort, page, limit } = req.query;
    const filter = { isActive: true };

    if (search) filter.$text = { $search: search };
    if (subject) filter.subject = { $regex: escapeRegExp(subject), $options: 'i' };
    if (semester) filter.semester = Number(semester);
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { downloads: -1 },
      rating: { rating: -1 }
    };

    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .select('title subject price downloads rating totalReviews seller createdAt')
        .populate('seller', 'name avatar rating college')
        .sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(lim)
        .lean(),
      Note.countDocuments(filter)
    ]);

    res.json({ notes, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getNote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findById(req.params.id)
      .populate('seller', 'name avatar rating college bio totalReviews');
    if (!note) return res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createNote = async (req, res) => {
  try {
    const { title, description, subject, price, fileUrl } = req.body;
    if (!title || !description || !subject || !fileUrl || price == null)
      return res.status(400).json({ message: 'Title, subject, file URL and price are required' });

    const note = await Note.create({
      title: String(title).trim(),
      description: String(description).trim(),
      subject: String(subject).trim(),
      semester: Number(req.body.semester) || 1,
      college: String(req.body.college || '').trim(),
      price: Number(price),
      fileUrl: String(fileUrl).trim(),
      previewUrl: String(req.body.previewUrl || '').trim(),
      pages: Number(req.body.pages) || 0,
      seller: req.user._id
    });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateNote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (note.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    const allowed = ['title', 'description', 'subject', 'semester', 'college', 'price', 'fileUrl', 'previewUrl', 'pages', 'isActive'];
    const updates = {};
    allowed.forEach(key => {
      if (key in req.body) updates[key] = req.body[key];
    });

    const updated = await Note.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteNote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (note.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    await note.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ seller: req.user._id })
      .select('title subject price isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const incrementDownload = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findByIdAndUpdate(
      req.params.id, { $inc: { downloads: 1 } }, { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Not found' });
    res.json({ downloads: note.downloads });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, getMyNotes, incrementDownload };
