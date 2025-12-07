// src/pages/UserFiles.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserContent, deleteUserFile } from '../api/adminApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiImage, FiTrash2, FiX, FiPlay } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const UserFiles = () => {
  const { id } = useParams(); // user id
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchContent = async () => {
    try {
      const res = await getUserContent(id);
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching user content', err);
      toast.error('Failed to load user content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteUserFile(id, fileId);
      toast.success('File deleted successfully');
      // Update local state
      setData(prev => ({
        ...prev,
        media: prev.media.filter(item => item._id !== fileId)
      }));
      if (selectedImage && selectedImage._id === fileId) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Failed to delete file');
    }
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <EmptyState
        title="No Data Found"
        description="Could not load user files."
        icon={FiFolder}
      />
    </div>
  );

  const { user, folders, media } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Files for {user.username}</h1>
          <p className="text-slate-500 mt-1">{user.email}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-600">
          Total Media: {media.length}
        </div>
      </div>

      {/* Folders Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
          <FiFolder className="w-5 h-5 text-yellow-500" />
          Folders ({folders.length})
        </h2>
        {folders.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500 border border-dashed border-slate-300">
            No folders created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div key={folder._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <FiFolder className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="font-medium text-slate-700 truncate">{folder.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
          <FiImage className="w-5 h-5 text-primary" />
          Media Gallery ({media.length})
        </h2>
        {media.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-12 text-center text-slate-500 border border-dashed border-slate-300">
            No media files uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => {
              // Handle both filePath and url properties for compatibility
              const imageUrl = item.filePath || item.url;

              return (
                <motion.div
                  key={item._id}
                  layoutId={`media-${item._id}`}
                  className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  onClick={() => setSelectedImage({ ...item, url: imageUrl })}
                >
                  {item.fileType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <video
                        src={imageUrl}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full">
                          <FiPlay className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="User content"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300?text=Image+Unavailable';
                        e.target.parentElement.classList.add('bg-slate-200');
                      }}
                    />
                  )}

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this file?')) {
                            handleDeleteFile(item._id);
                          }
                        }}
                        className="!p-2 rounded-full"
                        title="Delete File"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-white text-xs truncate">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={`media-${selectedImage._id}`}
              className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
              >
                <FiX className="w-8 h-8" />
              </button>

              {selectedImage.fileType === 'video' ? (
                <video
                  src={selectedImage.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                />
              ) : (
                <img
                  src={selectedImage.url}
                  alt="Full view"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              )}

              <div className="absolute -bottom-12 left-0 text-white">
                <p className="text-lg font-medium">Uploaded on {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserFiles;
