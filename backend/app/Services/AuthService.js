const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const logger = require('../../config/logger');

/**
 * Generate JWT token
 * @param {string} id - User ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role }
 */
const register = async (userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  logger.info('User registered', { user_id: user._id, role: user.role });

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  logger.info('User login', { user_id: user._id });

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

module.exports = { register, login };
