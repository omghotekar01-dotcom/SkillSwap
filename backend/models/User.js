const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  skills:        [{ type: String }],
  interests:     [{ type: String }],
  portfolioLinks: [{
    label: { type: String, trim: true, default: '' },
    url:   { type: String, trim: true, default: '' }
  }],
  achievements: [{
    title:       { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    year:        { type: Number },
    link:        { type: String, trim: true, default: '' }
  }],
  projects: [{
    title:       { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    link:        { type: String, trim: true, default: '' }
  }],
  semester:      { type: Number, min: 1, max: 8, default: 1 },
  activity:      { type: Number, default: 0 },
  responseSpeed: { type: Number, default: 48 },
  collaborations: { type: Number, default: 0 },
  reports:       { type: Number, default: 0 },
  xp:            { type: Number, default: 0 },
  badges:        [{ type: String }],
  college:       { type: String, default: '' },
  rating:        { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  earnings:      { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

const computeTrustScore = function () {
  const rating = Number(this.rating || 0);
  const reviews = Number(this.totalReviews || 0);
  const activity = Number(this.activity || 0);
  const collaborations = Number(this.collaborations || 0);
  const speed = Number(this.responseSpeed == null ? 48 : this.responseSpeed);
  const reports = Number(this.reports || 0);

  let score = 30;
  score += Math.min(18, rating * 3.6);
  score += Math.min(18, reviews * 0.9);
  score += Math.min(16, activity * 0.6);
  score += Math.min(14, collaborations * 1.2);
  score += Math.max(0, 15 - speed * 0.25);
  score -= reports * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
};

userSchema.virtual('trustScore').get(computeTrustScore);
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);