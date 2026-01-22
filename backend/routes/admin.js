const express = require('express');
const router = express.Router();
const User = require('../models/User');

const adminAuth = (req, res, next) => {
  const adminKey = req.header('X-Admin-Key');
  if (adminKey === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        email: user.email,
        signupMethod: user.signupMethod,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        phoneAddedLater: user.phoneAddedLater
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const phoneSignups = await User.countDocuments({ signupMethod: 'phone' });
    const emailSignups = await User.countDocuments({ signupMethod: 'email' });
    const googleSignups = await User.countDocuments({ signupMethod: 'google' });
    const usersNeedingPhone = await User.countDocuments({ 
      phoneNumber: null,
      signupMethod: { $ne: 'phone' }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        phoneSignups,
        emailSignups,
        googleSignups,
        usersNeedingPhone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;