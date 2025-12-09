const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide photographer reference'],
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please provide service reference'],
  },
  clientName: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true,
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide client email'],
    trim: true,
    lowercase: true,
  },
  clientPhone: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide booking date'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Please provide time slot'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'deposit_paid', 'paid'],
    default: 'unpaid',
  },
  stripePaymentIntent: {
    type: String,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index for conflict checking
bookingSchema.index({ photographer: 1, date: 1, timeSlot: 1 });
bookingSchema.index({ photographer: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
