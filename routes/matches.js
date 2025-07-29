const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get user's matches
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('matches.profileId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// Get user's liked profiles - MUST come before /:profileId routes
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedProfiles.profileId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.likedProfiles);
  } catch (error) {
    console.error('Error fetching liked profiles:', error);
    res.status(500).json({ message: 'Error fetching liked profiles' });
  }
});

// Get match statistics - MUST come before /:profileId routes
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      totalMatches: req.user.matches.length,
      totalLiked: req.user.likedProfiles.length,
      superLikes: req.user.likedProfiles.filter(like => like.superLiked).length,
      maxMatchesReached: req.user.matches.length >= 4
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({ message: 'Error fetching match stats' });
  }
});

// Like a profile
router.post('/like/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { superLiked = false } = req.body;
    
    // Check if profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Check if user already liked this profile
    const alreadyLiked = req.user.likedProfiles.find(
      like => like.profileId.toString() === profileId
    );
    
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Profile already liked' });
    }
    
    // Add to liked profiles
    req.user.likedProfiles.push({
      profileId,
      superLiked,
      likedAt: new Date()
    });
    
    // Check if this creates a match (for now, we'll consider it a match if super liked)
    // In a real app, you'd check if the other person also liked this user
    let isMatch = false;
    if (superLiked && req.user.matches.length < 4) {
      isMatch = true;
      req.user.matches.push({
        profileId,
        superLiked,
        matchedAt: new Date()
      });
    }
    
    await req.user.save();
    
    res.json({
      message: isMatch ? 'It\'s a match!' : 'Profile liked',
      isMatch,
      matchesCount: req.user.matches.length,
      maxMatchesReached: req.user.matches.length >= 4
    });
    
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({ message: 'Error liking profile' });
  }
});

// Super like a profile
router.post('/superlike/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Check if profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Check if user already liked this profile
    const alreadyLiked = req.user.likedProfiles.find(
      like => like.profileId.toString() === profileId
    );
    
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Profile already liked' });
    }
    
    // Check match limit
    if (req.user.matches.length >= 4) {
      return res.status(400).json({ 
        message: 'You\'ve reached the maximum of 4 matches',
        maxMatchesReached: true
      });
    }
    
    // Add to liked profiles and matches
    req.user.likedProfiles.push({
      profileId,
      superLiked: true,
      likedAt: new Date()
    });
    
    req.user.matches.push({
      profileId,
      superLiked: true,
      matchedAt: new Date()
    });
    
    await req.user.save();
    
    res.json({
      message: 'Super like sent! It\'s a match!',
      isMatch: true,
      matchesCount: req.user.matches.length,
      maxMatchesReached: req.user.matches.length >= 4
    });
    
  } catch (error) {
    console.error('Error super liking profile:', error);
    res.status(500).json({ message: 'Error super liking profile' });
  }
});

// Pass on a profile
router.post('/pass/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Check if profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ message: 'Profile passed' });
    
  } catch (error) {
    console.error('Error passing profile:', error);
    res.status(500).json({ message: 'Error passing profile' });
  }
});

// Remove a match
router.delete('/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Remove from matches
    req.user.matches = req.user.matches.filter(
      match => match.profileId.toString() !== profileId
    );
    
    // Remove from liked profiles
    req.user.likedProfiles = req.user.likedProfiles.filter(
      like => like.profileId.toString() !== profileId
    );
    
    await req.user.save();
    
    res.json({ 
      message: 'Match removed',
      matchesCount: req.user.matches.length
    });
    
  } catch (error) {
    console.error('Error removing match:', error);
    res.status(500).json({ message: 'Error removing match' });
  }
});

module.exports = router; 