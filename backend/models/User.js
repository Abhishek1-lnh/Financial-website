const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  signupMethod: {
    type: String,
    enum: ['phone', 'email', 'google'],
    required: true
  },
  phoneNumber: {
    type: String,
    sparse: true,
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  fullName: String,
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  phoneAddedLater: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'inactive'],
    default: 'new'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.userId) {
    const count = await mongoose.model('User').countDocuments();
    this.userId = `USR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);