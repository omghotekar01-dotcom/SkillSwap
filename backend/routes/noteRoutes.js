const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getNotes, getNote, createNote, updateNote,
  deleteNote, getMyNotes, incrementDownload
} = require('../controllers/noteController');

router.get('/',              getNotes);
router.get('/mine',          protect, getMyNotes);
router.get('/:id',           getNote);
router.post('/',             protect, createNote);
router.put('/:id',           protect, updateNote);
router.delete('/:id',        protect, deleteNote);
router.patch('/:id/download', protect, incrementDownload);

module.exports = router;