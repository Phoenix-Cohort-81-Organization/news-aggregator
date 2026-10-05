const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;   // { userId, role }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permission' });
  }
  next();
};