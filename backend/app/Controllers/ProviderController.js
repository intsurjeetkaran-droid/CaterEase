const Provider = require('../Models/Provider');
const User = require('../Models/User');
const logger = require('../../config/logger');

/**
 * @route  GET /api/customer/providers
 * @access Private (Customer)
 */
const getProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ approval_status: 'approved' })
      .populate('user_id', 'name email');

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/provider/profile
 * @access Private (Provider)
 */
const createProfile = async (req, res, next) => {
  try {
    const existing = await Provider.findOne({ user_id: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a business profile. You can only have one profile per account.',
      });
    }

    const { business_name, phone, address } = req.body;

    if (!business_name?.trim()) {
      return res.status(400).json({ success: false, message: 'Business name is required.' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!address?.trim()) {
      return res.status(400).json({ success: false, message: 'Address is required.' });
    }

    const provider = await Provider.create({
      business_name: business_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      user_id: req.user._id,
    });

    logger.info('Provider profile created', { provider_id: provider._id, user_id: req.user._id });

    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/admin/providers/:id/approve
 * @access Private (Admin)
 */
const approveProvider = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['approved', 'rejected', 'pending'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { approval_status: status },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    logger.info('Provider approval updated', { provider_id: provider._id, status: provider.approval_status });

    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/admin/users
 * @access Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProviders, createProfile, approveProvider, getAllUsers };
