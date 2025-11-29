/**
 * Cloudinary Helper Utility
 * Handles watermark transformations and URL protection for photographer albums
 */

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return '';
  
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/{type}/{transformations}/{public_id}.{format}
  // We need to extract the public_id with extension
  
  const urlParts = cloudinaryUrl.split('/upload/');
  if (urlParts.length < 2) return '';
  
  // Get everything after /upload/, remove any existing transformations
  const afterUpload = urlParts[1];
  const parts = afterUpload.split('/');
  
  // The last part is the public_id with extension
  return parts[parts.length - 1];
};

/**
 * Build Cloudinary transformation string for watermark
 * @param {Object} settings - Watermark settings
 * @returns {string} - Transformation string
 */
const buildTransformationString = (settings) => {
  if (!settings || !settings.enabled) return '';
  
  const { text, opacity, position, fontSize } = settings;
  
  // Cloudinary text overlay format: l_text:font_size:text,g_position,o_opacity
  // Font: Arial (default), size from settings, text encoded
  const encodedText = encodeURIComponent(text || 'COPYRIGHT').replace(/%20/g, '%2520');
  const font = `Arial_${fontSize || 80}`;
  const gravity = mapPositionToGravity(position);
  const opacityValue = Math.round((opacity || 50) / 100 * 100); // Convert 0-100 to 0-100 for Cloudinary
  
  // Build transformation string
  const transformations = [
    `l_text:${font}:${encodedText}`,
    `g_${gravity}`,
    `o_${opacityValue}`,
    'co_rgb:ffffff' // White text color
  ].join(',');
  
  return transformations;
};

/**
 * Map position to Cloudinary gravity
 * @param {string} position - Position setting
 * @returns {string} - Cloudinary gravity value
 */
const mapPositionToGravity = (position) => {
  const gravityMap = {
    'center': 'center',
    'north': 'north',
    'south': 'south',
    'east': 'east',
    'west': 'west',
    'north_east': 'north_east',
    'north_west': 'north_west',
    'south_east': 'south_east',
    'south_west': 'south_west'
  };
  
  return gravityMap[position] || 'center';
};

/**
 * Apply watermark transformation to Cloudinary URL
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Object} watermarkSettings - Watermark configuration
 * @returns {string} - Watermarked URL
 */
const applyWatermark = (imageUrl, watermarkSettings) => {
  if (!imageUrl || !watermarkSettings || !watermarkSettings.enabled) {
    return imageUrl;
  }
  
  const transformationString = buildTransformationString(watermarkSettings);
  if (!transformationString) return imageUrl;
  
  // Insert transformation into URL
  // Format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}
  const urlParts = imageUrl.split('/upload/');
  if (urlParts.length !== 2) return imageUrl;
  
  return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
};

/**
 * Get protected URL based on folder settings
 * SECURITY: Only returns clean URL if allowDownload is true
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Object} folderSettings - Folder configuration
 * @returns {string} - Protected or clean URL
 */
const getProtectedUrl = (imageUrl, folderSettings) => {
  if (!imageUrl) return '';
  
  // If downloads are allowed (e.g., after payment), return clean URL
  if (folderSettings && folderSettings.allowDownload === true) {
    return imageUrl;
  }
  
  // Otherwise, apply watermark if enabled
  if (folderSettings && folderSettings.watermarkSettings) {
    return applyWatermark(imageUrl, folderSettings.watermarkSettings);
  }
  
  // Default: return original URL
  return imageUrl;
};

/**
 * Apply watermark to multiple image URLs
 * @param {Array} images - Array of image objects with url/filePath property
 * @param {Object} folderSettings - Folder configuration
 * @returns {Array} - Images with protected URLs
 */
const applyWatermarkToImages = (images, folderSettings) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(image => {
    if (!image) return null;
    
    return {
      ...image,
      filePath: getProtectedUrl(image.filePath, folderSettings),
      // Keep original URL hidden from frontend
      _originalUrl: undefined
    };
  });
};

module.exports = {
  extractPublicId,
  buildTransformationString,
  applyWatermark,
  getProtectedUrl,
  applyWatermarkToImages
};
