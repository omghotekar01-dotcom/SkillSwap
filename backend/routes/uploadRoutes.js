const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { upload, uploadFile } = require('../controllers/uploadController');

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;