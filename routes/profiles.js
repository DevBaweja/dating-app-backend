const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get all active profiles (for swiping)
router.get('/', auth, async (req, res) => {
  try {
    const profiles = await Profile.find({ 
      isActive: true,
      _id: { $ne: req.user.profileId } // Exclude user's own profile
    }).sort({ createdAt: -1 });
    
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

// Seed profiles with initial data - MUST come before /:id routes
router.post('/seed', async (req, res) => {
  try {
    const initialProfiles = [
      {
        name: 'Alex',
        age: 27,
        bio: 'Love hiking, coffee, and spontaneous adventures!',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        interests: ['Hiking', 'Coffee', 'Travel', 'Photography', 'Rock Climbing'],
        lookingFor: 'Someone adventurous who loves the outdoors',
        hobbies: ['Weekend camping trips', 'Trying new coffee shops', 'Photography walks'],
        job: 'Software Engineer',
        education: 'Computer Science Degree',
        location: 'San Francisco'
      },
      {
        name: 'Taylor',
        age: 25,
        bio: 'Designer. Dog lover. Looking for someone to share memes with.',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        interests: ['Design', 'Dogs', 'Memes', 'Art', 'Netflix'],
        lookingFor: 'Someone creative and funny',
        hobbies: ['Sketching', 'Dog walking', 'Binge-watching shows', 'Crafting'],
        job: 'UI/UX Designer',
        education: 'Design School',
        location: 'New York'
      },
      {
        name: 'Jordan',
        age: 29,
        bio: 'Foodie, traveler, and music enthusiast.',
        photo: 'https://randomuser.me/api/portraits/men/65.jpg',
        interests: ['Cooking', 'Travel', 'Music', 'Wine', 'Cuisine'],
        lookingFor: 'Someone who appreciates good food and music',
        hobbies: ['Cooking new recipes', 'Concert going', 'Wine tasting', 'Exploring restaurants'],
        job: 'Chef',
        education: 'Culinary Arts',
        location: 'Los Angeles'
      },
      {
        name: 'Morgan',
        age: 26,
        bio: 'Bookworm. Yoga every morning. Let\'s chat!',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
        interests: ['Reading', 'Yoga', 'Meditation', 'Writing', 'Tea'],
        lookingFor: 'Someone intellectual and mindful',
        hobbies: ['Morning yoga', 'Book club', 'Journaling', 'Tea ceremonies'],
        job: 'Librarian',
        education: 'English Literature',
        location: 'Boston'
      },
      {
        name: 'Casey',
        age: 28,
        bio: 'Photographer. Coffee addict. Adventure seeker.',
        photo: 'https://randomuser.me/api/portraits/women/22.jpg',
        interests: ['Photography', 'Coffee', 'Adventure', 'Nature', 'Art'],
        lookingFor: 'Someone who loves exploring and creativity',
        hobbies: ['Street photography', 'Coffee brewing', 'Hiking', 'Art galleries'],
        job: 'Professional Photographer',
        education: 'Fine Arts',
        location: 'Seattle'
      },
      {
        name: 'Riley',
        age: 24,
        bio: 'Artist. Cat person. Love trying new restaurants.',
        photo: 'https://randomuser.me/api/portraits/men/45.jpg',
        interests: ['Art', 'Cats', 'Food', 'Painting', 'Museums'],
        lookingFor: 'Someone artistic and food-loving',
        hobbies: ['Painting', 'Cat sitting', 'Restaurant hopping', 'Gallery visits'],
        job: 'Freelance Artist',
        education: 'Art School',
        location: 'Portland'
      }
    ];

    await Profile.deleteMany({}); // Clear existing profiles
    const profiles = await Profile.insertMany(initialProfiles);
    
    res.json({ message: 'Profiles seeded successfully', count: profiles.length });
  } catch (error) {
    console.error('Error seeding profiles:', error);
    res.status(500).json({ message: 'Error seeding profiles', error: error.message });
  }
});

// Get a specific profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Create a new profile
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      age,
      bio,
      photo,
      interests,
      lookingFor,
      hobbies,
      job,
      education,
      location
    } = req.body;

    const profile = new Profile({
      name,
      age,
      bio,
      photo,
      interests,
      lookingFor,
      hobbies,
      job,
      education,
      location
    });

    const savedProfile = await profile.save();
    
    // Update user's profileId
    req.user.profileId = savedProfile._id;
    await req.user.save();
    
    res.status(201).json(savedProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(400).json({ message: 'Error creating profile', error: error.message });
  }
});

// Update a profile
router.put('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Delete a profile
router.delete('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
});

module.exports = router; 