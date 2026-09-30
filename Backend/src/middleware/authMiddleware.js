const jwt = require('jsonwebtoken');
const env = require('../config/env');


exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    const token = authHeader.slice(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token not found',
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwt.secret
    );
    req.user = decoded;
    next();
  } catch(error) {
    return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
  }
};
