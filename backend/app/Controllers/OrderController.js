const Order = require('../Models/Order');
const OrderService = require('../Services/OrderService');
const { validationResult } = require('express-validator');

/**
 * @route  POST /api/orders
 * @access Private (Customer)
 */
const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await OrderService.createOrder(req.user._id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/my-orders
 * @access Private (Customer)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer_id: req.user._id })
      .populate('provider_id', 'business_name phone payment_details')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/provider/orders
 * @access Private (Provider)
 */
const getProviderOrders = async (req, res, next) => {
  try {
    const Provider = require('../Models/Provider');
    const providerProfile = await Provider.findOne({ user_id: req.user._id });
    if (!providerProfile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found. Please create your profile first.' });
    }

    const orders = await Order.find({ provider_id: providerProfile._id })
      .populate('customer_id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/provider/orders/:id/status
 * @access Private (Provider)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await OrderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/admin/orders
 * @access Private (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer_id', 'name email')
      .populate('provider_id', 'business_name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/orders/:id/payment
 * @access Private (Customer)
 */
const addPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await OrderService.addPayment(req.params.id, req.body);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/orders/:orderId/payment/:paymentId/status
 * @access Private (Customer or Provider)
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await OrderService.updatePaymentStatus(
      req.params.orderId,
      req.params.paymentId,
      req.body.status,
      req.user._id
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getProviderOrders, updateOrderStatus, getAllOrders, addPayment, updatePaymentStatus };
