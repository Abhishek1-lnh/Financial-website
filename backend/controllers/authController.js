const User = require('../models/UserModel');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { sendSMSOTP, sendWhatsAppOTP } = require('../services/smsService');
const { sendEmailOTP } = require('../services/emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.requestOTP = async (req, res) => {
  try {
    const { identifier, type, method } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({ message: 'Identifier and type are required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ identifier });

    await OTP.create({
      identifier,
      otp,
      type,
      expiresAt
    });

    let result;
    if (type === 'phone') {
      if (method === 'whatsapp') {
        result = await sendWhatsAppOTP(identifier, otp);
      } else {
        result = await sendSMSOTP(identifier, otp);
      }
    } else if (type === 'email') {
      result = await sendEmailOTP(identifier, otp);
    }

    if (result.success) {
      res.json({ 
        success: true, 
        message: `OTP sent successfully to ${identifier}`,
        expiresIn: 300
      });
    } else {
      res.status(500).json({ message: 'Failed to send OTP', error: result.error });
    }

  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { identifier, otp, type } = req.body;

    const otpRecord = await OTP.findOne({ 
      identifier, 
      otp, 
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    let user;
    if (type === 'phone') {
      user = await User.findOne({ phoneNumber: identifier });
    } else {
      user = await User.findOne({ email: identifier });
    }

    if (!user) {
      user = new User({
        signupMethod: type,
        [type === 'phone' ? 'phoneNumber' : 'email']: identifier,
        [type === 'phone' ? 'isPhoneVerified' : 'isEmailVerified']: true
      });
      await user.save();
    } else {
      if (type === 'phone') {
        user.isPhoneVerified = true;
      } else {
        user.isEmailVerified = true;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        email: user.email,
        signupMethod: user.signupMethod,
        needsPhone: user.signupMethod !== 'phone' && !user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.googleSignIn = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        user.googleId = googleId;
        user.signupMethod = 'google';
      } else {
        user = new User({
          googleId,
          email,
          fullName: name,
          signupMethod: 'google',
          isEmailVerified: true
        });
      }
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google sign-in successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        needsPhone: !user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Google Sign In Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const userId = req.user._id;

    const otpRecord = await OTP.findOne({ 
      identifier: phoneNumber, 
      otp,
      type: 'phone',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findById(userId);
    user.phoneNumber = phoneNumber;
    user.isPhoneVerified = true;
    user.phoneAddedLater = true;
    await user.save();

    res.json({
      success: true,
      message: 'Phone number added successfully',
      user: {
        phoneNumber: user.phoneNumber,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Add Phone Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};