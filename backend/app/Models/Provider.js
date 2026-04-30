const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  payment_details: {
    upi_id: {
      type: String,
      trim: true,
    },
    qr_code: {
      type: String, // stores base64 data URI or URL
    },
    bank_name: {
      type: String,
      trim: true,
    },
    account_holder_name: {
      type: String,
      trim: true,
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
