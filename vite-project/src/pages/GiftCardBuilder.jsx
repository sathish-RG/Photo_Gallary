import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { getMedia } from '../api/mediaApi';
import { createGiftCard, getAlbumGiftCards, updateGiftCard } from '../api/giftCardApi';
import { getTemplateById } from '../api/templateApi';
import QRCodeGenerator from '../components/QRCodeGenerator';
import ControlSidebar from '../components/ControlSidebar';
import LivePreview from '../components/LivePreview';

/**
 * GiftCardBuilder Component
 * Split-screen layout for creating digital gift cards
 */
const GiftCardBuilder = () => {
  const { folderId, giftCardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get('templateId');
  const isEditMode = !!giftCardId;

  // Media from the album
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected media items
  // Content Blocks state
  const [contentBlocks, setContentBlocks] = useState([
    {
      blockId: `block-${Date.now()}`,
      blockLayoutType: 'grid-standard',
      order: 0,
      mediaItems: []
    }
  ]);
  const [activeBlockId, setActiveBlockId] = useState(contentBlocks[0].blockId);

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

            // Helper to attach full media data from availableMedia
            const attachMediaData = (items) => {
              return items.map(item => {
                const mediaId = item.mediaId?._id || item.mediaId;
                const fullMedia = mediaList.find(m => m._id === mediaId);
                return {
                  mediaId: mediaId,
                  type: item.type,
                  mediaData: fullMedia || (item.mediaId?._id ? item.mediaId : null) // Fallback to populated data if available
                };
              });
            };

            // Map existing media content (blocks)
            if (card.mediaContent && card.mediaContent.length > 0 && card.mediaContent[0].blockId) {
              const sortedBlocks = card.mediaContent.sort((a, b) => a.order - b.order);
              const blocksWithData = sortedBlocks.map(block => ({
                ...block,
                mediaItems: attachMediaData(block.mediaItems)
              }));
              setContentBlocks(blocksWithData);
              setActiveBlockId(blocksWithData[0].blockId);
            } else if (card.mediaContent && card.mediaContent.length > 0) {
              // Legacy migration: wrap all media in a default block
              const legacyMedia = attachMediaData(card.mediaContent);

              const defaultBlock = {
                blockId: `block-${Date.now()}`,
                blockLayoutType: 'grid-standard',
                order: 0,
                mediaItems: legacyMedia
              };
              setContentBlocks([defaultBlock]);
              setActiveBlockId(defaultBlock.blockId);
            }
          } else {
            toast.error('Gift card not found');
            navigate(`/gallery/${folderId}`);
          }
        } else if (templateId) {
          // 3. If template mode, fetch template details
          try {
            const templateResponse = await getTemplateById(templateId);
            const template = templateResponse.data.data;

            if (template && template.layoutConfig) {
              const { themeColor, message, title } = template.layoutConfig;
              if (themeColor) setThemeColor(themeColor);
              if (message) setMessage(message);
              // We might want to keep title blank or use template name as placeholder
              // if (title) setTitle(title); 
            }
          } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Failed to load template');
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
  // --- Block Management ---

  const handleAddBlock = () => {
    const newBlock = {
      blockId: `block-${Date.now()}`,
      blockLayoutType: 'grid-standard',
      order: contentBlocks.length,
      mediaItems: []
    };
    setContentBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.blockId);
  };

  const handleRemoveBlock = (blockId) => {
    if (contentBlocks.length <= 1) {
      toast.warning('You must have at least one block');
      return;
    }
    setContentBlocks(prev => {
      const filtered = prev.filter(b => b.blockId !== blockId);
      // Re-index orders
      return filtered.map((b, i) => ({ ...b, order: i }));
    });
    if (activeBlockId === blockId) {
      setActiveBlockId(contentBlocks.find(b => b.blockId !== blockId)?.blockId);
    }
  };

  const handleUpdateBlockLayout = (blockId, layoutType) => {
    setContentBlocks(prev => prev.map(b =>
      b.blockId === blockId ? { ...b, blockLayoutType: layoutType } : b
    ));
  };

  const handleReorderBlocks = (dragIndex, hoverIndex) => {
    const newBlocks = [...contentBlocks];
    const draggedBlock = newBlocks[dragIndex];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);

    // Update order property
    const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
    setContentBlocks(reordered);
  };

  // --- Media Management within Blocks ---

  // Toggle media selection (adds/removes from ACTIVE block)
  const handleToggleMedia = (media) => {
    setContentBlocks(prev => {
      const newBlocks = [...prev];
      const activeBlockIndex = newBlocks.findIndex(b => b.blockId === activeBlockId);

      if (activeBlockIndex === -1) return prev;

      const activeBlock = { ...newBlocks[activeBlockIndex] };
      const existingMediaIndex = activeBlock.mediaItems.findIndex(item => item.mediaId === media._id);

      if (existingMediaIndex >= 0) {
        // Remove if already exists in this block
        activeBlock.mediaItems = activeBlock.mediaItems.filter(item => item.mediaId !== media._id);
      } else {
        // Add to block
        activeBlock.mediaItems = [
          ...activeBlock.mediaItems,
          {
            mediaId: media._id,
            type: media.fileType,
            mediaData: media
          }
        ];
      }

      newBlocks[activeBlockIndex] = activeBlock;
      return newBlocks;
    });
  };

  // Remove media from specific block
  const handleRemoveMediaFromBlock = (blockId, mediaId) => {
    setContentBlocks(prev => prev.map(b => {
      if (b.blockId === blockId) {
        return {
          ...b,
          mediaItems: b.mediaItems.filter(m => m.mediaId !== mediaId)
        };
      }
      return b;
    }));
  };

  // Move media within a block
  const handleMoveMediaInBlock = (blockId, dragIndex, hoverIndex) => {
    setContentBlocks(prev => prev.map(b => {
      if (b.blockId === blockId) {
        const newItems = [...b.mediaItems];
        const draggedItem = newItems[dragIndex];
        newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, draggedItem);
        return { ...b, mediaItems: newItems };
      }
      return b;
    }));
  };

  // Save gift card
  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    if (contentBlocks.length === 0 || contentBlocks.every(b => b.mediaItems.length === 0)) {
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
        mediaContent: contentBlocks.map((block, index) => ({
          blockId: block.blockId,
          blockLayoutType: block.blockLayoutType,
          order: index,
          mediaItems: block.mediaItems.map(item => ({
            mediaId: item.mediaId,
            type: item.type
          }))
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
            contentBlocks={contentBlocks}
            activeBlockId={activeBlockId}
            setActiveBlockId={setActiveBlockId}
            availableMedia={availableMedia}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onUpdateBlockLayout={handleUpdateBlockLayout}
            onReorderBlocks={handleReorderBlocks}
            onToggleMedia={handleToggleMedia}
            onRemoveMediaFromBlock={handleRemoveMediaFromBlock}
            onMoveMediaInBlock={handleMoveMediaInBlock}
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
            contentBlocks={contentBlocks}
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
            <QRCodeGenerator value={giftCardUrl} themeColor={themeColor} />

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
