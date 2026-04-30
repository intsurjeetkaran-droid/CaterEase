const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const { protect, authorize } = require('../app/Middlewares/auth');
const { getAllUsers, approveProvider } = require('../app/Controllers/ProviderController');
const { getAllOrders } = require('../app/Controllers/OrderController');

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);

router.get('/providers', async (req, res, next) => {
  try {
    const Provider = require('../app/Models/Provider');
    const providers = await Provider.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
});

router.put('/providers/:id/approve', [
  param('id').isMongoId().withMessage('Invalid provider ID'),
  body('status')
    .isIn(['approved', 'rejected', 'pending'])
    .withMessage('Status must be: approved, rejected, or pending'),
], approveProvider);

router.get('/orders', getAllOrders);

module.exports = router;
