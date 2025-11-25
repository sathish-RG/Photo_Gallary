import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getAlbumGiftCards, deleteGiftCard } from '../api/giftCardApi';
import ConfirmationModal from '../components/ConfirmationModal';

/**
 * GiftCardManager Component
 * Displays and manages all saved gift cards for a specific album
 */
const GiftCardManager = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);

  useEffect(() => {
    fetchGiftCards();
  }, [folderId]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await getAlbumGiftCards(folderId);
      setGiftCards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGiftCard) return;

    try {
      await deleteGiftCard(selectedGiftCard._id);
      toast.success('Gift card deleted successfully!');
      fetchGiftCards();
    } catch (error) {
      console.error('Error deleting gift card:', error);
      toast.error(error.response?.data?.error || 'Failed to delete gift card');
    } finally {
      setSelectedGiftCard(null);
    }
  };

  const copyPublicLink = (slug) => {
    const publicUrl = `${window.location.origin}/view/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleEdit = (giftCard) => {
    // Navigate to edit page (will be implemented)
    navigate(`/gallery/${folderId}/gift-card/${giftCard._id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Saved Gift Cards ({giftCards.length})
        </h2>
      </div>

      {giftCards.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-100">
          <div className="inline-block p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-4">
            <svg className="h-16 w-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Gift Cards Yet</h3>
          <p className="text-gray-500">Create your first gift card to share special memories!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {giftCards.map((giftCard) => (
              <GiftCardItem
                key={giftCard._id}
                giftCard={giftCard}
                onDelete={handleDeleteClick}
                onCopyLink={copyPublicLink}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Gift Card"
        message={`Are you sure you want to delete "${selectedGiftCard?.title}"? The public link will no longer work.`}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};

/**
 * GiftCardItem Component
 * Individual gift card display card
 */
const GiftCardItem = ({ giftCard, onDelete, onCopyLink, onEdit }) => {
  // Get first media item for thumbnail preview
  const firstMedia = giftCard.mediaContent?.[0]?.mediaId;
  const hasMedia = firstMedia && firstMedia.filePath;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-pink-100 hover:shadow-2xl transition-all"
    >
      {/* Thumbnail Preview */}
      <div
        className="h-48 bg-gradient-to-br overflow-hidden relative"
        style={{
          backgroundColor: giftCard.themeColor || '#ec4899',
          background: `linear-gradient(135deg, ${giftCard.themeColor || '#ec4899'}40 0%, ${giftCard.themeColor || '#ec4899'}80 100%)`,
        }}
      >
        {hasMedia ? (
          <>
            {firstMedia.fileType === 'image' && (
              <img
                src={firstMedia.filePath}
                alt={giftCard.title}
                className="w-full h-full object-cover opacity-80"
              />
            )}
            {firstMedia.fileType === 'video' && (
              <video
                src={firstMedia.filePath}
                className="w-full h-full object-cover opacity-80"
                muted
              />
            )}
            {firstMedia.fileType === 'audio' && (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="h-20 w-20 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="h-20 w-20 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        )}

        {/* Media count badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
          {giftCard.mediaContent?.length || 0} items
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={giftCard.title}>
          {giftCard.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={giftCard.message}>
          {giftCard.message}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Created {new Date(giftCard.createdAt).toLocaleDateString()}</span>
          {giftCard.updatedAt && giftCard.updatedAt !== giftCard.createdAt && (
            <span>Edited {new Date(giftCard.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onCopyLink(giftCard.uniqueSlug)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            title="Copy Public Link"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>

          <button
            onClick={() => onEdit(giftCard)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            title="Edit Gift Card"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={() => onDelete(giftCard)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-rose-600 hover:to-red-700 transition-all shadow-md"
            title="Delete Gift Card"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GiftCardManager;
