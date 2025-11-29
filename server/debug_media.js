require('dotenv').config();
const mongoose = require('mongoose');
const Media = require('./models/Media');
const Folder = require('./models/Folder');
const { applyWatermarkToImages } = require('./utils/cloudinaryHelper');

const run = async () => {
  try {
    console.log('Loading .env...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');

    // Find a folder
    const folder = await Folder.findOne();
    if (!folder) {
      console.log('No folder found');
      return;
    }
    console.log('Folder found:', folder.name, 'ID:', folder._id);
    console.log('Watermark Settings:', folder.watermarkSettings);
    console.log('Allow Download:', folder.allowDownload);

    // Find media in that folder
    const media = await Media.find({ folder: folder._id }).sort({ createdAt: -1 }).limit(1).lean();
    
    if (media.length === 0) {
      console.log('No media found in folder');
      // Try finding any media
      const anyMedia = await Media.findOne().lean();
      if (anyMedia) {
        console.log('Found media without folder:', anyMedia);
        console.log('Testing with this media and folder settings...');
        testWatermark([anyMedia], folder);
      }
      return;
    }

    console.log('Original Media:', media[0]);
    testWatermark(media, folder);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

const testWatermark = (mediaItems, folder) => {
  const processed = applyWatermarkToImages(mediaItems, {
    watermarkSettings: folder.watermarkSettings,
    allowDownload: folder.allowDownload
  });

  console.log('Processed Media:', processed[0]);
  
  if (processed[0].filePath === mediaItems[0].filePath) {
    console.log('URL UNCHANGED');
  } else {
    console.log('URL CHANGED');
  }
};

run();
