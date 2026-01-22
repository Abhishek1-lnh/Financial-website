const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['phone', 'email'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ FIX (prevents OverwriteModelError on Railway)
module.exports = mongoose.models.OTP || mongoose.model('OTP', otpSchema);