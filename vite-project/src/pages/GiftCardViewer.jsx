import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { FiDownload, FiHeart, FiLock, FiCheck, FiSend, FiX, FiImage, FiMusic, FiVideo } from 'react-icons/fi';
import { getGiftCardBySlug, unlockGiftCard, downloadGiftCardZip } from '../api/giftCardApi';
import { createSelection } from '../api/selectionApi';
import SlotBasedLayout from '../components/SlotBasedLayout';
import Button from '../components/ui/Button';

/**
 * GiftCardViewer Component
 * Public view for gift cards - no authentication required
 */
const GiftCardViewer = () => {
  const { slug } = useParams();

  const [giftCard, setGiftCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  // Download state
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const giftCardRef = useRef(null);

  // Photo gallery state
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const [allowDownload, setAllowDownload] = useState(false);

  // Selection Modal State
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [submittingSelection, setSubmittingSelection] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');

  useEffect(() => {
    // Set window size after component mounts (client-side only)
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    fetchGiftCard();
  }, [slug]);

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const fetchGiftCard = async () => {
    try {
      setLoading(true);
      const response = await getGiftCardBySlug(slug);
      const data = response.data.data;
      setGiftCard(data);
      setAllowDownload(data.allowDownload || false);

      if (data.isProtected) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error fetching gift card:', error);
      setError(error.response?.data?.error || 'Gift card not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    try {
      setUnlocking(true);
      const response = await unlockGiftCard(slug, passwordInput);
      const data = response.data.data;
      setGiftCard(data);
      setAllowDownload(data.allowDownload || false);
      setIsLocked(false);
      setShowConfetti(true); // Restart confetti on unlock

      // Restart confetti timer
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

    } catch (error) {
      console.error('Error unlocking gift card:', error);
      toast.error(error.response?.data?.error || 'Incorrect password');
      setPasswordInput('');
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!giftCardRef.current || downloadingImage) return;

    try {
      setDownloadingImage(true);
      toast.loading('Generating image... This may take a few seconds.', { id: 'download-image' });

      // Use html2canvas to capture the gift card
      const canvas = await html2canvas(giftCardRef.current, {
        useCORS: true, // Enable CORS for external images (Cloudinary)
        scale: 2, // Higher quality image
        backgroundColor: null,
        logging: false,
      });

      // Convert canvas to blob
      const dataUrl = canvas.toDataURL('image/png');

      // Create sanitized filename from gift card title
      const sanitizedTitle = giftCard.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const filename = `${sanitizedTitle || 'gift-card'}.png`;

      // Create temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Gift card downloaded successfully!', { id: 'download-image' });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.', { id: 'download-image' });
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleDownloadZip = async () => {
    if (downloadingZip) return;

    try {
      setDownloadingZip(true);
      toast.loading('Preparing ZIP download... This may take a while.', { id: 'download-zip' });

      const response = await downloadGiftCardZip(slug, passwordInput);

      // Create blob from response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${giftCard.title || 'gift-card'}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('ZIP downloaded successfully!', { id: 'download-zip' });
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      toast.error(error.response?.data?.error || 'Failed to download ZIP', { id: 'download-zip' });
    } finally {
      setDownloadingZip(false);
    }
  };

  // Selection handler
  const handleSelect = (photoId) => {
    if (!giftCard.allowClientSelection) return;

    setSelectedMedia(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSubmitSelection = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      toast.error('Please fill in your name and email');
      return;
    }

    try {
      setSubmittingSelection(true);
      await createSelection({
        folderId: giftCard.albumId, // Correct field name from schema
        giftCardId: giftCard._id,
        clientName,
        clientEmail,
        mediaIds: Array.from(selectedMedia),
        message: selectionMessage
      });

      toast.success('Favorites sent to photographer!');
      setShowSelectionModal(false);
      setSelectedMedia(new Set()); // Clear selections or keep them? Usually clear or show status.
      setClientName('');
      setClientEmail('');
      setSelectionMessage('');
    } catch (error) {
      console.error('Error submitting selection:', error);
      toast.error('Failed to send favorites. Please try again.');
    } finally {
      setSubmittingSelection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your gift...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <p className="text-gray-500 text-sm">
            Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!giftCard) {
    return null;
  }

  const themeColor = giftCard.themeColor || '#ec4899';

  // Lock Screen
  if (isLocked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}30 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border-4"
          style={{ borderColor: `${themeColor}40` }}
        >
          <div
            className="inline-block p-6 rounded-full mb-6 shadow-lg"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <FiLock className="h-16 w-16" style={{ color: themeColor }} />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            This Gift is Locked
          </h2>
          <p className="text-gray-600 mb-8">
            Please enter the password to view your special gift from {giftCard.sender?.username || 'a friend'}.
          </p>

          <form onSubmit={handleUnlock}>
            <div className="mb-6">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-6 py-4 text-lg text-center border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500 transition-colors"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={unlocking || !passwordInput}
              isLoading={unlocking}
              className="w-full py-4 text-lg rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`
              }}
            >
              Unlock Gift 🎁
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}30 100%)`,
      }}
    >
      {/* Confetti Effect */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-4">
        {/* Download ZIP Button */}
        {allowDownload && (
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="bg-white/90 hover:bg-white backdrop-blur-lg text-gray-800 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{ borderColor: `${themeColor}40` }}
            title="Download All Photos"
          >
            {downloadingZip ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FiDownload className="h-6 w-6" />
            )}
          </button>
        )}

        {/* Download Image Button */}
        <button
          onClick={handleDownloadImage}
          disabled={downloadingImage}
          className="bg-white/90 hover:bg-white backdrop-blur-lg text-gray-800 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2"
          style={{ borderColor: `${themeColor}40` }}
          title="Download as Image"
        >
          {downloadingImage ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiImage className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Content Container */}
      <div ref={giftCardRef} className="relative z-10 max-w-5xl mx-auto p-6 sm:p-8 md:p-12">
        {/* Branding Header */}
        {giftCard.branding && (giftCard.branding.name || giftCard.branding.logoUrl) && (
          <div className="flex items-center gap-3 mb-8">
            {giftCard.branding.logoUrl && (
              <img src={giftCard.branding.logoUrl} alt={giftCard.branding.name} className="h-12 object-contain drop-shadow-md" />
            )}
            {giftCard.branding.name && (
              <p className="text-lg font-semibold uppercase tracking-wider text-white/90 drop-shadow-md">
                {giftCard.branding.name}
              </p>
            )}
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block p-6 rounded-full mb-6 shadow-2xl"
            style={{ backgroundColor: themeColor }}
          >
            <FiCheck className="h-16 w-16 text-white" />
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6"
            style={{ color: themeColor }}
          >
            {giftCard.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto border-4"
            style={{ borderColor: `${themeColor}40` }}
          >
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
              {giftCard.message}
            </p>
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <p className="text-gray-500 italic">
                From: {giftCard.sender?.username || 'Anonymous'}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Media Content Blocks */}
        <div className="space-y-12">
          {giftCard.mediaContent && giftCard.mediaContent.sort((a, b) => a.order - b.order).map((block) => (
            <div key={block.blockId} className="w-full">
              {block.mediaItems && block.mediaItems.length > 0 && (
                <>
                  {/* Slot-Based Layout (Admin-designed custom layout) */}
                  {giftCard.template?.layoutSlots && giftCard.template.layoutSlots.length > 0 ? (
                    <SlotBasedLayout
                      layoutSlots={giftCard.template.layoutSlots}
                      mediaItems={block.mediaItems}
                      themeColor={themeColor}
                      baseHeight={giftCard.template.layoutConfig?.canvasHeight || 600}
                      selectedMedia={selectedMedia}
                      onSelect={handleSelect}
                      allowSelection={giftCard.allowClientSelection}
                    />
                  ) : (
                    <>
                      {/* Slideshow Layout */}
                      {block.blockLayoutType === 'slideshow' && (
                        <Slideshow mediaItems={block.mediaItems} />
                      )}

                      {/* Grid Standard Layout */}
                      {block.blockLayoutType === 'grid-standard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {block.mediaItems.map((item, index) => (
                            <MediaGridItem
                              key={item._id || `item-${index}`}
                              item={item}
                              themeColor={themeColor}
                              layoutType="standard"
                              isSelected={selectedMedia.has(item.mediaId?._id)}
                              onSelect={() => handleSelect(item.mediaId?._id)}
                              allowSelection={giftCard.allowClientSelection}
                            />
                          ))}
                        </div>
                      )}

                      {/* Collage Layout */}
                      {block.blockLayoutType === 'grid-collage' && (
                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                          {block.mediaItems.map((item, index) => (
                            <MediaGridItem
                              key={item._id || `item-${index}`}
                              item={item}
                              themeColor={themeColor}
                              layoutType="collage"
                              isSelected={selectedMedia.has(item.mediaId?._id)}
                              onSelect={() => handleSelect(item.mediaId?._id)}
                              allowSelection={giftCard.allowClientSelection}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        < motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center mt-16 pb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 inline-block">
            <p className="text-gray-600 mb-2">
              Created with ❤️ on {new Date(giftCard.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-500 text-sm">
              Made with Photo Gallery App
            </p>
          </div>
        </motion.div>
      </div>
      {/* Floating Action Bar for Selections */}
      <AnimatePresence>
        {giftCard.allowClientSelection && selectedMedia.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-pink-200 p-2 pl-6 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-pink-600 font-bold text-lg">{selectedMedia.size}</span>
              <span className="text-gray-600 font-medium">selected</span>
            </div>
            <button
              onClick={() => setShowSelectionModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Send to Photographer</span>
              <FiSend className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Submission Modal */}
      <AnimatePresence>
        {showSelectionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Send Favorites</h3>
                  <button
                    onClick={() => setShowSelectionModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitSelection} className="p-6 space-y-4">
                <div className="bg-pink-50 rounded-xl p-4 mb-4">
                  <p className="text-pink-800 text-sm">
                    You are sending <strong>{selectedMedia.size}</strong> photos to the photographer.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    value={selectionMessage}
                    onChange={(e) => setSelectionMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none h-24"
                    placeholder="Any specific instructions..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingSelection}
                  isLoading={submittingSelection}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Send Selection
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Slideshow = ({ mediaItems }) => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  if (!mediaItems || mediaItems.length === 0) return null;

  const currentItem = mediaItems[index];
  const media = currentItem?.mediaId;

  if (!media) return null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {currentItem.type === 'image' ? (
            <img
              src={media.filePath}
              alt={media.caption || ''}
              className="w-full h-full object-contain"
            />
          ) : currentItem.type === 'video' ? (
            <video
              src={media.filePath}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <audio src={media.filePath} controls />
            </div>
          )}

          {/* Caption Overlay */}
          {media.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-center backdrop-blur-sm">
              <p className="text-lg font-medium">{media.caption}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {mediaItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MediaGridItem = ({ item, themeColor, layoutType, isSelected, onSelect, allowSelection }) => {
  const media = item?.mediaId;
  if (!media) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border-4 hover:shadow-2xl transition-all transform hover:scale-[1.02] group relative ${layoutType === 'collage' ? 'mb-4 break-inside-avoid' : 'h-full'
        }`}
      style={{ borderColor: `${themeColor}40` }}
    >
      {/* Selection Button Overlay */}
      <div className="absolute top-4 right-4 z-20">
        {allowSelection && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${isSelected ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white opacity-0 group-hover:opacity-100'}`}
          >
            <FiHeart className={`w-6 h-6 ${isSelected ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Image */}
      {item.type === 'image' && (
        <img
          src={media.filePath}
          alt={media.caption || 'Memory'}
          className="w-full h-auto object-cover"
        />
      )}

      {/* Video */}
      {item.type === 'video' && (
        <video
          src={media.filePath}
          controls
          className="w-full h-auto"
        />
      )}

      {/* Audio */}
      {item.type === 'audio' && (
        <div className="p-6">
          <div
            className="rounded-2xl p-8 mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <FiMusic className="h-20 w-20" style={{ color: themeColor }} />
          </div>

          {media.caption && (
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{media.caption}</h3>
          )}

          <audio
            src={media.filePath}
            controls
            className="w-full"
          />
        </div>
      )}

      {/* Caption for images and videos */}
      {media.caption && (item.type === 'image' || item.type === 'video') && (
        <div className="p-4 bg-white">
          <p className="text-gray-700 font-medium">{media.caption}</p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCardViewer;
