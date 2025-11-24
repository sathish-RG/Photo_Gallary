import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import ConfirmationModal from '../components/ConfirmationModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

/**
 * PhotoGallery Component
 * Allows users to upload images and view their personal photo gallery
 * Supports folder-based organization
 */
  }, [folderId]);

/**
 * Fetch all folders for dropdown
 */
const fetchFolders = async () => {
  try {
    const response = await getFolders();
    setFolders(response.data);
  } catch (error) {
    console.error('Error fetching folders:', error);
  }
};

/**
 * Fetch media (filtered by folder if folderId is present)
 */
const fetchPhotos = async () => {
  try {
    setLoading(true);
    const response = await getMedia(folderId);
    setMedia(response.data);
  } catch (error) {
    console.error('Error fetching photos:', error);
    toast.error(error.response?.data?.error || 'Failed to fetch photos');
  } finally {
    setLoading(false);
  }
};

/**
 * Handle file selection
 */
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

/**
 * Handle photo upload
 */
const handleUpload = async (e) => {
  e.preventDefault();

  if (!selectedFile) {
    toast.error('Please select an image to upload');
    return;
  }

  try {
    setUploading(true);

    setCaption('');
    setPreviewUrl(null);

    // Refresh photos list
    fetchPhotos();
  } catch (error) {
    console.error('Error uploading photo:', error);
    toast.error(error.response?.data?.error || 'Failed to upload photo');
  } finally {
    setUploading(false);
  }
};

// Get current folder name
const currentFolder = folders.find(f => f._id === folderId);


