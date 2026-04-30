const Menu = require('../Models/Menu');
const Provider = require('../Models/Provider');
const { validationResult } = require('express-validator');
const logger = require('../../config/logger');

/**
 * @route  POST /api/provider/menus
 * @access Private (Provider)
 */
const createMenu = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const provider = await Provider.findOne({ user_id: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found. Please create your business profile first.',
      });
    }

    if (provider.approval_status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${provider.approval_status}. You can only add menu items after admin approval.`,
      });
    }

    // Prevent duplicate menu item names for same provider
    const duplicate = await Menu.findOne({
      provider_id: provider._id,
      name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A menu item named "${req.body.name}" already exists. Please use a different name.`,
      });
    }

    const menu = await Menu.create({ ...req.body, provider_id: provider._id });
    logger.info('Menu item created', { menu_id: menu._id, provider_id: provider._id });

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/customer/menus/:providerId
 * @access Private (Customer)
 */
const getProviderMenus = async (req, res, next) => {
  try {
    // Validate provider exists
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.',
      });
    }

    if (provider.approval_status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'This provider is not currently available.',
      });
    }

    const menus = await Menu.find({
      provider_id: req.params.providerId,
      is_available: true,
    });

    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/provider/menus/:id
 * @access Private (Provider)
 */
const updateMenu = async (req, res, next) => {
  try {
    // Verify ownership — only the menu's provider can update it
    const provider = await Provider.findOne({ user_id: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const menu = await Menu.findOne({ _id: req.params.id, provider_id: provider._id });
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or you do not have permission to edit it.',
      });
    }

    // Prevent price going negative
    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    }

    Object.assign(menu, req.body);
    await menu.save();

    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/provider/menus/:id
 * @access Private (Provider)
 */
const deleteMenu = async (req, res, next) => {
  try {
    // Verify ownership
    const provider = await Provider.findOne({ user_id: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const menu = await Menu.findOneAndDelete({ _id: req.params.id, provider_id: provider._id });
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMenu, getProviderMenus, updateMenu, deleteMenu };
