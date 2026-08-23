
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not defined. Skipping MongoDB connection and using fallback mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    return false;
  }
};

module.exports = connectDB;