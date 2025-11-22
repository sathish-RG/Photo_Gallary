import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';

/**
 * PhotoGallery Component
 * Allows users to upload images and view their personal photo gallery
 * Supports folder-based organization
 */
const PhotoGallery = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');

  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(folderId || '');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch folders and photos on component mount
  useEffect(() => {
    fetchFolders();
    fetchPhotos();
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
      await uploadMedia(selectedFile, caption, selectedFolderId || null);
      toast.success('Media uploaded successfully!');

      // Reset form
      setSelectedFile(null);
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

  /**
   * Handle photo deletion
   */
  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await deleteMedia(photoId);
      toast.success('Media deleted successfully!');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error.response?.data?.error || 'Failed to delete photo');
    }
  };

  /**
   * Clear selected file
   */
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  // Get current folder name
  const currentFolder = folders.find(f => f._id === folderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link to="/folders" className="hover:text-pink-600 transition-colors">
              Folders
            </Link>
            {currentFolder && (
              <>
                <span>/</span>
                <span className="text-pink-600 font-medium">{currentFolder.name}</span>
              </>
            )}
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg mb-4">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              {currentFolder ? currentFolder.name : 'All Photos'}
            </h1>
            <p className="text-gray-600 text-lg">Upload and manage your beautiful memories</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-pink-100">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">Upload New Photo</h2>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Save to Folder (Optional)
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
              >
                <option value="">No Folder (All Photos)</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center hover:border-pink-500 hover:bg-pink-50/50 transition-all">
                    <svg
                      className="mx-auto h-12 w-12 text-pink-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select an image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Caption Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption for your photo..."
                className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Photo'
              )}
            </button>
          </form>
        </div>

        {/* Photos Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Your Media ({media.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
          ) : media.length === 0 ? (
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
              <p className="mt-2 text-gray-500">Upload your first photo to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {media.map((photo) => (
                <div
                  key={photo._id}
                  className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] border border-pink-100"
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={`http://localhost:5000${photo.imagePath}`}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Caption & Delete Button */}
                  <div className="p-4">
                    {photo.caption && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{photo.caption}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDelete(photo._id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-full hover:bg-rose-50"
                        title="Delete photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
