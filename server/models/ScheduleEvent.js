const mongoose = require('mongoose');

const scheduleEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user reference'],
  },
  eventName: {
    type: String,
    required: [true, 'Please provide event name'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date'],
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format'],
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format'],
  },
  description: {
    type: String,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true, // true = available for booking, false = blocked time
  },
  color: {
    type: String,
    default: '#3b82f6', // Color for calendar display
  },
}, {
  timestamps: true,
});

// Index for faster queries
scheduleEventSchema.index({ user: 1, date: 1 });
scheduleEventSchema.index({ user: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('ScheduleEvent', scheduleEventSchema);
