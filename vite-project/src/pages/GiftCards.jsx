import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiGift, FiCopy, FiEdit2, FiTrash2, FiMusic, FiPlus } from 'react-icons/fi';
import { getUserGiftCards, deleteGiftCard } from '../api/giftCardApi';
import ConfirmationModal from '../components/ConfirmationModal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const GiftCards = () => {
  const navigate = useNavigate();
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await getUserGiftCards();
      setGiftCards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (giftCard) => {
    console.log('handleDeleteClick called for:', giftCard._id);
    setSelectedGiftCard(giftCard);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log('handleConfirmDelete called. selectedGiftCard:', selectedGiftCard);
    if (!selectedGiftCard) {
      console.warn('No selectedGiftCard in handleConfirmDelete');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Calling deleteGiftCard API...');
      await deleteGiftCard(selectedGiftCard._id);
      console.log('deleteGiftCard API success');
      toast.success('Gift card deleted successfully!');
      setDeleteModalOpen(false);
      fetchGiftCards();
    } catch (error) {
      console.error('Error deleting gift card:', error);
      toast.error(error.response?.data?.error || 'Failed to delete gift card');
    } finally {
      setIsDeleting(false);
      setSelectedGiftCard(null);
    }
  };

  const copyPublicLink = (slug) => {
    const publicUrl = `${window.location.origin}/view/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleEdit = (giftCard) => {
    if (giftCard.albumId) {
      navigate(`/gallery/${giftCard.albumId}/gift-card/${giftCard._id}/edit`);
    } else {
      toast.error('Cannot edit this gift card: Album not found');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Gift Cards</h1>
          <p className="text-slate-500 mt-1">Manage and share your digital gift cards</p>
        </div>
        <Button onClick={() => navigate('/gallery')} icon={FiPlus}>
          Create New
        </Button>
      </div>

      {giftCards.length === 0 ? (
        <EmptyState
          title="No Gift Cards Yet"
          description="Create your first gift card from one of your albums to share special memories!"
          icon={FiGift}
          action={{
            label: 'Go to Albums',
            onClick: () => navigate('/gallery')
          }}
        />
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Gift Card"
        message={`Are you sure you want to delete "${selectedGiftCard?.title}"? The public link will no longer work.`}
        confirmText="Delete"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

const GiftCardItem = ({ giftCard, onDelete, onCopyLink, onEdit }) => {
  const firstMedia = giftCard.mediaContent?.[0]?.mediaId;
  const hasMedia = firstMedia && firstMedia.filePath;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-md transition-all group"
    >
      <div
        className="h-48 bg-slate-100 overflow-hidden relative"
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
                className="w-full h-full object-cover opacity-90"
              />
            )}
            {firstMedia.fileType === 'video' && (
              <video
                src={firstMedia.filePath}
                className="w-full h-full object-cover opacity-90"
                muted
              />
            )}
            {firstMedia.fileType === 'audio' && (
              <div className="w-full h-full flex items-center justify-center">
                <FiMusic className="w-16 h-16 text-white/80" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiGift className="w-16 h-16 text-white/80" />
          </div>
        )}

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {giftCard.mediaContent?.length || 0} items
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={giftCard.title}>
          {giftCard.title}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2" title={giftCard.message}>
          {giftCard.message}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>Created {new Date(giftCard.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={() => onCopyLink(giftCard.uniqueSlug)}
            className="text-xs px-2 py-2 h-auto"
            title="Copy Public Link"
          >
            <FiCopy className="w-3.5 h-3.5 mr-1" />
            Copy
          </Button>

          <Button
            variant="secondary"
            onClick={() => onEdit(giftCard)}
            className="text-xs px-2 py-2 h-auto"
            title="Edit Gift Card"
          >
            <FiEdit2 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() => onDelete(giftCard)}
            className="text-xs px-2 py-2 h-auto"
            title="Delete Gift Card"
          >
            <FiTrash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GiftCards;
