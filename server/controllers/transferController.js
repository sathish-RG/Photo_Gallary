const Transfer = require('../models/Transfer');
const cloudinary = require('cloudinary').v2;
const archiver = require('archiver');
const axios = require('axios');
const { nanoid } = require('nanoid');

/**
 * @desc    Create new transfer with file uploads
 * @route   POST /api/transfers
 * @access  Private
 */
exports.createTransfer = async (req, res) => {
  try {
    const { message, recipientEmail, expiryDays, maxDownloads } = req.body;

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
    }

    // Upload files to Cloudinary
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        // Upload to Cloudinary as raw resource
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: 'raw',
          folder: 'transfers',
          public_id: `transfer_${nanoid(12)}`,
        });

        uploadedFiles.push({
          url: result.secure_url,
          filename: file.originalname,
          publicId: result.public_id,
          fileSize: result.bytes,
          mimeType: file.mimetype,
        });
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // If one file fails, cleanup already uploaded files
        for (const uploaded of uploadedFiles) {
          await cloudinary.uploader.destroy(uploaded.publicId, { resource_type: 'raw' });
        }
        return res.status(500).json({
          success: false,
          error: `Failed to upload file: ${file.originalname}`,
        });
      }
    }

    // Calculate expiry date
    const days = parseInt(expiryDays) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Create transfer
    const transfer = await Transfer.create({
      user: req.user.id,
      files: uploadedFiles,
      message: message || undefined,
      recipientEmail: recipientEmail || undefined,
      expiryDate,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      slug: nanoid(10),
    });

    res.status(201).json({
      success: true,
      data: {
        id: transfer._id,
        slug: transfer.slug,
        filesCount: transfer.files.length,
        totalSize: transfer.totalSize,
        expiryDate: transfer.expiryDate,
        shareLink: `http://localhost:5173/t/${transfer.slug}`,
      },
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transfer',
    });
  }
};

/**
 * @desc    Create new transfer from existing media
 * @route   POST /api/transfers/from-media
 * @access  Private
 */
exports.createTransferFromMedia = async (req, res) => {
  try {
    const { mediaIds, message, recipientEmail, expiryDays, maxDownloads } = req.body;

    if (!mediaIds || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one photo',
      });
    }

    // Fetch media documents
    const Media = require('../models/Media');
    const mediaFiles = await Media.find({
      _id: { $in: mediaIds },
      user: req.user.id, // Ensure user owns the media
    });

    if (mediaFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No media files found',
      });
    }

    // Format files for transfer
    const transferFiles = mediaFiles.map(media => ({
      url: media.filePath,
      filename: media.caption || `photo_${media._id}.jpg`,
      publicId: media.filePath.split('/').pop().split('.')[0], // Extract from URL
      fileSize: media.fileSize || 0,
      mimeType: media.mimeType || 'image/jpeg',
    }));

    // Calculate expiry date
    const days = parseInt(expiryDays) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Create transfer
    const transfer = await Transfer.create({
      user: req.user.id,
      files: transferFiles,
      message: message || undefined,
      recipientEmail: recipientEmail || undefined,
      expiryDate,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      slug: nanoid(10),
    });

    res.status(201).json({
      success: true,
      data: {
        id: transfer._id,
        slug: transfer.slug,
        filesCount: transfer.files.length,
        totalSize: transfer.totalSize,
        expiryDate: transfer.expiryDate,
        shareLink: `http://localhost:5173/t/${transfer.slug}`,
      },
    });
  } catch (error) {
    console.error('Create transfer from media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transfer',
    });
  }
};

/**
 * @desc    Get transfer by slug (public)
 * @route   GET /api/transfers/:slug
 * @access  Public
 */
exports.getTransferBySlug = async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ slug: req.params.slug })
      .populate('user', 'username');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found',
      });
    }

    // Check if expired
    const isExpired = transfer.isExpired();
    const limitReached = transfer.hasReachedDownloadLimit();

    res.status(200).json({
      success: true,
      data: {
        id: transfer._id,
        filesCount: transfer.files.length,
        totalSize: transfer.totalSize,
        message: transfer.message,
        sender: transfer.user?.username,
        expiryDate: transfer.expiryDate,
        downloadCount: transfer.downloadCount,
        maxDownloads: transfer.maxDownloads,
        isExpired,
        limitReached,
        files: transfer.files.map(f => ({
          filename: f.filename,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
        })),
      },
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transfer',
    });
  }
};

/**
 * @desc    Download transfer as zip
 * @route   GET /api/transfers/:slug/download
 * @access  Public
 */
exports.downloadTransferZip = async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ slug: req.params.slug });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found',
      });
    }

    // Check if expired
    if (transfer.isExpired()) {
      return res.status(410).json({
        success: false,
        error: 'This transfer has expired',
      });
    }

    // Check download limit
    if (transfer.hasReachedDownloadLimit()) {
      return res.status(403).json({
        success: false,
        error: 'Download limit reached for this transfer',
      });
    }

    // Set response headers for zip download
    const zipFilename = `transfer_${transfer.slug}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each file to the archive
    for (const file of transfer.files) {
      try {
        // Fetch file from Cloudinary URL
        const response = await axios({
          method: 'GET',
          url: file.url,
          responseType: 'stream',
        });

        // Add file stream to archive
        archive.append(response.data, { name: file.filename });
      } catch (fetchError) {
        console.error(`Error fetching file ${file.filename}:`, fetchError);
        // Continue with other files
      }
    }

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to create zip file',
        });
      }
    });

    // Finalize archive
    await archive.finalize();

    // Increment download count
    transfer.downloadCount += 1;
    await transfer.save();

  } catch (error) {
    console.error('Download zip error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to download transfer',
      });
    }
  }
};

/**
 * @desc    Get all transfers for logged-in user
 * @route   GET /api/transfers
 * @access  Private
 */
exports.getUserTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const transfersData = transfers.map(t => ({
      id: t._id,
      slug: t.slug,
      filesCount: t.files.length,
      totalSize: t.totalSize,
      message: t.message,
      recipientEmail: t.recipientEmail,
      expiryDate: t.expiryDate,
      downloadCount: t.downloadCount,
      maxDownloads: t.maxDownloads,
      status: t.status,
      isExpired: t.isExpired(),
      createdAt: t.createdAt,
      shareLink: `http://localhost:5173/t/${t.slug}`,
    }));

    res.status(200).json({
      success: true,
      count: transfersData.length,
      data: transfersData,
    });
  } catch (error) {
    console.error('Get user transfers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transfers',
    });
  }
};

/**
 * @desc    Delete transfer and cleanup files
 * @route   DELETE /api/transfers/:id
 * @access  Private
 */
exports.deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found',
      });
    }

    // Check ownership
    if (transfer.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this transfer',
      });
    }

    // Delete files from Cloudinary
    for (const file of transfer.files) {
      try {
        await cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' });
      } catch (deleteError) {
        console.error(`Error deleting file ${file.publicId}:`, deleteError);
      }
    }

    // Delete transfer document
    await Transfer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transfer deleted successfully',
    });
  } catch (error) {
    console.error('Delete transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transfer',
    });
  }
};
