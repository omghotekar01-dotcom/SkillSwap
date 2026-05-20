const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

router.get('/',       getReviews);
router.post('/',      protect, createReview);
router.put('/:id',    protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;