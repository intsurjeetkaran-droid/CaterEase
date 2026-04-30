const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../app/Middlewares/auth');
const { getProviders } = require('../app/Controllers/ProviderController');
const { getProviderMenus } = require('../app/Controllers/MenuController');
const { createOrder, getMyOrders, addPayment } = require('../app/Controllers/OrderController');

// All routes require authentication and customer role
router.use(protect, authorize('customer'));

router.get('/providers', getProviders);

router.get('/menus/:providerId', [
  param('providerId').isMongoId().withMessage('Invalid provider ID'),
], getProviderMenus);

router.post('/orders', [
  body('provider_id').isMongoId().withMessage('Valid provider ID is required'),
  body('event_date').isISO8601().withMessage('Valid event date is required (YYYY-MM-DD)'),
  body('event_location').notEmpty().trim().withMessage('Event location is required'),
  body('customer_phone').notEmpty().trim().withMessage('Customer phone is required'),
  body('guest_count').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menu_id').isMongoId().withMessage('Each item must have a valid menu ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be at least 1'),
  body('notes').optional().trim(),
], createOrder);

router.get('/my-orders', getMyOrders);

router.post('/orders/:id/payment', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
], addPayment);

module.exports = router;
