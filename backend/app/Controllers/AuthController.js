const { validationResult } = require('express-validator');
const AuthService = require('../Services/AuthService');

/**
 * @route  POST /api/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await AuthService.login(req.body.email, req.body.password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/me
 * @access Private
 */
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, login, getMe };
