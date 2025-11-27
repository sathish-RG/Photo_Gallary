const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a template name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description can not be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['birthday', 'wedding', 'anniversary', 'party', 'retro', 'minimal', 'modern', 'elegant', 'other'],
    default: 'other'
  },
  thumbnailUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Template+Preview'
  },
  styleConfig: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    backgroundImageUrl: {
      type: String
    },
    fontFamily: {
      type: String,
      default: 'Inter, sans-serif'
    },
    textColor: {
      type: String,
      default: '#000000'
    },
    animationType: {
      type: String,
      enum: ['fade-in', 'slide-up', 'slide-down', 'zoom-in', 'bounce', 'none'],
      default: 'fade-in'
    },
    containerStyle: {
      type: Object,
      default: {}
    }
  },
  layoutConfig: {
    type: Object,
    required: [true, 'Please provide layout configuration']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Allow system templates without a creator
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
