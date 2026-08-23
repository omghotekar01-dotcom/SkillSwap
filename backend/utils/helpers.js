const mongoose = require('mongoose');

const escapeRegExp = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidId = id => mongoose.isValidObjectId(String(id || ''));

const updateRating = async (Model, targetId) => {
  const Review = require('../models/Review');
  if (!isValidId(targetId)) return;
  const reviews = await Review.find({ targetId });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Model.findByIdAndUpdate(targetId, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length
  });
};

const paginate = (query, page = 1, limit = 12) => ({
  skip: (Number(page) > 0 ? (page - 1) * limit : 0),
  limit: Number(limit) || 12,
  page: Number(page) || 1
});

module.exports = { updateRating, paginate, isValidId, escapeRegExp };