const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  date: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  event_date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  event_location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  customer_phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
  },
  guest_count: {
    type: Number,
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  items: [orderItemSchema],
  total_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payments: [paymentSchema],
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Auto-calculate total_amount from items (optional, since we calculate it before saving)
orderSchema.pre('save', function () {
  if (this.items && this.items.length > 0 && !this.total_amount) {
    this.total_amount = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
  }
});

module.exports = mongoose.model('Order', orderSchema);
