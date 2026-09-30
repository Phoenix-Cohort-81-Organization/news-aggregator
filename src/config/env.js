require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [],
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  gnews: {
    apiKey: process.env.GNEWS_API_KEY,
  },
  guardian: {
    apiKey: process.env.GUARDIAN_API_KEY,
  },
};

module.exports = env;
