const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a template name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Please provide a thumbnail URL']
  },
  layoutConfig: {
    type: Object,
    required: [true, 'Please provide layout configuration']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
