const GiftCard = require('../models/GiftCard');
const Media = require('../models/Media');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

/**
 * @desc    Create a new gift card
 * @route   POST /api/gift-cards
 * @access  Private (requires authentication)
 */
exports.createGiftCard = async (req, res) => {
  try {
    const { title, message, themeColor, mediaContent, albumId, password } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both title and message',
      });
    }

    if (!albumId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide album ID',
      });
    }

    // Validate media content
    if (!mediaContent || !Array.isArray(mediaContent) || mediaContent.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one media item',
      });
    }

    // Verify all media items exist and belong to the user
    // Extract all media IDs from all blocks
    const allMediaIds = mediaContent.flatMap(block => 
      block.mediaItems.map(item => item.mediaId)
    );
    
    // Deduplicate IDs for verification
    const uniqueMediaIds = [...new Set(allMediaIds)];

    const mediaItems = await Media.find({
      _id: { $in: uniqueMediaIds },
      user: req.user._id,
    });

    if (mediaItems.length !== uniqueMediaIds.length) {
      console.error('Media verification failed:', {
        found: mediaItems.length,
        expected: uniqueMediaIds.length,
        foundIds: mediaItems.map(m => m._id.toString()),
        requestedIds: uniqueMediaIds
      });
      return res.status(404).json({
        success: false,
        error: 'One or more media items not found or do not belong to you',
      });
    }

    // Generate unique slug (10 characters, URL-safe)
    const uniqueSlug = nanoid(10);

    // Prepare gift card data
    const giftCardData = {
      sender: req.user._id,
      albumId,
      title,
      message,
      themeColor: themeColor || '#ec4899',
      uniqueSlug,
      mediaContent: mediaContent.map((block, index) => ({
        blockId: block.blockId,
        blockLayoutType: block.blockLayoutType,
        order: block.order !== undefined ? block.order : index,
        mediaItems: block.mediaItems.map(item => ({
          mediaId: item.mediaId,
          type: item.type
        }))
      })),
    };

    // Handle password protection
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      giftCardData.password = await bcrypt.hash(password, salt);
      giftCardData.isProtected = true;
    }

    // Create gift card
    const giftCard = await GiftCard.create(giftCardData);

    res.status(201).json({
      success: true,
      data: giftCard,
      publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/view/${uniqueSlug}`,
    });
  } catch (error) {
    console.error('Error creating gift card:', error);
    
    // Handle duplicate slug (very unlikely with nanoid)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate unique link. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create gift card',
    });
  }
};

/**
 * @desc    Get gift card by slug (public access)
 * @route   GET /api/gift-cards/view/:slug
 * @access  Public (no authentication required)
 */
exports.getGiftCardBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find gift card
    const giftCard = await GiftCard.findOne({ uniqueSlug: slug })
      .populate('sender', 'username');

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found',
      });
    }

    // Check if protected
    if (giftCard.isProtected) {
      // Return limited data
      return res.status(200).json({
        success: true,
        data: {
          _id: giftCard._id,
          title: "Has a Gift for you", // Obfuscate title if preferred, or keep it
          themeColor: giftCard.themeColor,
          isProtected: true,
          sender: giftCard.sender,
          // Do NOT send mediaContent or message
        },
      });
    }

    // If not protected, populate media and return full data
    if (giftCard.mediaContent && giftCard.mediaContent.length > 0) {
      try {
        await giftCard.populate('mediaContent.mediaItems.mediaId');
      } catch (err) {
        console.error('Error populating media:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: giftCard,
    });
  } catch (error) {
    console.error('Error fetching gift card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gift card',
    });
  }
};

/**
 * @desc    Unlock a protected gift card
 * @route   POST /api/gift-cards/unlock/:slug
 * @access  Public
 */
exports.unlockGiftCard = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a password',
      });
    }

    // Find gift card explicitly selecting the password field
    const giftCard = await GiftCard.findOne({ uniqueSlug: slug }).select('+password');

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found',
      });
    }

    if (!giftCard.isProtected) {
      // If not protected, just return the data (populate media first)
      await giftCard.populate('sender', 'username');
      await giftCard.populate('mediaContent.mediaItems.mediaId');
      
      return res.status(200).json({
        success: true,
        data: giftCard,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, giftCard.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password',
      });
    }

    // Password correct, return full data
    await giftCard.populate('sender', 'username');
    
    if (giftCard.mediaContent && giftCard.mediaContent.length > 0) {
      try {
        await giftCard.populate('mediaContent.mediaItems.mediaId');
      } catch (err) {
        console.error('Error populating media:', err);
      }
    }

    // Remove password from response
    giftCard.password = undefined;

    res.status(200).json({
      success: true,
      data: giftCard,
    });

  } catch (error) {
    console.error('Error unlocking gift card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlock gift card',
    });
  }
};

/**
 * @desc    Get all gift cards for a specific album
 * @route   GET /api/albums/:albumId/gift-cards
 * @access  Private (requires authentication)
 */
exports.getAlbumGiftCards = async (req, res) => {
  try {
    const { albumId } = req.params;

    // Find all gift cards for this album that belong to the user
    const giftCards = await GiftCard.find({
      albumId,
      sender: req.user._id,
    })
      .populate('mediaContent.mediaItems.mediaId', 'filePath fileType')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: giftCards.length,
      data: giftCards,
    });
  } catch (error) {
    console.error('Error fetching album gift cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gift cards',
    });
  }
};

/**
 * @desc    Update a gift card
 * @route   PUT /api/gift-cards/:id
 * @access  Private (requires authentication)
 */
exports.updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, themeColor, mediaContent, password } = req.body;

    // Find gift card
    const giftCard = await GiftCard.findById(id);

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found',
      });
    }

    // Verify ownership
    if (giftCard.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this gift card',
      });
    }

    // If media content is being updated, verify all media items
    if (mediaContent && Array.isArray(mediaContent)) {
      const allMediaIds = mediaContent.flatMap(block => 
        block.mediaItems.map(item => item.mediaId)
      );
      
      // Deduplicate IDs for verification
      const uniqueMediaIds = [...new Set(allMediaIds)];

      const mediaItems = await Media.find({
        _id: { $in: uniqueMediaIds },
        user: req.user._id,
      });

      if (mediaItems.length !== uniqueMediaIds.length) {
        console.error('Media verification failed:', {
          found: mediaItems.length,
          expected: uniqueMediaIds.length,
          foundIds: mediaItems.map(m => m._id.toString()),
          requestedIds: uniqueMediaIds
        });
        return res.status(404).json({
          success: false,
          error: 'One or more media items not found or do not belong to you',
        });
      }

      giftCard.mediaContent = mediaContent.map((block, index) => ({
        blockId: block.blockId,
        blockLayoutType: block.blockLayoutType,
        order: block.order !== undefined ? block.order : index,
        mediaItems: block.mediaItems.map(item => ({
          mediaId: item.mediaId,
          type: item.type
        }))
      }));
    }

    // Update fields
    if (title) giftCard.title = title;
    if (message) giftCard.message = message;
    if (themeColor) giftCard.themeColor = themeColor;

    // Update password if provided
    if (password !== undefined) {
      if (password.trim().length > 0) {
        const salt = await bcrypt.genSalt(10);
        giftCard.password = await bcrypt.hash(password, salt);
        giftCard.isProtected = true;
      } else {
        // If empty string provided, remove protection
        giftCard.password = undefined;
        giftCard.isProtected = false;
      }
    }

    // Save (middleware will update updatedAt)
    await giftCard.save();

    // Populate media details for response
    await giftCard.populate('mediaContent.mediaItems.mediaId');

    res.status(200).json({
      success: true,
      data: giftCard,
      publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/view/${giftCard.uniqueSlug}`,
    });
  } catch (error) {
    console.error('Error updating gift card:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update gift card',
    });
  }
};

/**
 * @desc    Delete a gift card
 * @route   DELETE /api/gift-cards/:id
 * @access  Private (requires authentication)
 */
exports.deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Find gift card and verify ownership
    const giftCard = await GiftCard.findById(id);

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found',
      });
    }

    // Verify ownership
    if (giftCard.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this gift card',
      });
    }

    // Delete the gift card
    await GiftCard.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Gift card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gift card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete gift card',
    });
  }
};
