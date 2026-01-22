const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/calculate-bonus', auth, (req, res) => {
  try {
    const { investment } = req.body;

    if (!investment || investment < 0) {
      return res.status(400).json({ message: 'Invalid investment amount' });
    }

    const bonusPercentage = 10;
    const maxBonus = 1000;
    
    let bonus = (investment * bonusPercentage) / 100;
    
    if (bonus > maxBonus) {
      bonus = maxBonus;
    }

    res.json({
      investment,
      bonusPercentage,
      calculatedBonus: bonus,
      maxBonus,
      message: bonus >= maxBonus 
        ? `You get maximum bonus of ₹${maxBonus}!` 
        : `You get ₹${bonus} bonus (${bonusPercentage}% of investment)`
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        userId: req.user.userId,
        phoneNumber: req.user.phoneNumber,
        email: req.user.email,
        fullName: req.user.fullName,
        signupMethod: req.user.signupMethod,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;