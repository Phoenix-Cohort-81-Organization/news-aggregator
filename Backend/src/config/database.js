const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.database.uri) {
    throw new Error('MONGODB_URI is required to start the API');
  }

  const conn = await mongoose.connect(env.database.uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;