const mongoose = require('mongoose');

const physicalCardSchema = new mongoose.Schema({
  qrCodeId: {
    type: String,
    required: true,
    unique: true,
  },
  isClaimed: {
    type: Boolean,
    default: false,
  },
  linkedGiftCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GiftCard',
    default: null,
  },
  batchName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PhysicalCard', physicalCardSchema);
