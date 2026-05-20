const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject:     { type: String, required: true },
  semester:    { type: Number, min: 1, max: 8 },
  college:     { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  fileUrl:     { type: String, required: true },
  previewUrl:  { type: String, default: '' },
  pages:       { type: Number, default: 0 },
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  downloads:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

noteSchema.index({ title: 'text', subject: 'text', college: 'text' });

module.exports = mongoose.model('Note', noteSchema);
