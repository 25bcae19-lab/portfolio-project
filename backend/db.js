/**
 * MongoDB Atlas connection via Mongoose.
 * Set MONGODB_URI in .env (see .env.example).
 */
const mongoose = require('mongoose');

let connecting = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your Atlas connection string.');
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connecting) {
    return connecting;
  }
  connecting = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await connecting;
    console.log('MongoDB connected');
    return mongoose.connection;
  } finally {
    connecting = null;
  }
}

module.exports = { connectDB, mongoose };
