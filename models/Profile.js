const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500
  },
  photo: {
    type: String,
    required: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  lookingFor: {
    type: String,
    required: true,
    maxlength: 200
  },
  hobbies: [{
    type: String,
    trim: true
  }],
  job: {
    type: String,
    required: true,
    trim: true
  },
  education: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
profileSchema.index({ isActive: 1, age: 1 });

module.exports = mongoose.model('Profile', profileSchema); 