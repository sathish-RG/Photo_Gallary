import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import ConfirmationModal from '../components/ConfirmationModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

const PhotoGallery = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchFolders();
    fetchPhotos();
  }, [folderId]);

  const fetchFolders = async () => {
    try {
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await getMedia(folderId);
      setMedia(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Upload to Cloudinary
      const uploadResult = await uploadFileToCloudinary(selectedFile);

      // Save to DB
      await uploadMedia({
        filePath: uploadResult.secure_url,
        fileType: 'image', // Assuming image for now
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        caption: caption,
        folderId: folderId || null
      });

      toast.success('Photo uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      fetchPhotos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setMediaToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await deleteMedia(mediaToDelete._id);
      toast.success('Photo deleted');
      setMedia(media.filter(m => m._id !== mediaToDelete._id));
      setShowDeleteModal(false);
      setMediaToDelete(null);
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const currentFolder = folders.find(f => f._id === folderId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentFolder ? currentFolder.name : 'All Photos'}
            </h1>
            <p className="text-gray-500 mt-1">
              {media.length} {media.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/folders"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Folders
            </Link>
            <Link
              to="/gallery/create-gift-card"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
            >
              Create Gift Card
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload New Photo</h2>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 appearance-none">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="font-medium text-gray-600">Click to select image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-md"
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </form>
        </div>

        {/* Folders Navigation */}
        <div className="flex overflow-x-auto gap-4 mb-8 pb-2">
          <Link
            to="/gallery"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!folderId
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            All Photos
          </Link>
          {folders.map(folder => (
            <Link
              key={folder._id}
              to={`/gallery?folderId=${folder._id}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${folderId === folder._id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {folder.name}
            </Link>
          ))}
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium text-gray-900">No photos yet</h3>
            <p className="text-gray-500 mt-1">Upload your first photo to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.filePath}
                    alt={item.caption || 'Photo'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    onClick={() => setPreviewImage(item)}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {item.caption && (
                      <p className="text-white text-sm font-medium truncate drop-shadow-md">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
        {showDeleteModal && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Delete Photo"
            message="Are you sure you want to delete this photo? This action cannot be undone."
          />
        )}

        {previewImage && (
          <ImagePreviewModal
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
            imageUrl={previewImage.filePath}
            caption={previewImage.caption}
          />
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
