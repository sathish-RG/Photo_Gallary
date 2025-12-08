const Portfolio = require('../models/Portfolio');
const Media = require('../models/Media');

/**
 * @desc    Create or update portfolio (upsert)
 * @route   POST /api/portfolio
 * @access  Private (requires authentication)
 */
exports.upsertPortfolio = async (req, res) => {
  try {
    console.log('=== PORTFOLIO UPSERT REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      slug,
      heroSection,
      aboutSection,
      galleryItems,
      socialLinks,
      themeColor,
    } = req.body;

    // Validate required fields
    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a slug',
      });
    }

    // Check if slug is already used by another user's portfolio
    const existingPortfolio = await Portfolio.findOne({ slug: slug.trim().toLowerCase() });
    if (existingPortfolio && existingPortfolio.user.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'This slug is already taken. Please choose a different one.',
      });
    }

    // Validate that gallery media items belong to the user
    if (galleryItems && galleryItems.length > 0) {
      // Filter out any null/undefined media IDs and get unique IDs
      const allMediaIds = galleryItems
        .map(item => item.media)
        .filter(id => id && id !== null && id !== undefined);
      
      // Get unique media IDs (remove duplicates for validation)
      const uniqueMediaIds = [...new Set(allMediaIds.map(id => id.toString()))];
      
      console.log('Total gallery items:', galleryItems.length);
      console.log('Unique media IDs to validate:', uniqueMediaIds.length);
      
      if (uniqueMediaIds.length > 0) {
        const mediaCheck = await Media.find({
          _id: { $in: uniqueMediaIds },
          user: req.user.id,
        });

        console.log('Media found for user:', mediaCheck.length);
        
        if (mediaCheck.length !== uniqueMediaIds.length) {
          const foundIds = new Set(mediaCheck.map(m => m._id.toString()));
          const missingIds = uniqueMediaIds.filter(id => !foundIds.has(id));
          console.log('Missing/unauthorized media IDs:', missingIds);
          
          return res.status(400).json({
            success: false,
            error: 'One or more gallery items do not belong to you',
            details: `Found ${mediaCheck.length} of ${uniqueMediaIds.length} unique items`,
          });
        }
      }
    }

    // Validate hero background image if provided
    if (heroSection?.backgroundImage) {
      const heroMedia = await Media.findOne({
        _id: heroSection.backgroundImage,
        user: req.user.id,
      });
      if (!heroMedia) {
        return res.status(400).json({
          success: false,
          error: 'Hero background image does not belong to you',
        });
      }
    }

    // Validate profile image if provided
    if (aboutSection?.profileImage) {
      const profileMedia = await Media.findOne({
        _id: aboutSection.profileImage,
        user: req.user.id,
      });
      if (!profileMedia) {
        return res.status(400).json({
          success: false,
          error: 'Profile image does not belong to you',
        });
      }
    }

    // Prepare portfolio data
    const portfolioData = {
      user: req.user.id,
      slug: slug.trim().toLowerCase(),
      heroSection: heroSection || {},
      aboutSection: aboutSection || {},
      galleryItems: galleryItems || [],
      services: req.body.services || [],
      testimonials: req.body.testimonials || [],
      contactEmail: req.body.contactEmail || '',
      showSections: req.body.showSections || {
        showGallery: true,
        showServices: false,
        showTestimonials: false,
        showAbout: true,
        showContact: false,
      },
      socialLinks: req.body.socialLinks || [],
      designConfig: req.body.designConfig || {
        colors: {
          primary: '#4f46e5',
          background: '#ffffff',
          text: '#1f2937',
          accent: '#8b5cf6'
        },
        typography: {
          headingFont: 'Playfair Display',
          bodyFont: 'Lato'
        },
        borderRadius: '12px',
        profileImageStyle: 'circle'
      },
    };

    // Find existing portfolio or create new one
    let portfolio = await Portfolio.findOne({ user: req.user.id });

    if (portfolio) {
      // Update existing portfolio
      Object.assign(portfolio, portfolioData);
      await portfolio.save();
    } else {
      // Create new portfolio
      portfolio = await Portfolio.create(portfolioData);
    }

    // Populate all media references
    await portfolio.populate([
      { path: 'galleryItems.media', select: 'filePath fileType mimeType caption' },
      { path: 'heroSection.backgroundImage', select: 'filePath fileType' },
      { path: 'aboutSection.profileImage', select: 'filePath fileType' },
    ]);

    res.status(200).json({
      success: true,
      data: portfolio,
      message: portfolio ? 'Portfolio updated successfully' : 'Portfolio created successfully',
    });
  } catch (error) {
    console.error('Upsert portfolio error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while saving portfolio',
    });
  }
};

/**
 * @desc    Get portfolio by slug (public)
 * @route   GET /api/portfolio/:slug
 * @access  Public
 */
exports.getPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find portfolio by slug and populate all media references
    const portfolio = await Portfolio.findOne({ slug: slug.toLowerCase() })
      .populate({
        path: 'galleryItems.media',
        select: 'filePath fileType mimeType caption',
      })
      .populate({
        path: 'heroSection.backgroundImage',
        select: 'filePath fileType',
      })
      .populate({
        path: 'aboutSection.profileImage',
        select: 'filePath fileType',
      })
      .populate({
        path: 'user',
        select: 'username email',
      });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching portfolio',
    });
  }
};

/**
 * @desc    Get current user's portfolio
 * @route   GET /api/portfolio/my/portfolio
 * @access  Private
 */
exports.getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id })
      .populate({
        path: 'galleryItems.media',
        select: 'filePath fileType mimeType caption',
      })
      .populate({
        path: 'heroSection.backgroundImage',
        select: 'filePath fileType',
      })
      .populate({
        path: 'aboutSection.profileImage',
        select: 'filePath fileType',
      });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found. Create one first.',
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Get my portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching portfolio',
    });
  }
};
