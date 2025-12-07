import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiFolder, FiImage, FiVideo, FiMusic, FiGift, FiHeart, FiSettings, FiGrid, FiList, FiUploadCloud, FiX, FiTrash2, FiPlay } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';
import { getSelectionsByFolder } from '../api/selectionApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import ConfirmationModal from '../components/ConfirmationModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import GiftCardManager from '../components/GiftCardManager';
import PhotographerSettings from '../components/PhotographerSettings';
import ClientSelectionsList from '../components/ClientSelectionsList';

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

  // Client Selections State
  const [selections, setSelections] = useState([]);
  const [loadingSelections, setLoadingSelections] = useState(false);

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

  const fetchSelections = async () => {
    try {
      setLoadingSelections(true);
      const response = await getSelectionsByFolder(folderId);
      setSelections(response.data.data);
    } catch (error) {
      console.error('Error fetching selections:', error);
      toast.error('Failed to load client selections');
    } finally {
      setLoadingSelections(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'selections') {
      fetchSelections();
    }
  }, [activeTab, folderId]);

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
    { id: 'all', label: 'All', icon: <FiGrid /> },
    { id: 'photos', label: 'Photos', icon: <FiImage /> },
    { id: 'videos', label: 'Videos', icon: <FiVideo /> },
    { id: 'audio', label: 'Audio', icon: <FiMusic /> },
    { id: 'gifts', label: 'Saved Gifts', icon: <FiGift /> },
    { id: 'selections', label: 'Client Selections', icon: <FiHeart /> },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/gallery" className="hover:text-primary transition-colors flex items-center gap-1">
              <FiArrowLeft className="w-4 h-4" />
              Back to Albums
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{currentFolder.name}</span>
          </div>
        </div>

        {/* Header with View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {currentFolder.name}
            </h1>
            <p className="text-slate-500">Upload and manage your media files</p>

            <div className="flex gap-3 mt-4">
              <Link to={`/gallery/${folderId}/select-template`}>
                <Button variant="primary">
                  <FiGift className="w-4 h-4" />
                  Create Gift Card
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setSettingsModalOpen(true)}>
                <FiSettings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Grid View"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'masonry'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Masonry View"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-8 ${isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full bg-slate-100 ${isDragActive ? 'animate-bounce' : ''}`}>
              <FiUploadCloud className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700 mb-1">
                {isDragActive ? 'Drop files here...' : 'Drag & Drop files here'}
              </p>
              <p className="text-sm text-slate-500">
                or tap to select • Images, Videos, Audio
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {previewFiles.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Ready to Upload ({previewFiles.length})
              </h3>
              <Button onClick={handleUploadAll} isLoading={uploading}>
                Upload All
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {previewFiles.map((previewFile) => (
                <div
                  key={previewFile.id}
                  className="relative flex-shrink-0 group w-32"
                >
                  {previewFile.type === 'image' && (
                    <img
                      src={previewFile.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                  {previewFile.type === 'video' && (
                    <div className="h-32 w-32 bg-slate-900 rounded-xl border border-slate-200 flex items-center justify-center">
                      <FiVideo className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                  {previewFile.type === 'audio' && (
                    <div className="h-32 w-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                      <FiMusic className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removePreview(previewFile.id)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 hover:bg-red-50"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animated Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 bg-slate-100/50 p-1 rounded-xl inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-xs ml-1">
                  {tab.id === 'all' ? media.length : media.filter(m => {
                    if (tab.id === 'photos') return m.fileType === 'image';
                    if (tab.id === 'videos') return m.fileType === 'video';
                    if (tab.id === 'audio') return m.fileType === 'audio';
                    return false;
                  }).length}
                </span>
              </button>
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
          ) : activeTab === 'selections' ? (
            <ClientSelectionsList selections={selections} loading={loadingSelections} />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <EmptyState
              title="No media yet"
              description="Upload your first file to this album!"
              icon={FiImage}
            />
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
      className={`group relative bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 ${viewMode === 'masonry' ? 'masonry-item mb-6' : ''
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
            className={`w-full ${viewMode === 'grid' ? 'h-full object-cover' : 'object-contain'} transition-transform duration-300 group-hover:scale-105`}
          />

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4"
          >
            {item.caption && (
              <p className="text-white font-medium mb-1 truncate">{item.caption}</p>
            )}
            <p className="text-white/80 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white/90 rounded-full p-4 shadow-lg backdrop-blur-sm">
                <FiPlay className="w-6 h-6 text-primary ml-1" />
              </div>
            </div>
          )}

          {/* Info Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {item.caption && (
              <p className="text-white font-medium mb-1 truncate">{item.caption}</p>
            )}
            <p className="text-white/80 text-xs flex items-center gap-2">
              <FiVideo className="w-3 h-3" />
              Video • {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Audio Rendering */}
      {item.fileType === 'audio' && (
        <div className="p-6">
          <div className="bg-slate-100 rounded-2xl p-8 mb-4 flex items-center justify-center aspect-square">
            <FiMusic className="w-16 h-16 text-slate-400" />
          </div>

          {item.caption && (
            <h3 className="text-sm font-semibold text-slate-800 mb-1 truncate">{item.caption}</h3>
          )}

          <p className="text-xs text-slate-500 mb-4">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>

          <audio
            src={item.filePath}
            controls
            className="w-full h-8"
          />
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(item._id);
        }}
        className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 border border-slate-100 z-20"
        title="Delete media"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default FolderDetails;
