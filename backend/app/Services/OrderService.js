const Order = require('../Models/Order');
const Menu = require('../Models/Menu');
const logger = require('../../config/logger');

/**
 * Create a new order
 * Steps:
 * 1. Validate event date is in the future
 * 2. Validate menu items exist and belong to the provider
 * 3. Enrich items with current prices
 * 4. Calculate total amount
 * 5. Save order
 */
const createOrder = async (customerId, orderData) => {
  const { provider_id, event_date, event_location, customer_phone, guest_count, items, notes } = orderData;

  // Event date must be in the future
  const eventDateObj = new Date(event_date);
  if (eventDateObj <= new Date()) {
    const error = new Error('Event date must be in the future');
    error.statusCode = 400;
    throw error;
  }

  // Validate required fields
  if (!event_location || !event_location.trim()) {
    const error = new Error('Event location is required');
    error.statusCode = 400;
    throw error;
  }

  if (!customer_phone || !customer_phone.trim()) {
    const error = new Error('Customer phone is required');
    error.statusCode = 400;
    throw error;
  }

  // Validate and enrich items with current prices
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      if (!item.menu_id) {
        const error = new Error('Each item must have a menu_id');
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        const error = new Error('Item quantity must be a positive integer');
        error.statusCode = 400;
        throw error;
      }

      const menu = await Menu.findById(item.menu_id);
      if (!menu) {
        const error = new Error(`Menu item not found`);
        error.statusCode = 404;
        throw error;
      }

      if (!menu.is_available) {
        const error = new Error(`Menu item "${menu.name}" is currently unavailable`);
        error.statusCode = 400;
        throw error;
      }

      // Ensure menu belongs to the selected provider
      if (String(menu.provider_id) !== String(provider_id)) {
        const error = new Error(`Menu item "${menu.name}" does not belong to the selected provider`);
        error.statusCode = 400;
        throw error;
      }

      return {
        menu_id: menu._id,
        name: menu.name,
        price: menu.price,
        quantity: Number(item.quantity),
      };
    })
  );

  // Calculate total
  const total_amount = enrichedItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const order = await Order.create({
    customer_id: customerId,
    provider_id,
    event_date,
    event_location: event_location.trim(),
    customer_phone: customer_phone.trim(),
    guest_count: guest_count ? Number(guest_count) : undefined,
    items: enrichedItems,
    total_amount,
    notes: notes ? notes.trim() : undefined,
  });

  logger.info('Order created', { order_id: order._id, customer_id: customerId, total_amount, event_location });

  return order;
};

/**
 * Update order status
 * Validates allowed transitions: pending→accepted, accepted→in_progress, in_progress→completed, any→cancelled
 */
const updateOrderStatus = async (orderId, status, userId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate status transition
  const allowedTransitions = {
    pending: ['accepted', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    const error = new Error(
      `Cannot change status from "${order.status}" to "${status}". ` +
      `Allowed: ${allowedTransitions[order.status]?.join(', ') || 'none (order is finalized)'}`
    );
    error.statusCode = 400;
    throw error;
  }

  order.status = status;
  await order.save();

  logger.info('Order status updated', { order_id: orderId, status, updated_by: userId });

  return order;
};

/**
 * Add payment to an order
 * Validates amount is positive and order is not cancelled/completed with full payment
 */
const addPayment = async (orderId, paymentData) => {
  const { amount, payment_method, transaction_id } = paymentData;

  if (!amount || Number(amount) <= 0) {
    const error = new Error('Payment amount must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  if (!payment_method || !['online', 'cash_in_hand'].includes(payment_method)) {
    const error = new Error('Payment method must be either "online" or "cash_in_hand"');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.status === 'cancelled') {
    const error = new Error('Cannot add payment to a cancelled order');
    error.statusCode = 400;
    throw error;
  }

  // Check if already fully paid
  const totalPaid = order.payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid >= order.total_amount) {
    const error = new Error('This order has already been fully paid');
    error.statusCode = 400;
    throw error;
  }

  const remaining = order.total_amount - totalPaid;
  if (Number(amount) > remaining) {
    const error = new Error(`Payment amount (₹${amount}) exceeds remaining balance (₹${remaining})`);
    error.statusCode = 400;
    throw error;
  }

  // For cash_in_hand, status is pending until caterer confirms
  // For online, status is pending until customer confirms payment
  const paymentStatus = 'pending';

  order.payments.push({ 
    amount: Number(amount), 
    payment_method,
    transaction_id: transaction_id || undefined,
    status: paymentStatus, 
    date: new Date() 
  });
  await order.save();

  logger.info('Payment added', { order_id: orderId, amount, payment_method });

  return order;
};

/**
 * Update payment status (for caterer to confirm cash_in_hand or customer to confirm online payment)
 */
const updatePaymentStatus = async (orderId, paymentId, status, userId) => {
  if (!['paid', 'failed'].includes(status)) {
    const error = new Error('Status must be either "paid" or "failed"');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const payment = order.payments.id(paymentId);

  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }

  if (payment.status !== 'pending') {
    const error = new Error(`Payment is already ${payment.status}`);
    error.statusCode = 400;
    throw error;
  }

  payment.status = status;
  await order.save();

  logger.info('Payment status updated', { order_id: orderId, payment_id: paymentId, status, updated_by: userId });

  return order;
};

module.exports = { createOrder, updateOrderStatus, addPayment, updatePaymentStatus };
