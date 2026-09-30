const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./src/config/env');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const newsRoutes = require('./src/routes/newsRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.corsOrigins.length ? env.corsOrigins : env.nodeEnv !== 'production',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req, res) => res.json({ 
  success: true,
  message: 'News Aggregator API is running',
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;