const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    }
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if token is valid
passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema); 