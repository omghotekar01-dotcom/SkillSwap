const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Service', 'Note'], required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '' }
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
