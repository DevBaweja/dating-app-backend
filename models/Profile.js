const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  job: {
    type: String,
    maxlength: [100, 'Job cannot be more than 100 characters']
  },
  education: {
    type: String,
    maxlength: [100, 'Education cannot be more than 100 characters']
  },
  height: {
    type: Number,
    min: [120, 'Height must be at least 120cm'],
    max: [250, 'Height cannot be more than 250cm']
  },
  relationshipStatus: {
    type: String,
    enum: ['single', 'divorced', 'widowed', 'separated']
  },
  hasChildren: {
    type: Boolean,
    default: false
  },
  wantsChildren: {
    type: Boolean,
    default: null // null = not specified
  },
  smoking: {
    type: String,
    enum: ['never', 'occasionally', 'regularly', 'trying_to_quit']
  },
  drinking: {
    type: String,
    enum: ['never', 'occasionally', 'socially', 'regularly']
  },
  religion: {
    type: String,
    maxlength: [50, 'Religion cannot be more than 50 characters']
  },
  politicalViews: {
    type: String,
    enum: ['liberal', 'moderate', 'conservative', 'apolitical']
  },
  languages: [{
    type: String,
    maxlength: [30, 'Language cannot be more than 30 characters']
  }],
  hobbies: [{
    type: String,
    maxlength: [50, 'Hobby cannot be more than 50 characters']
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['photo', 'social_media', 'document']
  },
  premium: {
    isPremium: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    features: [{
      type: String,
      enum: ['unlimited_likes', 'see_who_liked', 'rewind', 'boost', 'super_likes']
    }]
  },
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
    dealBreakers: [{
      type: String,
      enum: ['smoking', 'drinking', 'has_children', 'different_religion', 'different_politics']
    }]
  },
  stats: {
    totalLikes: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    totalSuperLikes: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 } // in hours
  },
  locationData: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    city: String,
    state: String,
    country: String,
    timezone: String
  },
  privacy: {
    showOnlineStatus: { type: Boolean, default: true },
    showLastActive: { type: Boolean, default: true },
    showDistance: { type: Boolean, default: true },
    showAge: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for profile completion percentage
profileSchema.virtual('completionPercentage').get(function() {
  const requiredFields = ['name', 'age', 'gender', 'interestedIn', 'location'];
  const optionalFields = ['bio', 'photos', 'interests', 'job', 'education'];
  
  let completed = 0;
  let total = requiredFields.length + optionalFields.length;
  
  requiredFields.forEach(field => {
    if (this[field]) completed++;
  });
  
  optionalFields.forEach(field => {
    if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
      completed++;
    }
  });
  
  return Math.round((completed / total) * 100);
});

// Virtual for distance calculation
profileSchema.virtual('distance').get(function() {
  // This will be calculated dynamically based on user location
  return null;
});

// Indexes for better performance
profileSchema.index({ userId: 1 });
profileSchema.index({ isActive: 1, lastActive: -1 });
profileSchema.index({ age: 1, gender: 1, interestedIn: 1 });
profileSchema.index({ location: 1 });
profileSchema.index({ 'locationData.coordinates': '2dsphere' });
profileSchema.index({ 'preferences.ageRange.min': 1, 'preferences.ageRange.max': 1 });
profileSchema.index({ createdAt: -1 });
profileSchema.index({ isVerified: 1 });
profileSchema.index({ 'premium.isPremium': 1 });

// Compound indexes for common queries
profileSchema.index({ 
  isActive: 1, 
  age: 1, 
  gender: 1, 
  interestedIn: 1,
  'preferences.maxDistance': 1 
});

profileSchema.index({ 
  isActive: 1, 
  lastActive: -1, 
  age: 1, 
  gender: 1 
});

profileSchema.index({ 
  isActive: 1, 
  isVerified: 1, 
  'premium.isPremium': 1 
});

// Pre-save middleware to update lastActive
profileSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive) {
    this.lastActive = new Date();
  }
  next();
});

// Pre-save middleware to calculate completion
profileSchema.pre('save', function(next) {
  const completionPercentage = this.completionPercentage;
  this.profileCompleted = completionPercentage >= 80;
  next();
});

// Static method to find profiles for matching
profileSchema.statics.findProfilesForMatching = function(userProfile, limit = 20) {
  const { age, gender, interestedIn, preferences, locationData } = userProfile;
  
  let query = {
    isActive: true,
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Active in last 7 days
    _id: { $ne: userProfile._id } // Exclude self
  };
  
  // Gender matching logic
  if (interestedIn === 'both') {
    query.gender = { $in: ['male', 'female'] };
  } else {
    query.gender = interestedIn;
  }
  
  // Age range matching
  if (preferences && preferences.ageRange) {
    query.age = {
      $gte: preferences.ageRange.min,
      $lte: preferences.ageRange.max
    };
  }
  
  // Location-based filtering (if coordinates available)
  if (locationData && locationData.coordinates && preferences && preferences.maxDistance) {
    query['locationData.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: locationData.coordinates
        },
        $maxDistance: preferences.maxDistance * 1000 // Convert km to meters
      }
    };
  }
  
  return this.find(query)
    .select('-stats -privacy -premium')
    .limit(limit)
    .sort({ lastActive: -1, isVerified: -1 });
};

// Static method to get profile stats
profileSchema.statics.getProfileStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalProfiles: { $sum: 1 },
        activeProfiles: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedProfiles: { $sum: { $cond: ['$isVerified', 1, 0] } },
        premiumProfiles: { $sum: { $cond: ['$premium.isPremium', 1, 0] } },
        avgAge: { $avg: '$age' },
        totalMatches: { $sum: '$stats.totalMatches' },
        totalLikes: { $sum: '$stats.totalLikes' },
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

// Instance method to update stats
profileSchema.methods.updateStats = function(type, increment = 1) {
  const update = {};
  update[`stats.${type}`] = increment;
  return this.updateOne({ $inc: update });
};

// Instance method to calculate response rate
profileSchema.methods.calculateResponseRate = function() {
  // This would be calculated based on actual interactions
  // For now, return a placeholder
  return this.stats.responseRate;
};

module.exports = mongoose.model('Profile', profileSchema); 