const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const PDFDocument = require('pdfkit');

// @desc    Get all invoices for authenticated user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ photographer: req.user._id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices',
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      photographer: req.user._id,
    }).populate('client', 'name email phone address');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice',
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { client, items, status, dueDate } = req.body;

    // Verify client exists and belongs to user
    const clientDoc = await Client.findOne({
      _id: client,
      createdBy: req.user._id,
    });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.qty * item.price);
    }, 0);

    const invoice = await Invoice.create({
      client,
      photographer: req.user._id,
      items,
      totalAmount,
      status: status || 'pending',
      dueDate,
    });

    // Populate client data
    await invoice.populate('client', 'name email phone address');

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create invoice',
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const { items, status, dueDate } = req.body;

    let invoice = await Invoice.findOne({
      _id: req.params.id,
      photographer: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    // Recalculate total if items changed
    let totalAmount = invoice.totalAmount;
    if (items) {
      totalAmount = items.reduce((sum, item) => {
        return sum + (item.qty * item.price);
      }, 0);
    }

    invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { 
        ...(items && { items }),
        ...(status && { status }),
        ...(dueDate && { dueDate }),
        totalAmount,
      },
      { new: true, runValidators: true }
    ).populate('client', 'name email phone address');

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update invoice',
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      photographer: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice',
    });
  }
};

// @desc    Generate invoice PDF
// @route   POST /api/invoices/generate/:id
// @access  Private
exports.generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      photographer: req.user._id,
    })
      .populate('client', 'name email phone address')
      .populate('photographer', 'username email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc.fontSize(28)
       .fillColor('#2563eb')
       .text('INVOICE', 50, 50);

    // Photographer Info (Top Right)
    doc.fontSize(10)
       .fillColor('#374151')
       .text(`From: ${invoice.photographer.username}`, 350, 50, { align: 'right' })
       .text(`Email: ${invoice.photographer.email}`, 350, 65, { align: 'right' });

    // Invoice Details
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 120)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 135)
       .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 150)
       .text(`Status: ${invoice.status.toUpperCase()}`, 50, 165);

    // Client Info
    doc.fontSize(12)
       .fillColor('#111827')
       .text('Bill To:', 50, 200);
    
    doc.fontSize(10)
       .fillColor('#374151')
       .text(invoice.client.name, 50, 220)
       .text(invoice.client.email, 50, 235);
    
    if (invoice.client.phone) {
      doc.text(invoice.client.phone, 50, 250);
    }
    if (invoice.client.address) {
      doc.text(invoice.client.address, 50, invoice.client.phone ? 265 : 250);
    }

    // Line separator
    const tableTop = 320;
    doc.moveTo(50, tableTop)
       .lineTo(550, tableTop)
       .strokeColor('#e5e7eb')
       .stroke();

    // Table Header
    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text('Description', 50, tableTop + 15)
       .text('Qty', 320, tableTop + 15)
       .text('Price', 390, tableTop + 15)
       .text('Amount', 480, tableTop + 15, { align: 'right' });

    // Table Items
    let yPosition = tableTop + 45;
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#374151');

    invoice.items.forEach((item, index) => {
      const itemAmount = item.qty * item.price;
      
      doc.text(item.desc, 50, yPosition, { width: 260 })
         .text(item.qty.toString(), 320, yPosition)
         .text(`$${item.price.toFixed(2)}`, 390, yPosition)
         .text(`$${itemAmount.toFixed(2)}`, 480, yPosition, { align: 'right' });

      yPosition += 25;
    });

    // Separator before total
    yPosition += 10;
    doc.moveTo(350, yPosition)
       .lineTo(550, yPosition)
       .strokeColor('#e5e7eb')
       .stroke();

    // Total
    yPosition += 20;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('Total:', 350, yPosition)
       .text(`$${invoice.totalAmount.toFixed(2)}`, 480, yPosition, { align: 'right' });

    // Footer
    doc.fontSize(9)
       .fillColor('#9ca3af')
       .text('Thank you for your business!', 50, 700, { align: 'center' });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
    });
  }
};
