import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiImage, FiTrash2, FiFolder, FiGift } from 'react-icons/fi';
import { uploadMedia, getMedia, deleteMedia } from '../api/mediaApi';
import { getFolders } from '../api/folderApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import ConfirmationModal from '../components/ConfirmationModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {currentFolder ? currentFolder.name : 'All Photos'}
            </h1>
            <p className="text-slate-500 mt-1">
              {media.length} {media.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/folders">
              <Button variant="secondary">
                <FiFolder className="w-4 h-4 mr-2" />
                Manage Folders
              </Button>
            </Link>
            <Link to="/gallery/create-gift-card">
              <Button>
                <FiGift className="w-4 h-4 mr-2" />
                Create Gift Card
              </Button>
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload New Photo</h2>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer w-full">
                  <div className="flex items-center justify-center w-full h-32 px-4 transition bg-slate-50 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-100 appearance-none">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center space-y-2 text-slate-500">
                        <FiUpload className="w-8 h-8" />
                        <span className="font-medium">Click to select image</span>
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                isLoading={uploading}
                className="w-full"
              >
                Upload Photo
              </Button>
            </div>
          </form>
        </div>

        {/* Folders Navigation */}
        <div className="flex overflow-x-auto gap-3 mb-8 pb-2 scrollbar-hide">
          <Link to="/gallery">
            <button
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!folderId
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              All Photos
            </button>
          </Link>
          {folders.map(folder => (
            <Link key={folder._id} to={`/gallery?folderId=${folder._id}`}>
              <button
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${folderId === folder._id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {folder.name}
              </button>
            </Link>
          ))}
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : media.length === 0 ? (
          <EmptyState
            title="No photos yet"
            description="Upload your first photo to get started"
            icon={FiImage}
          />
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
                  className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.filePath}
                    alt={item.caption || 'Photo'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    onClick={() => setPreviewImage(item)}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
                    <div className="flex justify-end pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
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
