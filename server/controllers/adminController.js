const PhysicalCard = require('../models/PhysicalCard');
const QRCode = require('qrcode');
const AdmZip = require('adm-zip');
const { nanoid } = require('nanoid');

/**
 * @desc    Generate a batch of QR codes
 * @route   POST /api/admin/generate-batch
 * @access  Private (Admin only)
 */
exports.generateBatch = async (req, res) => {
  try {
    const { quantity, batchName } = req.body;

    if (!quantity || !batchName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide quantity and batch name',
      });
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0 || numQuantity > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a number between 1 and 1000',
      });
    }

    const zip = new AdmZip();
    const cards = [];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Generate cards
    for (let i = 0; i < numQuantity; i++) {
      const qrCodeId = nanoid(10); // Short unique ID
      const claimUrl = `${frontendUrl}/claim/${qrCodeId}`;

      // Create DB entry
      cards.push({
        qrCodeId,
        batchName,
        isClaimed: false,
      });

      // Generate QR Code image
      const qrImage = await QRCode.toBuffer(claimUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Add to ZIP
      zip.addFile(`qr-${qrCodeId}.png`, qrImage);
    }

    // Save to DB in bulk
    await PhysicalCard.insertMany(cards);

    // Create ZIP buffer
    const zipBuffer = zip.toBuffer();

    // Send ZIP file
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=${batchName.replace(/\s+/g, '-')}-qrcodes.zip`);
    res.set('Content-Length', zipBuffer.length);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while generating batch',
    });
  }
};

/**
 * @desc    Get dashboard configuration
 * @route   GET /api/admin/config
 * @access  Private/Admin
 */
exports.getConfig = async (req, res) => {
  try {
    // For now, we'll return a default config or mock data
    // In a real app, this would come from a database model (e.g., SystemConfig)
    const config = {
      sidebarColor: '#1f2937',
      navbarColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      showSidebar: true
    };
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Update dashboard configuration
 * @route   PUT /api/admin/config
 * @access  Private/Admin
 */
exports.updateConfig = async (req, res) => {
  try {
    const config = req.body;
    // In a real app, save to DB
    // console.log('Updating config:', config);
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get user content (folders and media)
 * @route   GET /api/admin/users/:id/content
 * @access  Private/Admin
 */
exports.getUserContent = async (req, res) => {
  try {
    const { id } = req.params;
    const User = require('../models/User');
    const Folder = require('../models/Folder');
    const Media = require('../models/Media');

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const folders = await Folder.find({ user: id }).sort('-createdAt');
    const media = await Media.find({ user: id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        user,
        folders,
        media
      }
    });
  } catch (error) {
    console.error('Get user content error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
