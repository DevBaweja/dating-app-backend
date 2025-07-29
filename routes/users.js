const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const PasswordReset = require('../models/PasswordReset');
const auth = require('../middleware/auth');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../services/emailService');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profileId: user.profileId
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        profileId: user.profileId
      }
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Populate profile if exists
    if (user.profileId) {
      const profile = await Profile.findById(user.profileId);
      user.profile = profile;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user
router.put('/me', auth, async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      req.user.email = email;
    }

    await req.user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        profileId: req.user.profileId
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ message: 'Error changing password', error: error.message });
  }
});

// Delete user account
router.delete('/me', auth, async (req, res) => {
  try {
    // Delete associated profile if exists
    if (req.user.profileId) {
      await Profile.findByIdAndDelete(req.user.profileId);
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      totalMatches: req.user.matches.length,
      totalLiked: req.user.likedProfiles.length,
      superLikes: req.user.likedProfiles.filter(like => like.superLiked).length,
      hasProfile: !!req.user.profileId,
      maxMatchesReached: req.user.matches.length >= 4
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save reset token to database
    const passwordReset = new PasswordReset({
      email,
      token
    });
    await passwordReset.save();

    // Send reset email
    const frontendUrl = process.env.FRONTEND_URL || 'https://dating-app-frontend-ten.vercel.app';
    const emailSent = await sendPasswordResetEmail(email, token, frontendUrl);

    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending reset email' });
    }

    res.json({ message: 'Password reset email sent successfully' });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find reset token
    const passwordReset = await PasswordReset.findOne({ token });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is valid
    if (!passwordReset.isValid()) {
      return res.status(400).json({ message: 'Reset token has expired or been used' });
    }

    // Find user by email
    const user = await User.findOne({ email: passwordReset.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark token as used
    passwordReset.used = true;
    await passwordReset.save();

    // Send success email
    await sendPasswordResetSuccessEmail(user.email);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const passwordReset = await PasswordReset.findOne({ token });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (!passwordReset.isValid()) {
      return res.status(400).json({ message: 'Reset token has expired or been used' });
    }

    res.json({ message: 'Token is valid' });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'Error verifying reset token' });
  }
});

module.exports = router; 