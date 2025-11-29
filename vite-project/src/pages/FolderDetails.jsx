import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import ConfirmationModal from '../components/ConfirmationModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import GiftCardManager from '../components/GiftCardManager';
import PhotographerSettings from '../components/PhotographerSettings';

/**
 * FolderDetails Component
 * Modern UI with drag-and-drop, layout toggle, animated tabs, and multi-media support
 */
const FolderDetails = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [media, setMedia] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Preview state for drag-and-drop
  const [previewFiles, setPreviewFiles] = useState([]);

  // Layout toggle
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'

  // Active tab for filtering media types
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos', 'audio'

  // Settings modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [folderSettings, setFolderSettings] = useState(null);

  useEffect(() => {
    fetchFolderDetails();
    fetchMedia();
    fetchFolderSettings();
  }, [folderId]);

  const fetchFolderDetails = async () => {
    try {
      const response = await getFolders();
      const folder = response.data.find(f => f._id === folderId);
      if (!folder) {
        toast.error('Folder not found');
        navigate('/gallery');
        return;
      }
      setCurrentFolder(folder);
    } catch (error) {
      console.error('Error fetching folder details:', error);
      toast.error('Failed to load folder');
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await getMedia(folderId);
      setMedia(response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/folders/${folderId}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFolderSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching folder settings:', error);
    }
  };

  const handleSettingsUpdate = (newSettings) => {
    setFolderSettings(newSettings);
    // Refresh media to apply new watermark settings
    fetchMedia();
  };

  /**
   * Handle file drop
   */
  const onDrop = useCallback((acceptedFiles) => {
    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
    }));
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mkv', '.webm', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: true,
  });

  /**
   * Remove preview file
   */
  const removePreview = (id) => {
    setPreviewFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  /**
   * Upload all previewed files
   */
  /**
   * Upload all previewed files
   */
  const handleUploadAll = async () => {
    if (previewFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    try {
      setUploading(true);

      for (const previewFile of previewFiles) {
        // 1. Upload to Cloudinary
        const downloadURL = await uploadFileToCloudinary(previewFile.file);

        // 2. Save metadata to backend
        await uploadMedia({
          mediaUrl: downloadURL,
          fileType: previewFile.type,
          mimeType: previewFile.file.type,
          fileSize: previewFile.file.size,
          fileName: previewFile.file.name,
          caption: '', // You could add a caption input field later
          folderId: folderId
        });

        URL.revokeObjectURL(previewFile.preview);
      }

      toast.success(`${previewFiles.length} file(s) uploaded successfully!`);
      setPreviewFiles([]);
      fetchMedia();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(error.response?.data?.error || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  /**
   * Handle media deletion request
   */
  const handleDeleteClick = (mediaId) => {
    setItemToDelete(mediaId);
    setDeleteModalOpen(true);
  };

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  // Filter only images for preview navigation
  const images = media.filter(item => item.fileType === 'image');

  const handleImageClick = (item) => {
    if (item.fileType === 'image') {
      const index = images.findIndex(img => img._id === item._id);
      setSelectedImageIndex(index);
      setPreviewModalOpen(true);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    }
  };

  /**
   * Confirm deletion
   */
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMedia(itemToDelete);
      toast.success('Media deleted successfully!');
      fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error(error.response?.data?.error || 'Failed to delete media');
    } finally {
      setItemToDelete(null);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  // Filter media based on active tab
  const filteredMedia = media.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return item.fileType === 'image';
    if (activeTab === 'videos') return item.fileType === 'video';
    if (activeTab === 'audio') return item.fileType === 'audio';
    return true;
  });

  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const tabs = [
    { id: 'all', label: 'All', icon: '📁' },
    { id: 'photos', label: 'Photos', icon: '🖼️' },
    { id: 'videos', label: 'Videos', icon: '🎬' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'gifts', label: 'Saved Gifts', icon: '🎁' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/gallery" className="hover:text-pink-600 transition-colors flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Albums
            </Link>
            <span>/</span>
            <span className="text-pink-600 font-medium">{currentFolder.name}</span>
          </div>
        </div>

        {/* Header with View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg mb-4">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              {currentFolder.name}
            </h1>
            <p className="text-gray-600 text-lg">Upload and manage your media files</p>

            {/* Create Gift Card Button */}
            <div className="flex gap-3 mt-4">
              <Link
                to={`/gallery/${folderId}/select-template`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  🎁 Create Gift Card
                </span>
              </Link>

              {/* Photographer Settings Button */}
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg transform hover:scale-105"
                title="Photographer Settings"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ⚙️ Settings
                </span>
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-xl p-2 shadow-lg border border-pink-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-pink-50'
                }`}
              title="Grid View"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'masonry'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-pink-50'
                }`}
              title="Masonry View"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-3 border-dashed rounded-3xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all duration-300 mb-8 ${isDragActive
            ? 'border-pink-500 bg-pink-50 scale-[1.02] shadow-xl'
            : 'border-pink-200 hover:border-pink-400 hover:bg-pink-50/50 hover:shadow-lg'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 ${isDragActive ? 'animate-bounce' : ''}`}>
              <svg className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
                {isDragActive ? 'Drop files here...' : 'Drag & Drop files here'}
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                or tap to select • Images, Videos, Audio
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {previewFiles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Ready to Upload ({previewFiles.length})
              </h3>
              <button
                onClick={handleUploadAll}
                disabled={uploading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {previewFiles.map((previewFile) => (
                <div
                  key={previewFile.id}
                  className="relative flex-shrink-0 group"
                >
                  {previewFile.type === 'image' && (
                    <img
                      src={previewFile.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-xl border-2 border-pink-200 shadow-md"
                    />
                  )}
                  {previewFile.type === 'video' && (
                    <div className="h-32 w-32 bg-gray-900 rounded-xl border-2 border-pink-200 shadow-md flex items-center justify-center">
                      <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {previewFile.type === 'audio' && (
                    <div className="h-32 w-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl border-2 border-pink-200 shadow-md flex items-center justify-center">
                      <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => removePreview(previewFile.id)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animated Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-pink-100 inline-flex">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-pink-50'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="text-xs opacity-80">
                    ({tab.id === 'all' ? media.length : media.filter(m => {
                      if (tab.id === 'photos') return m.fileType === 'image';
                      if (tab.id === 'videos') return m.fileType === 'video';
                      if (tab.id === 'audio') return m.fileType === 'audio';
                      return false;
                    }).length})
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Media Display */}
        <div>
          {activeTab !== 'gifts' && (
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {tabs.find(t => t.id === activeTab)?.label} ({filteredMedia.length})
            </h2>
          )}

          {activeTab === 'gifts' ? (
            <GiftCardManager />
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-100">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-600">No media yet</h3>
              <p className="mt-2 text-gray-500">Upload your first file to this album!</p>
            </div>
          ) : (
            <motion.div
              key={`${viewMode}-${activeTab}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'masonry-container'
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredMedia.map((item) => (
                  <MediaCard
                    key={item._id}
                    item={item}
                    viewMode={viewMode}
                    itemVariants={itemVariants}
                    handleDelete={handleDeleteClick}
                    onImageClick={handleImageClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>


      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        imageUrl={selectedImageIndex >= 0 ? images[selectedImageIndex]?.filePath : ''}
        caption={selectedImageIndex >= 0 ? images[selectedImageIndex]?.caption : ''}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        hasNext={selectedImageIndex < images.length - 1}
        hasPrev={selectedImageIndex > 0}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Media"
        message="Are you sure you want to delete this media? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />

      {/* Photographer Settings Modal */}
      <PhotographerSettings
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        folderId={folderId}
        currentSettings={folderSettings}
        onUpdate={handleSettingsUpdate}
      />
    </div>
  );
};

/**
 * MediaCard Component
 * Renders different UI based on media type (image, video, audio)
 */
const MediaCard = ({ item, viewMode, itemVariants, handleDelete, onImageClick }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleMouseEnter = (e) => {
    if (item.fileType === 'video') {
      e.currentTarget.querySelector('video')?.play();
      setIsVideoPlaying(true);
    }
  };

  const handleMouseLeave = (e) => {
    if (item.fileType === 'video') {
      const video = e.currentTarget.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      setIsVideoPlaying(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={`group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-pink-100 ${viewMode === 'masonry' ? 'masonry-item mb-6' : ''
        }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Rendering */}
      {item.fileType === 'image' && (
        <div
          className={`overflow-hidden cursor-pointer ${viewMode === 'grid' ? 'aspect-square' : ''}`}
          onClick={() => onImageClick(item)}
        >
          <motion.img
            src={item.filePath}
            alt={item.caption || 'Image'}
            className={`w-full ${viewMode === 'grid' ? 'h-full object-cover' : 'object-contain'} transition-transform duration-300 group-hover:scale-110`}
            whileHover={{ scale: 1.05 }}
          />

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4"
          >
            {item.caption && (
              <p className="text-white font-medium mb-1">{item.caption}</p>
            )}
            <p className="text-white/80 text-sm">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      )}

      {/* Video Rendering */}
      {item.fileType === 'video' && (
        <div className="relative">
          <video
            src={item.filePath}
            className="w-full h-auto"
            muted
            loop
            playsInline
          />

          {/* Play Icon Overlay */}
          {!isVideoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-white/90 rounded-full p-6 shadow-2xl">
                <svg className="h-12 w-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Info Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4"
          >
            {item.caption && (
              <p className="text-white font-medium mb-1">{item.caption}</p>
            )}
            <p className="text-white/80 text-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Video • {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      )}

      {/* Audio Rendering */}
      {item.fileType === 'audio' && (
        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 mb-4 flex items-center justify-center">
            <svg className="h-20 w-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>

          {item.caption && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.caption}</h3>
          )}

          <p className="text-sm text-gray-500 mb-4">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>

          <audio
            src={item.filePath}
            controls
            className="w-full"
            style={{
              filter: 'hue-rotate(330deg) saturate(1.5)',
            }}
          />
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={() => handleDelete(item._id)}
        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600 z-20"
        title="Delete media"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default FolderDetails;
