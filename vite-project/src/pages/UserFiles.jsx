// src/pages/UserFiles.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserContent } from '../api/adminApi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">No data available.</div>;

  const { user, folders, media } = data;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Files for {user.username}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="font-semibold text-gray-700">Total Media:</span> {media.length}
        </div>
      </div>

      {/* Folders Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Folders ({folders.length})
        </h2>
        {folders.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-dashed border-gray-300">
            No folders created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div key={folder._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 truncate">{folder.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Media Gallery ({media.length})
        </h2>
        {media.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500 border border-dashed border-gray-300">
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
                  className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  onClick={() => setSelectedImage({ ...item, url: imageUrl })}
                >
                  {item.fileType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <video
                        src={imageUrl}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
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
                        e.target.parentElement.classList.add('bg-gray-200');
                      }}
                    />
                  )}

                  {/* Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
