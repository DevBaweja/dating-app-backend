const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched', 'blocked'],
    default: 'pending'
  },
  matchType: {
    type: String,
    enum: ['like', 'super_like', 'boost'],
    required: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'gif', 'emoji'],
      default: 'text'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likeType: {
      type: String,
      enum: ['like', 'super_like'],
      default: 'like'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  blocks: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake_profile', 'harassment', 'other'],
      default: 'other'
    },
    blockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    maxDistance: Number,
    dealBreakers: [String]
  },
  compatibility: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [{
      factor: String,
      weight: Number,
      score: Number
    }]
  },
  metadata: {
    matchQuality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    mutualInterests: [String],
    commonLocation: Boolean,
    ageDifference: Number,
    distance: Number
  },
  premium: {
    isPremiumMatch: {
      type: Boolean,
      default: false
    },
    premiumFeatures: [{
      type: String,
      enum: ['priority_matching', 'see_who_liked', 'unlimited_likes', 'rewind']
    }]
  },
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    messageResponseRate: {
      type: Number,
      default: 0
    },
    avgResponseTime: {
      type: Number,
      default: 0
    },
    conversationLength: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for match duration
matchSchema.virtual('matchDuration').get(function() {
  if (!this.matchedAt) return 0;
  return Math.floor((Date.now() - this.matchedAt.getTime()) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for last message
matchSchema.virtual('lastMessage').get(function() {
  if (!this.messages || this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual for unread message count
matchSchema.virtual('unreadCount').get(function() {
  if (!this.messages) return 0;
  return this.messages.filter(msg => !msg.isRead).length;
});

// Indexes for better performance
matchSchema.index({ users: 1 });
matchSchema.index({ status: 1, matchedAt: -1 });
matchSchema.index({ 'users.0': 1, 'users.1': 1 });
matchSchema.index({ matchType: 1 });
matchSchema.index({ lastInteraction: -1 });
matchSchema.index({ 'compatibility.score': -1 });
matchSchema.index({ createdAt: -1 });

// Compound indexes for common queries
matchSchema.index({ 
  status: 1, 
  matchedAt: -1, 
  'compatibility.score': -1 
});

matchSchema.index({ 
  users: 1, 
  status: 1, 
  lastInteraction: -1 
});

matchSchema.index({ 
  'premium.isPremiumMatch': 1, 
  status: 1, 
  matchedAt: -1 
});

// Pre-save middleware to update lastInteraction
matchSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastInteraction = new Date();
    this.interactionCount = this.messages.length;
  }
  next();
});

// Pre-save middleware to calculate compatibility
matchSchema.pre('save', function(next) {
  if (this.isModified('compatibility.factors')) {
    const totalScore = this.compatibility.factors.reduce((sum, factor) => {
      return sum + (factor.score * factor.weight);
    }, 0);
    this.compatibility.score = Math.round(totalScore);
  }
  next();
});

// Static method to find matches for a user
matchSchema.statics.findUserMatches = function(userId, status = 'matched', limit = 20) {
  return this.find({
    users: userId,
    status: status
  })
  .populate('users', 'name email')
  .populate('profiles', 'name age gender bio photos location')
  .sort({ lastInteraction: -1 })
  .limit(limit);
};

// Static method to find potential matches
matchSchema.statics.findPotentialMatches = function(userId, criteria = {}) {
  const query = {
    users: { $ne: userId },
    status: 'pending',
    ...criteria
  };
  
  return this.find(query)
    .populate('profiles', 'name age gender bio photos location')
    .sort({ 'compatibility.score': -1, createdAt: -1 });
};

// Static method to get match statistics
matchSchema.statics.getMatchStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        users: mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCompatibility: { $avg: '$compatibility.score' },
        totalMessages: { $sum: { $size: '$messages' } },
        avgResponseTime: { $avg: '$analytics.avgResponseTime' }
      }
    }
  ]);
};

// Static method to calculate compatibility between two profiles
matchSchema.statics.calculateCompatibility = function(profile1, profile2) {
  const factors = [];
  let totalScore = 0;
  
  // Age compatibility
  const ageDiff = Math.abs(profile1.age - profile2.age);
  const ageScore = Math.max(0, 100 - (ageDiff * 2));
  factors.push({ factor: 'age', weight: 0.2, score: ageScore });
  
  // Interest compatibility
  const commonInterests = profile1.interests.filter(interest => 
    profile2.interests.includes(interest)
  );
  const interestScore = (commonInterests.length / Math.max(profile1.interests.length, profile2.interests.length)) * 100;
  factors.push({ factor: 'interests', weight: 0.3, score: interestScore });
  
  // Location compatibility (if available)
  if (profile1.locationData && profile2.locationData) {
    // Calculate distance and score
    const distance = calculateDistance(
      profile1.locationData.coordinates,
      profile2.locationData.coordinates
    );
    const distanceScore = Math.max(0, 100 - (distance * 2));
    factors.push({ factor: 'location', weight: 0.25, score: distanceScore });
  }
  
  // Values compatibility
  const valueScore = calculateValueCompatibility(profile1, profile2);
  factors.push({ factor: 'values', weight: 0.25, score: valueScore });
  
  // Calculate total score
  totalScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
  
  return {
    score: Math.round(totalScore),
    factors: factors
  };
};

// Helper function to calculate distance between coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to calculate value compatibility
function calculateValueCompatibility(profile1, profile2) {
  let score = 50; // Base score
  
  // Religion compatibility
  if (profile1.religion && profile2.religion) {
    if (profile1.religion === profile2.religion) score += 20;
    else score -= 10;
  }
  
  // Political views compatibility
  if (profile1.politicalViews && profile2.politicalViews) {
    if (profile1.politicalViews === profile2.politicalViews) score += 15;
    else if (profile1.politicalViews === 'apolitical' || profile2.politicalViews === 'apolitical') score += 5;
    else score -= 10;
  }
  
  // Children compatibility
  if (profile1.wantsChildren !== null && profile2.wantsChildren !== null) {
    if (profile1.wantsChildren === profile2.wantsChildren) score += 15;
    else score -= 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Instance method to add message
matchSchema.methods.addMessage = function(senderId, content, messageType = 'text') {
  this.messages.push({
    sender: senderId,
    content: content,
    messageType: messageType,
    createdAt: new Date()
  });
  
  this.lastInteraction = new Date();
  this.interactionCount = this.messages.length;
  
  return this.save();
};

// Instance method to mark messages as read
matchSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });
  
  return this.save();
};

// Instance method to update analytics
matchSchema.methods.updateAnalytics = function(type, value) {
  const update = {};
  update[`analytics.${type}`] = value;
  return this.updateOne({ $set: update });
};

module.exports = mongoose.model('Match', matchSchema); 