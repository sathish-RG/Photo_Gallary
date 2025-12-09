const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user reference'],
    unique: true, // One availability document per user
  },
  days: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    slots: [{
      type: String, // Time in format "HH:MM" (24-hour)
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format'],
    }],
  }],
  timezone: {
    type: String,
    default: 'UTC',
  },
}, {
  timestamps: true,
});

// Index for faster queries
availabilitySchema.index({ user: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
