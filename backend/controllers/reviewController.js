const Review = require('../models/Review');
const Service = require('../models/Service');
const Note = require('../models/Note');
const { updateRating } = require('../utils/helpers');

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
    const exists = await Review.findOne({ reviewer: req.user._id, targetId });
    if (exists) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      reviewer: req.user._id, targetId, targetType, rating, comment
    });

    await updateRating(modelMap[targetType], targetId);
    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.reviewer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();

    await updateRating(modelMap[review.targetType], review.targetId);
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { targetType, targetId } = review;
    await review.deleteOne();
    await updateRating(modelMap[targetType], targetId);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };