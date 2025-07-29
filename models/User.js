const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot be more than 100']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  interestedIn: {
    type: String,
    required: [true, 'Please specify who you are interested in'],
    enum: ['male', 'female', 'both']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  photos: [{
    type: String,
    validate: {
      validator: function(v) {
        return v.length <= 6; // Maximum 6 photos
      },
      message: 'Cannot have more than 6 photos'
    }
  }],
  interests: [{
    type: String,
    maxlength: [50, 'Interest cannot be more than 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    ageRange: {
      min: { type: Number, default: 18, min: 18 },
      max: { type: Number, default: 100, max: 100 }
    },
    maxDistance: {
      type: Number,
      default: 50,
      min: 1,
      max: 100
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    }
  },
  stats: {
    totalLikes: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    totalSuperLikes: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1, lastActive: -1 });
userSchema.index({ location: 1 });
userSchema.index({ age: 1, gender: 1, interestedIn: 1 });
userSchema.index({ 'preferences.ageRange.min': 1, 'preferences.ageRange.max': 1 });
userSchema.index({ createdAt: -1 });

// Compound indexes for common queries
userSchema.index({ 
  isActive: 1, 
  age: 1, 
  gender: 1, 
  'preferences.maxDistance': 1 
});

userSchema.index({ 
  isActive: 1, 
  lastActive: -1, 
  age: 1, 
  gender: 1 
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastActive
userSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive) {
    this.lastActive = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find active users for matching
userSchema.statics.findActiveUsers = function(criteria) {
  return this.find({
    isActive: true,
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Active in last 7 days
    ...criteria
  }).select('-password -verificationToken -resetPasswordToken');
};

// Static method to get user stats
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } },
        avgAge: { $avg: '$age' },
        totalMatches: { $sum: '$stats.totalMatches' },
        totalLikes: { $sum: '$stats.totalLikes' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 