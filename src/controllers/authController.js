const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const generateToken = (user) => {
  if (!env.jwt.secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ userId: user._id, role: user.role }, env.jwt.secret, { expiresIn: '1d' });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || !name.trim()
      || typeof email !== 'string' || !email.trim()
      || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = await User.create({ name: name.trim(), email: normalizedEmail, password });
    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      data: { user: publicUser(newUser), token },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || !email.trim()
      || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ success: true, data: { user: publicUser(user), token } });
  } catch (error) {
    next(error);
  }
};





