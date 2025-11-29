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
    const { title, message, themeColor, mediaContent, albumId, password, templateId, branding } = req.body;

    // Validate required fields
    if (!title || !message || !mediaContent || !albumId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, message, mediaContent, and albumId',
      });
    }

    // Validate mediaContent structure
    if (!Array.isArray(mediaContent) || mediaContent.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'mediaContent must be a non-empty array',
      });
    }

    // Validate all media items exist
    const allMediaIds = mediaContent.flatMap(block => 
      block.mediaItems.map(item => item.mediaId)
    );

    const mediaItems = await Media.find({ _id: { $in: allMediaIds } });

    if (mediaItems.length !== allMediaIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more media items not found',
      });
    }

    // Generate unique slug
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
      template: templateId || undefined,
      branding: (branding && (branding.name || branding.logoUrl)) ? branding : undefined,
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
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
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
    const Folder = require('../models/Folder');
    const { applyWatermarkToImages } = require('../utils/cloudinaryHelper');

    // Find gift card
    const giftCard = await GiftCard.findOne({ uniqueSlug: slug })
      .populate('sender', 'username')
      .populate('template');

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

    // Fetch folder settings to apply watermarks
    let folderSettings = null;
    let allowDownload = false;
    
    // Convert to plain object first to allow modification
    const giftCardObj = giftCard.toObject();

    if (giftCard.albumId) {
      try {
        const folder = await Folder.findById(giftCard.albumId);
        if (folder) {
          folderSettings = {
            watermarkSettings: folder.watermarkSettings,
            allowDownload: folder.allowDownload
          };
          allowDownload = folder.allowDownload;

          // Apply watermarks to all media items in gift card
          if (giftCardObj.mediaContent && giftCardObj.mediaContent.length > 0) {
            giftCardObj.mediaContent.forEach(block => {
              if (block.mediaItems && block.mediaItems.length > 0) {
                // Extract media objects from the structure
                const mediaObjects = block.mediaItems.map(item => item.mediaId);
                
                // Apply watermarks
                const watermarkedMediaObjects = applyWatermarkToImages(
                  mediaObjects,
                  folderSettings
                );
                
                // Reconstruct the mediaItems array with watermarked media
                block.mediaItems = block.mediaItems.map((item, index) => ({
                  ...item,
                  mediaId: watermarkedMediaObjects[index]
                }));
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching folder settings:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...giftCardObj,
        allowDownload, // Include download permission flag
      },
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
    const Folder = require('../models/Folder');
    const { applyWatermarkToImages } = require('../utils/cloudinaryHelper');

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
      await giftCard.populate('template');
      
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
    await giftCard.populate('template');
    
    if (giftCard.mediaContent && giftCard.mediaContent.length > 0) {
      try {
        await giftCard.populate('mediaContent.mediaItems.mediaId');
      } catch (err) {
        console.error('Error populating media:', err);
      }
    }

    // Fetch folder settings and apply watermarks
    let folderSettings = null;
    let allowDownload = false;
    
    // Convert to plain object first
    const giftCardObj = giftCard.toObject();
    
    if (giftCard.albumId) {
      try {
        const folder = await Folder.findById(giftCard.albumId);
        if (folder) {
          folderSettings = {
            watermarkSettings: folder.watermarkSettings,
            allowDownload: folder.allowDownload
          };
          allowDownload = folder.allowDownload;

          // Apply watermarks to all media items
          if (giftCardObj.mediaContent && giftCardObj.mediaContent.length > 0) {
            giftCardObj.mediaContent.forEach(block => {
              if (block.mediaItems && block.mediaItems.length > 0) {
                // Extract media objects
                const mediaObjects = block.mediaItems.map(item => item.mediaId);
                
                // Apply watermarks
                const watermarkedMediaObjects = applyWatermarkToImages(
                  mediaObjects,
                  folderSettings
                );
                
                // Reconstruct
                block.mediaItems = block.mediaItems.map((item, index) => ({
                  ...item,
                  mediaId: watermarkedMediaObjects[index]
                }));
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching folder settings:', err);
      }
    }

    // Remove password from response
    giftCardObj.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        ...giftCardObj,
        allowDownload,
      },
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
    const { title, message, themeColor, mediaContent, password, templateId, branding } = req.body;

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
        error: 'Not authorized to update this gift card',
      });
    }

    // Update mediaContent if provided
    if (mediaContent && Array.isArray(mediaContent)) {
      // Validate all media items exist
      const allMediaIds = mediaContent.flatMap(block => 
        block.mediaItems.map(item => item.mediaId)
      );

      const mediaItems = await Media.find({ _id: { $in: allMediaIds } });

      if (mediaItems.length !== allMediaIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more media items not found',
        });
      }

      // Update mediaContent with proper structure
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
    if (templateId) giftCard.template = templateId;
    if (branding && (branding.name || branding.logoUrl)) giftCard.branding = branding;

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
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
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

/**
 * @desc    Download all photos as ZIP
 * @route   POST /api/gift-cards/download-zip/:slug
 * @access  Public (with password if protected)
 */
exports.downloadGiftCardPhotos = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;
    const Folder = require('../models/Folder');
    const archiver = require('archiver');
    const https = require('https');
    const http = require('http');

    // Find gift card
    const giftCard = await GiftCard.findOne({ uniqueSlug: slug }).select('+password');

    if (!giftCard) {
      return res.status(404).json({ success: false, error: 'Gift card not found' });
    }

    // Check protection
    if (giftCard.isProtected) {
      if (!password) {
        return res.status(401).json({ success: false, error: 'Password required' });
      }
      const isMatch = await bcrypt.compare(password, giftCard.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
      }
    }

    // Check download permission
    let allowDownload = false;
    if (giftCard.albumId) {
      const folder = await Folder.findById(giftCard.albumId);
      if (folder) {
        allowDownload = folder.allowDownload;
      }
    }

    if (!allowDownload) {
      return res.status(403).json({ success: false, error: 'Download not allowed for this gift card' });
    }

    // Populate media
    await giftCard.populate('mediaContent.mediaItems.mediaId');

    // Collect all media URLs
    const mediaUrls = [];
    if (giftCard.mediaContent) {
      giftCard.mediaContent.forEach(block => {
        if (block.mediaItems) {
          block.mediaItems.forEach(item => {
            if (item.mediaId && item.mediaId.filePath) {
              mediaUrls.push({
                url: item.mediaId.filePath,
                name: `photo-${item.mediaId._id}.jpg` // Simplified naming
              });
            }
          });
        }
      });
    }

    if (mediaUrls.length === 0) {
      return res.status(400).json({ success: false, error: 'No photos to download' });
    }

    console.log(`Starting ZIP download for ${mediaUrls.length} files`);

    // Create ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', function(err) {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Archiver error: ' + err.message });
      }
    });

    res.attachment(`${giftCard.title || 'gift-card'}-photos.zip`);

    archive.pipe(res);

    // Append files
    for (const media of mediaUrls) {
      await new Promise((resolve, reject) => {
        const protocol = media.url.startsWith('https') ? https : http;
        
        protocol.get(media.url, (response) => {
          if (response.statusCode !== 200) {
            console.error(`Failed to fetch ${media.url}: ${response.statusCode}`);
            // Continue even if one fails, or reject? 
            // Let's log and continue to avoid failing the whole zip for one missing file
            // But archiver expects a stream. If we don't append, we just resolve.
            resolve(); 
            return;
          }
          archive.append(response, { name: media.name });
          resolve();
        }).on('error', (err) => {
          console.error(`Error fetching ${media.url}:`, err);
          resolve(); // Continue
        });
      });
    }

    await archive.finalize();

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
};
