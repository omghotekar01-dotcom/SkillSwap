const Review = require('../models/Review');
const Service = require('../models/Service');
const Note = require('../models/Note');
const { updateRating, isValidId } = require('../utils/helpers');

const modelMap = { Service, Note };

const getReviews = async (req, res) => {
  try {
    const { targetId, targetType } = req.query;
    const reviews = await Review.find({ targetId, targetType })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createReview = async (req, res) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;
    if (!targetId || !targetType || !rating)
      return res.status(400).json({ message: 'targetId, targetType, and rating are required' });
    if (!modelMap[targetType])
      return res.status(400).json({ message: 'Invalid target type' });
    if (!isValidId(targetId))
      return res.status(400).json({ message: 'Invalid target id' });
    const score = Number(rating);
    if (!Number.isFinite(score) || score < 1 || score > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const exists = await Review.findOne({ reviewer: req.user._id, targetId, targetType });
    if (exists) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      reviewer: req.user._id,
      targetId,
      targetType,
      rating: score,
      comment: String(comment || '').trim()
    });

    await updateRating(modelMap[targetType], targetId);
    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateReview = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid review id' });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.reviewer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    if ('rating' in req.body) {
      const score = Number(req.body.rating);
      if (!Number.isFinite(score) || score < 1 || score > 5)
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      review.rating = score;
    }

    if ('comment' in req.body) {
      review.comment = String(req.body.comment || '').trim();
    }

    await review.save();

    await updateRating(modelMap[review.targetType], review.targetId);
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteReview = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid review id' });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { targetType, targetId } = review;
    await review.deleteOne();
    if (modelMap[targetType]) await updateRating(modelMap[targetType], targetId);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };