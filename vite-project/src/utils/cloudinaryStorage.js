import axios from 'axios';

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadFileToCloudinary = async (file) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    // Optional: Add folder based on file type or other logic if needed
    // formData.append('folder', 'my_gallery_uploads'); 

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (error.response) {
      console.error("Cloudinary Error Details:", error.response.data);
      // Throw a more descriptive error if possible
      throw new Error(error.response.data.error?.message || 'Cloudinary upload failed');
    }
    throw error;
  }
};
