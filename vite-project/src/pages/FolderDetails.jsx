import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { uploadPhoto, getPhotos, deletePhoto } from '../api/photoApi';
import { getFolders } from '../api/folderApi';

/**
 * FolderDetails Component
 * Modern UI with drag-and-drop, layout toggle, and animations
 */
const FolderDetails = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Preview state for drag-and-drop
  const [previewFiles, setPreviewFiles] = useState([]);

  // Layout toggle
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'

  useEffect(() => {
    fetchFolderDetails();
    fetchPhotos();
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

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await getPhotos(folderId);
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle file drop
   */
  const onDrop = useCallback((acceptedFiles) => {
    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
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
  const handleUploadAll = async () => {
    if (previewFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    try {
      setUploading(true);

      for (const previewFile of previewFiles) {
        await uploadPhoto(previewFile.file, '', folderId);
        URL.revokeObjectURL(previewFile.preview);
      }

      toast.success(`${previewFiles.length} photo(s) uploaded successfully!`);
      setPreviewFiles([]);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error(error.response?.data?.error || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle photo deletion
   */
  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await deletePhoto(photoId);
      toast.success('Photo deleted successfully!');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error.response?.data?.error || 'Failed to delete photo');
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
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
            <p className="text-gray-600 text-lg">Upload and manage photos in this album</p>
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

        {/* Drag and Drop Upload Area */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-pink-100">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">
            Upload Photos
          </h2>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive
                ? 'border-pink-500 bg-pink-50/50 scale-[1.02]'
                : 'border-pink-300 hover:border-pink-400 hover:bg-pink-50/30'
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <svg
                className={`h-16 w-16 mb-4 transition-colors ${isDragActive ? 'text-pink-500' : 'text-pink-400'
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-gray-500">or click to select files</p>
            </div>
          </div>

          {/* Preview Area */}
          {previewFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
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
                    <img
                      src={previewFile.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-xl border-2 border-pink-200 shadow-md"
                    />
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
        </div>

        {/* Photos Display */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Photos in this Album ({photos.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
          ) : photos.length === 0 ? (
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
              <h3 className="mt-4 text-xl font-medium text-gray-600">No photos yet</h3>
              <p className="mt-2 text-gray-500">Upload your first photo to this album!</p>
            </div>
          ) : (
            <motion.div
              key={viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'masonry-container'
              }
            >
              {photos.map((photo) => (
                <motion.div
                  key={photo._id}
                  variants={itemVariants}
                  layout
                  className={`group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-pink-100 ${viewMode === 'masonry' ? 'masonry-item mb-6' : ''
                    }`}
                >
                  {/* Image Container */}
                  <div className={`overflow-hidden ${viewMode === 'grid' ? 'aspect-square' : ''}`}>
                    <motion.img
                      src={`http://localhost:5000${photo.imagePath}`}
                      alt={photo.caption || 'Photo'}
                      className={`w-full ${viewMode === 'grid' ? 'h-full object-cover' : 'object-contain'} transition-transform duration-300 group-hover:scale-110`}
                      whileHover={{ scale: 1.05 }}
                    />

                    {/* Hover Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4"
                    >
                      {photo.caption && (
                        <p className="text-white font-medium mb-1">{photo.caption}</p>
                      )}
                      <p className="text-white/80 text-sm">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
                    title="Delete photo"
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
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Masonry CSS */}
      <style jsx>{`
        .masonry-container {
          column-count: 1;
          column-gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .masonry-container {
            column-count: 2;
          }
        }

        @media (min-width: 1024px) {
          .masonry-container {
            column-count: 3;
          }
        }

        @media (min-width: 1280px) {
          .masonry-container {
            column-count: 4;
          }
        }

        .masonry-item {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </div>
  );
};

export default FolderDetails;
