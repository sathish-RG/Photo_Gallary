const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Please provide client reference'],
  },
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide photographer reference'],
  },
  items: [{
    desc: {
      type: String,
      required: [true, 'Please provide item description'],
      trim: true,
    },
    qty: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date'],
  },
}, {
  timestamps: true,
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Index for faster queries
invoiceSchema.index({ photographer: 1, createdAt: -1 });
invoiceSchema.index({ client: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
