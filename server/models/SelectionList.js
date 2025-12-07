const mongoose = require('mongoose');

const selectionListSchema = new mongoose.Schema({
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  giftCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GiftCard'
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mediaItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  status: {
    type: String,
    enum: ['new', 'reviewed', 'completed'],
    default: 'new'
  },
  message: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SelectionList', selectionListSchema);
