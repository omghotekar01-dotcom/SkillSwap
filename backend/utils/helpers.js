const updateRating = async (Model, targetId) => {
  const Review = require('../models/Review');
  const reviews = await Review.find({ targetId });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Model.findByIdAndUpdate(targetId, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length
  });
};

const paginate = (query, page = 1, limit = 12) => ({
  skip: (page - 1) * limit,
  limit: Number(limit),
  page: Number(page)
});

module.exports = { updateRating, paginate };