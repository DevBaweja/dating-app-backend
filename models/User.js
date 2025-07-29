const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  matches: [{
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    },
    superLiked: {
      type: Boolean,
      default: false
    },
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likedProfiles: [{
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    },
    superLiked: {
      type: Boolean,
      default: false
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for better query performance (only one index declaration)
userSchema.index({ profileId: 1 });

module.exports = mongoose.model('User', userSchema); 