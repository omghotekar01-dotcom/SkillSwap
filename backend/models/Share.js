const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  code: { type: String, default: '' },
  language: { type: String, default: 'text' },
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} },
  views: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
});

// If expiresAt is set, MongoDB TTL index will remove the document after expiresAt
shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Share', shareSchema);
