import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folderPath - The path in storage (default: 'uploads')
 * @returns {Promise<string>} - The download URL
 */
export const uploadFileToFirebase = async (file, folderPath = 'uploads') => {
  try {
    // Create a unique filename to prevent overwrites
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${folderPath}/${uniqueFileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file
 */
export const deleteFileFromFirebase = async (fileUrl) => {
  try {
    // Extract the path from the URL
    // Firebase URLs are like: https://firebasestorage.googleapis.com/.../o/uploads%2Ffilename.jpg?alt=...
    const decodedUrl = decodeURIComponent(fileUrl);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    const fullPath = decodedUrl.substring(startIndex, endIndex);
    
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting from Firebase:", error);
    // Don't throw error here to prevent blocking DB deletion if file is already gone
  }
};
