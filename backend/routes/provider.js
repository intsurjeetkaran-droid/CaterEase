const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../app/Middlewares/auth');
const { createProfile } = require('../app/Controllers/ProviderController');
const { createMenu, updateMenu, deleteMenu } = require('../app/Controllers/MenuController');
const { getProviderOrders, updateOrderStatus } = require('../app/Controllers/OrderController');

// All routes require authentication and provider role
router.use(protect, authorize('provider'));

router.post('/profile', createProfile);

router.post('/menus', [
  body('name').notEmpty().trim().withMessage('Menu item name is required'),
  body('category').notEmpty().trim().withMessage('Category is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
], createMenu);

router.put('/menus/:id', [
  param('id').isMongoId().withMessage('Invalid menu ID'),
], updateMenu);

router.delete('/menus/:id', [
  param('id').isMongoId().withMessage('Invalid menu ID'),
], deleteMenu);

router.get('/orders', getProviderOrders);

router.get('/menus', async (req, res, next) => {
  try {
    const Provider = require('../app/Models/Provider');
    const Menu = require('../app/Models/Menu');
    const provider = await Provider.findOne({ user_id: req.user._id });
    if (!provider) {
      return res.status(200).json({ success: true, data: [] });
    }
    const menus = await Menu.find({ provider_id: provider._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/status', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .isIn(['accepted', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status. Must be: accepted, in_progress, completed, or cancelled'),
], updateOrderStatus);

module.exports = router;
