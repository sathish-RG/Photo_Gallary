import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { getMedia } from '../api/mediaApi';
import { createGiftCard, getAlbumGiftCards, updateGiftCard } from '../api/giftCardApi';

/**
 * GiftCardBuilder Component
 * Multi-step wizard for creating digital gift cards
 */
const GiftCardBuilder = () => {
  const { folderId, giftCardId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!giftCardId;

  // Steps: 1 = Selection, 2 = Customization, 3 = Share
  const [currentStep, setCurrentStep] = useState(1);

  // Media from the album
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected media items with layout info
  const [selectedMedia, setSelectedMedia] = useState([]);

  // Customization fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [themeColor, setThemeColor] = useState('#ec4899');
  const [password, setPassword] = useState('');

  // Generated gift card data
  const [giftCardUrl, setGiftCardUrl] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Fetch available media
        const mediaResponse = await getMedia(folderId);
        const mediaList = mediaResponse.data;
        setAvailableMedia(mediaList);

        // 2. If edit mode, fetch gift card details
        if (isEditMode) {
          const cardsResponse = await getAlbumGiftCards(folderId);
          const card = cardsResponse.data.data.find(c => c._id === giftCardId);

          if (card) {
            setTitle(card.title);
            setMessage(card.message);
            setThemeColor(card.themeColor);
            // Password is not returned by API for security, so we leave it blank
            // User can set a new one if they want to change it
            setGiftCardUrl(`${window.location.origin}/view/${card.uniqueSlug}`);

            // Map existing media content to selectedMedia format
            const existingMedia = card.mediaContent.map(item => {
              // item.mediaId is populated with the full media object
              const mediaData = item.mediaId;
              return {
                mediaId: mediaData._id,
                type: item.type,
                layoutType: item.layoutType || 'full-width',
                order: item.order,
                mediaData: mediaData // Store for preview
              };
            }).sort((a, b) => a.order - b.order);

            setSelectedMedia(existingMedia);
          } else {
            toast.error('Gift card not found');
            navigate(`/gallery/${folderId}`);
          }
        }
      } catch (error) {
        console.error('Error initializing builder:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [folderId, giftCardId, navigate]);

  // Step 1: Toggle media selection
  const toggleMediaSelection = (media) => {
    setSelectedMedia((prev) => {
      const isSelected = prev.find((item) => item.mediaId === media._id);
      if (isSelected) {
        return prev.filter((item) => item.mediaId !== media._id);
      } else {
        return [
          ...prev,
          {
            mediaId: media._id,
            type: media.fileType,
            layoutType: 'full-width',
            order: prev.length,
            mediaData: media, // Store for preview
          },
        ];
      }
    });
  };

  // Step 2: Change layout type for a media item
  const changeLayoutType = (mediaId, layoutType) => {
    setSelectedMedia((prev) =>
      prev.map((item) =>
        item.mediaId === mediaId ? { ...item, layoutType } : item
      )
    );
  };

  // Step 2: Move media up in order
  const moveMediaUp = (index) => {
    if (index === 0) return;
    setSelectedMedia((prev) => {
      const newArray = [...prev];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      return newArray.map((item, i) => ({ ...item, order: i }));
    });
  };

  // Step 2: Move media down in order
  const moveMediaDown = (index) => {
    if (index === selectedMedia.length - 1) return;
    setSelectedMedia((prev) => {
      const newArray = [...prev];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray.map((item, i) => ({ ...item, order: i }));
    });
  };

  // Step 3: Create or Update gift card
  const handleSaveGiftCard = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title,
        message,
        themeColor,
        albumId: folderId,
        password, // Add password to payload
        mediaContent: selectedMedia.map((item, index) => ({
          mediaId: item.mediaId,
          type: item.type,
          layoutType: item.layoutType,
          order: index, // Ensure order is sequential based on current array
        })),
      };

      let response;
      if (isEditMode) {
        response = await updateGiftCard(giftCardId, payload);
        toast.success('Gift card updated successfully!');
      } else {
        response = await createGiftCard(payload);
        toast.success('Gift card created successfully!');
      }

      setGiftCardUrl(response.data.publicUrl);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving gift card:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} gift card`);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(giftCardUrl);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            🎁 Create Gift Card
          </h1>
          <p className="text-gray-600 text-lg">
            Share your memories in a beautiful way
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= step
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${currentStep > step ? 'bg-pink-500' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Selection
              availableMedia={availableMedia}
              selectedMedia={selectedMedia}
              toggleMediaSelection={toggleMediaSelection}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Customization
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
              themeColor={themeColor}
              setThemeColor={setThemeColor}
              password={password}
              setPassword={setPassword}
              selectedMedia={selectedMedia}
              changeLayoutType={changeLayoutType}
              moveMediaUp={moveMediaUp}
              moveMediaDown={moveMediaDown}
              onBack={() => setCurrentStep(1)}
              onCreate={handleSaveGiftCard}
              creating={creating}
              isEditMode={isEditMode}
            />
          )}

          {currentStep === 3 && (
            <Step3Share
              giftCardUrl={giftCardUrl}
              copyToClipboard={copyToClipboard}
              onDone={() => navigate(`/gallery/${folderId}`)}
              isEditMode={isEditMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ===== STEP 1: Media Selection =====
const Step1Selection = ({ availableMedia, selectedMedia, toggleMediaSelection, onNext }) => {
  const isSelected = (mediaId) => selectedMedia.some((item) => item.mediaId === mediaId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-pink-100"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Step 1: Select Media
      </h2>
      <p className="text-gray-600 mb-6">
        Choose the photos, videos, or audio files you want to include ({selectedMedia.length} selected)
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8 max-h-96 overflow-y-auto p-2">
        {availableMedia.map((media) => (
          <div
            key={media._id}
            onClick={() => toggleMediaSelection(media)}
            className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all transform hover:scale-105 ${isSelected(media._id)
              ? 'border-pink-500 shadow-lg'
              : 'border-transparent hover:border-pink-200'
              }`}
          >
            {/* Media Preview */}
            {media.fileType === 'image' && (
              <img
                src={media.filePath}
                alt={media.caption || 'Media'}
                className="w-full h-32 object-cover"
              />
            )}
            {media.fileType === 'video' && (
              <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
                <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
            {media.fileType === 'audio' && (
              <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}

            {/* Checkbox */}
            {isSelected(media._id) && (
              <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {availableMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No media available in this album</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={selectedMedia.length === 0}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
        >
          Next: Customize
        </button>
      </div>
    </motion.div>
  );
};

// ===== STEP 2: Customization =====
const Step2Customization = ({
  title,
  setTitle,
  message,
  setMessage,
  themeColor,
  setThemeColor,
  password,
  setPassword,
  selectedMedia,
  changeLayoutType,
  moveMediaUp,
  moveMediaDown,
  onBack,
  onCreate,
  creating,
  isEditMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-pink-100"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Step 2: {isEditMode ? 'Update' : 'Customize'} Your Gift Card
      </h2>

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Happy Birthday! 🎉"
          maxLength={100}
          className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Message Input */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Personal Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a heartfelt message..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">{message.length} / 1000 characters</p>
      </div>

      {/* Theme Color Picker */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Theme Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-pink-200"
          />
          <input
            type="text"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            placeholder="#ec4899"
            className="px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Password Protection (Optional) */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Password Protection (Optional)
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password to lock this gift card"
            className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
          >
            {showPassword ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Leave blank for no password. {isEditMode && "Enter a new password to change it, or leave blank to keep existing protection (if any)."}
        </p>
      </div>

      {/* Media Reordering */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Arrange & Customize Media ({selectedMedia.length} items)
        </label>
        <div className="space-y-3 max-h-64 overflow-y-auto p-2">
          {selectedMedia.map((item, index) => (
            <div
              key={item.mediaId}
              className="flex items-center gap-4 bg-pink-50 p-4 rounded-xl border border-pink-100"
            >
              {/* Preview Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                {item.type === 'image' && (
                  <img
                    src={item.mediaData.filePath}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                {item.type === 'video' && (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Layout Type Selector */}
              <select
                value={item.layoutType}
                onChange={(e) => changeLayoutType(item.mediaId, e.target.value)}
                className="px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500"
              >
                <option value="full-width">Full Width</option>
                <option value="half-width">Half Width</option>
                <option value="carousel-item">Carousel</option>
              </select>

              {/* Reorder Buttons */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => moveMediaUp(index)}
                  disabled={index === 0}
                  className="p-2 bg-white rounded-lg hover:bg-pink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveMediaDown(index)}
                  disabled={index === selectedMedia.length - 1}
                  className="p-2 bg-white rounded-lg hover:bg-pink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
        >
          Back
        </button>
        <button
          onClick={onCreate}
          disabled={creating || !title.trim() || !message.trim()}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
        >
          {creating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Gift Card' : 'Create Gift Card')}
        </button>
      </div>
    </motion.div>
  );
};

// ===== STEP 3: Share =====
const Step3Share = ({ giftCardUrl, copyToClipboard, onDone }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-pink-100 text-center"
    >
      <div className="mb-6">
        <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mb-4">
          <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          🎉 Gift Card Created!
        </h2>
        <p className="text-gray-600 text-lg">
          Share this link with your special someone
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-lg">
        <QRCodeSVG value={giftCardUrl} size={200} level="H" />
      </div>

      {/* URL Display */}
      <div className="mb-6">
        <div className="flex items-center gap-3 bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
          <input
            type="text"
            value={giftCardUrl}
            readOnly
            className="flex-1 bg-transparent text-gray-700 font-mono text-sm focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-left bg-pink-50 p-6 rounded-xl mb-6">
        <h3 className="font-bold text-gray-800 mb-3">How to share:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">1.</span>
            <span>Copy the link above and send it via email, text, or social media</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">2.</span>
            <span>Or scan the QR code with a mobile device</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">3.</span>
            <span>No login required! Anyone with the link can view your gift card</span>
          </li>
        </ul>
      </div>

      {/* Done Button */}
      <button
        onClick={onDone}
        className="px-10 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg transform hover:scale-105"
      >
        Done
      </button>
    </motion.div>
  );
};

export default GiftCardBuilder;
