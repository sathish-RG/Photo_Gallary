import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { getMedia } from '../api/mediaApi';
import { createGiftCard, getAlbumGiftCards, updateGiftCard } from '../api/giftCardApi';
import ControlSidebar from '../components/ControlSidebar';
import LivePreview from '../components/LivePreview';

/**
 * GiftCardBuilder Component
 * Split-screen layout for creating digital gift cards
 */
const GiftCardBuilder = () => {
  const { folderId, giftCardId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!giftCardId;

  // Media from the album
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected media items
  const [selectedMedia, setSelectedMedia] = useState([]);

  // Customization fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [themeColor, setThemeColor] = useState('#ec4899');
  const [password, setPassword] = useState('');

  // Generated gift card data
  const [giftCardUrl, setGiftCardUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
            setGiftCardUrl(`${window.location.origin}/view/${card.uniqueSlug}`);

            // Map existing media content to selectedMedia format
            const existingMedia = card.mediaContent.map(item => {
              const mediaData = item.mediaId;
              return {
                mediaId: mediaData._id,
                type: item.type,
                layoutType: item.layoutType || 'full-width',
                order: item.order,
                mediaData: mediaData
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
  }, [folderId, giftCardId, navigate, isEditMode]);

  // Toggle media selection
  const handleToggleMedia = (media) => {
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
            mediaData: media,
          },
        ];
      }
    });
  };

  // Remove media
  const handleRemoveMedia = (mediaId) => {
    setSelectedMedia((prev) =>
      prev.filter((item) => item.mediaId !== mediaId)
        .map((item, i) => ({ ...item, order: i }))
    );
  };

  // Move media up
  const handleMoveMediaUp = (index) => {
    if (index === 0) return;
    setSelectedMedia((prev) => {
      const newArray = [...prev];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      return newArray.map((item, i) => ({ ...item, order: i }));
    });
  };

  // Move media down
  const handleMoveMediaDown = (index) => {
    if (index === selectedMedia.length - 1) return;
    setSelectedMedia((prev) => {
      const newArray = [...prev];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray.map((item, i) => ({ ...item, order: i }));
    });
  };

  // Save gift card
  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    if (selectedMedia.length === 0) {
      toast.error('Please select at least one media item');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title,
        message,
        themeColor,
        albumId: folderId,
        password,
        mediaContent: selectedMedia.map((item, index) => ({
          mediaId: item.mediaId,
          type: item.type,
          layoutType: item.layoutType,
          order: index,
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
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving gift card:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} gift card`);
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Split Screen Layout */}
      <div className="flex h-screen">
        {/* Left: Control Sidebar (35%) */}
        <div className="w-[35%] border-r border-gray-200 bg-white">
          <ControlSidebar
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            themeColor={themeColor}
            setThemeColor={setThemeColor}
            password={password}
            setPassword={setPassword}
            selectedMedia={selectedMedia}
            availableMedia={availableMedia}
            onToggleMedia={handleToggleMedia}
            onRemoveMedia={handleRemoveMedia}
            onMoveMediaUp={handleMoveMediaUp}
            onMoveMediaDown={handleMoveMediaDown}
            onSave={handleSave}
            saving={saving}
            isEditMode={isEditMode}
          />
        </div>

        {/* Right: Live Preview (65%) */}
        <div className="w-[65%]">
          <LivePreview
            title={title}
            message={message}
            themeColor={themeColor}
            selectedMedia={selectedMedia}
          />
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-pink-100">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mb-4">
                <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎉 Success!
              </h2>
              <p className="text-gray-600">
                Your gift card is ready to share
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-lg mx-auto flex justify-center">
              <QRCodeSVG value={giftCardUrl} size={180} level="H" />
            </div>

            {/* URL Display */}
            <div className="mb-6">
              <div className="flex items-center gap-2 bg-pink-50 p-3 rounded-xl border border-pink-200">
                <input
                  type="text"
                  value={giftCardUrl}
                  readOnly
                  className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Continue Editing
              </button>
              <button
                onClick={() => navigate(`/gallery/${folderId}`)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardBuilder;
