import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiChevronDown, FiDownload } from 'react-icons/fi';
import Skeleton from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

const ClientSelectionsList = ({ selections, loading }) => {
  const [expandedSelection, setExpandedSelection] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!selections || selections.length === 0) {
    return (
      <EmptyState
        title="No selections yet"
        description="When clients select favorites, they will appear here."
        icon={FiHeart}
      />
    );
  }

  return (
    <div className="space-y-6">
      {selections.map((selection) => (
        <motion.div
          key={selection._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100"
        >
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-slate-800">{selection.clientName}</h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {selection.mediaItems?.length || 0} Photos
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(selection.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-600">{selection.clientEmail}</p>
              {selection.message && (
                <p className="mt-2 text-slate-500 italic">"{selection.message}"</p>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => setExpandedSelection(expandedSelection === selection._id ? null : selection._id)}
              className="flex items-center gap-2"
            >
              {expandedSelection === selection._id ? 'Hide Photos' : 'View Photos'}
              <FiChevronDown
                className={`w-5 h-5 transition-transform ${expandedSelection === selection._id ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          <AnimatePresence>
            {expandedSelection === selection._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selection.mediaItems?.map((media) => (
                      <div key={media._id} className="relative group aspect-square">
                        <img
                          src={media.filePath}
                          alt={media.caption || 'Selected photo'}
                          className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={media.filePath}
                            download
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform text-slate-700"
                            title="Download"
                          >
                            <FiDownload className="w-5 h-5" />
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
