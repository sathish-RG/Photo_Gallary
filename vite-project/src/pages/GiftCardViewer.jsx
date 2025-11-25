import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { getGiftCardBySlug, unlockGiftCard } from '../api/giftCardApi';

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
      setGiftCard(response.data.data);
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
            <svg className="h-16 w-16" fill="none" stroke={themeColor} viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
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

            <button
              type="submit"
              disabled={unlocking || !passwordInput}
              className="w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`
              }}
            >
              {unlocking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Unlocking...
                </span>
              ) : 'Unlock Gift 🎁'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Sort media by order
  const sortedMedia = [...giftCard.mediaContent].sort((a, b) => a.order - b.order);

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

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto p-6 sm:p-8 md:p-12">
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
            <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
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

        {/* Media Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: themeColor }}>
            Your Special Memories 🎁
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedMedia.map((item, index) => (
              <MediaItem
                key={item._id}
                item={item}
                index={index}
                themeColor={themeColor}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
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
    </div>
  );
};

/**
 * MediaItem Component
 * Renders individual media with layout type
 */
const MediaItem = ({ item, index, themeColor }) => {
  const media = item.mediaId;

  if (!media) {
    return null;
  }

  const getColumnSpan = () => {
    switch (item.layoutType) {
      case 'full-width':
        return 'md:col-span-2';
      case 'half-width':
        return 'md:col-span-1';
      case 'carousel-item':
        return 'md:col-span-1';
      default:
        return 'md:col-span-2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
      className={`${getColumnSpan()} bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border-4 hover:shadow-2xl transition-all transform hover:scale-[1.02]`}
      style={{ borderColor: `${themeColor}40` }}
    >
      {/* Image */}
      {media.fileType === 'image' && (
        <img
          src={media.filePath}
          alt={media.caption || 'Memory'}
          className="w-full h-auto object-cover"
        />
      )}

      {/* Video */}
      {media.fileType === 'video' && (
        <video
          src={media.filePath}
          controls
          className="w-full h-auto"
        />
      )}

      {/* Audio */}
      {media.fileType === 'audio' && (
        <div className="p-6">
          <div
            className="rounded-2xl p-8 mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <svg
              className="h-20 w-20"
              fill="none"
              stroke={themeColor}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
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
      {media.caption && (media.fileType === 'image' || media.fileType === 'video') && (
        <div className="p-4 bg-white">
          <p className="text-gray-700 font-medium">{media.caption}</p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCardViewer;
