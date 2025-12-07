const SelectionList = require('../models/SelectionList');
const Folder = require('../models/Folder');
const GiftCard = require('../models/GiftCard');

// @desc    Create a new selection list (Client submits favorites)
// @route   POST /api/selections
// @access  Public
exports.createSelection = async (req, res) => {
  try {
    const { folderId, giftCardId, clientName, clientEmail, mediaIds, message } = req.body;

    if (!folderId || !clientName || !clientEmail || !mediaIds || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields (folderId, name, email, selected photos)'
      });
    }

    // Verify folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Album not found'
      });
    }

    const selectionList = await SelectionList.create({
      folderId,
      giftCardId: giftCardId || null,
      clientName,
      clientEmail,
      mediaItems: mediaIds,
      message
    });

    res.status(201).json({
      success: true,
      data: selectionList
    });
  } catch (error) {
    console.error('Error creating selection list:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all selections for a specific folder
// @route   GET /api/selections/folder/:folderId
// @access  Private
exports.getSelectionsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const selections = await SelectionList.find({ folderId })
      .populate('mediaItems')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: selections.length,
      data: selections
    });
  } catch (error) {
    console.error('Error fetching selections:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update selection status
// @route   PUT /api/selections/:id/status
// @access  Private
exports.updateSelectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const selection = await SelectionList.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!selection) {
      return res.status(404).json({
        success: false,
        error: 'Selection list not found'
      });
    }

    res.status(200).json({
      success: true,
      data: selection
    });
  } catch (error) {
    console.error('Error updating selection status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
