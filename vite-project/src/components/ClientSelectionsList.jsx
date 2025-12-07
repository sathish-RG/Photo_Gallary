import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientSelectionsList = ({ selections, loading }) => {
  const [expandedSelection, setExpandedSelection] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (!selections || selections.length === 0) {
    return (
      <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-100">
        <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-medium text-gray-600">No selections yet</h3>
        <p className="mt-2 text-gray-500">When clients select favorites, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selections.map((selection) => (
        <motion.div
          key={selection._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-pink-100"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-800">{selection.clientName}</h3>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                  {selection.mediaItems?.length || 0} Photos
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selection.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600">{selection.clientEmail}</p>
              {selection.message && (
                <p className="mt-2 text-gray-500 italic">"{selection.message}"</p>
              )}
            </div>

            <button
              onClick={() => setExpandedSelection(expandedSelection === selection._id ? null : selection._id)}
              className="px-6 py-2 bg-white border-2 border-pink-200 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
            >
              {expandedSelection === selection._id ? 'Hide Photos' : 'View Photos'}
              <svg
                className={`w-5 h-5 transition-transform ${expandedSelection === selection._id ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {expandedSelection === selection._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selection.mediaItems?.map((media) => (
                      <div key={media._id} className="relative group aspect-square">
                        <img
                          src={media.filePath}
                          alt={media.caption || 'Selected photo'}
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={media.filePath}
                            download
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Download"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default ClientSelectionsList;
