const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['coding','design','editing','notes','tutoring','other'], required: true },
  price:       { type: Number, required: true, min: 0 },
  deliveryDays:{ type: Number, default: 3 },
  tags:        [{ type: String }],
  images:      [{ type: String }],
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
