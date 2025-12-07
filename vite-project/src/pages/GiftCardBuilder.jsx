import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiCheck, FiCopy, FiArrowLeft } from 'react-icons/fi';
import { getMedia } from '../api/mediaApi';
import { createGiftCard, getAlbumGiftCards, updateGiftCard } from '../api/giftCardApi';
import { getFolderSettings, updateFolderSettings } from '../api/folderApi';
import { getTemplateById } from '../api/templateApi';
import { uploadFileToCloudinary } from '../utils/cloudinaryStorage';
import QRCodeGenerator from '../components/QRCodeGenerator';
import ControlSidebar from '../components/ControlSidebar';
import LivePreview from '../components/LivePreview';
import Button from '../components/ui/Button';

/**
 * GiftCardBuilder Component
 * Split-screen layout for creating digital gift cards
 */
const GiftCardBuilder = () => {
  const { folderId, giftCardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlTemplateId = searchParams.get('templateId');
  const qrCodeId = searchParams.get('qrCodeId');
  const isEditMode = !!giftCardId;

  // State for template ID and Data
  const [selectedTemplateId, setSelectedTemplateId] = useState(urlTemplateId || null);
  const [templateData, setTemplateData] = useState(null);

  // Media from the album
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // Folder Settings State
  const [folderSettings, setFolderSettings] = useState({
    watermarkSettings: {
      enabled: false,
      text: 'COPYRIGHT',
      opacity: 50,
      position: 'center',
      fontSize: 80,
    },
    allowDownload: false,
    allowClientSelection: false,
  });

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
  const [themeColor, setThemeColor] = useState('#4f46e5'); // Default primary color
  const [password, setPassword] = useState('');
  const [branding, setBranding] = useState({ name: '', logoUrl: '' });

  // Generated gift card data
  const [giftCardUrl, setGiftCardUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Fetch available media
        const mediaResponse = await getMedia(folderId);
        const mediaList = mediaResponse.data;
        setAvailableMedia(mediaList);

        // 2. Fetch Folder Settings
        try {
          const settingsResponse = await getFolderSettings(folderId);
          if (settingsResponse.success) {
            setFolderSettings(prev => ({
              ...prev,
              ...settingsResponse.data,
              watermarkSettings: {
                ...prev.watermarkSettings,
                ...(settingsResponse.data.watermarkSettings || {})
              }
            }));
          }
        } catch (error) {
          console.error('Error fetching folder settings:', error);
        }

        // 3. If edit mode, fetch gift card details
        if (isEditMode) {
          const cardsResponse = await getAlbumGiftCards(folderId);
          const card = cardsResponse.data.data.find(c => c._id === giftCardId);

          if (card) {
            setTitle(card.title);
            setMessage(card.message);
            setThemeColor(card.themeColor);
            setGiftCardUrl(`${window.location.origin}/view/${card.uniqueSlug}`);
            if (card.branding) {
              setBranding(card.branding);
            }

            // Set template ID and Data if exists
            if (card.template) {
              const tmplId = typeof card.template === 'object' ? card.template._id : card.template;
              setSelectedTemplateId(tmplId);

              // If template is populated, set data directly
              if (typeof card.template === 'object' && card.template.layoutSlots) {
                setTemplateData(card.template);
              } else {
                // Otherwise fetch it
                try {
                  const tmplRes = await getTemplateById(tmplId);
                  setTemplateData(tmplRes.data.data);
                } catch (e) {
                  console.error('Failed to fetch linked template details', e);
                }
              }
            }

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
        } else if (selectedTemplateId) {
          // 4. If template mode, fetch template details
          try {
            const templateResponse = await getTemplateById(selectedTemplateId);
            const template = templateResponse.data.data;
            setTemplateData(template);

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
  }, [folderId, giftCardId, navigate, isEditMode, selectedTemplateId]);

  const handleUpdateFolderSettings = async (newSettings) => {
    try {
      setFolderSettings(newSettings);
      // Debounce or save immediately? Let's save immediately for now but maybe show a toast
      await updateFolderSettings(folderId, newSettings);
      toast.success('Album settings updated');
    } catch (error) {
      console.error('Error updating folder settings:', error);
      toast.error('Failed to update album settings');
    }
  };

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
      toast.error('You must have at least one block');
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

  const handleLogoUpload = async (file) => {
    try {
      const url = await uploadFileToCloudinary(file);
      setBranding(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error('Failed to upload logo');
    }
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
        templateId: selectedTemplateId, // Include template ID
        branding,
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

      if (qrCodeId) {
        payload.qrCodeId = qrCodeId;
      }

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left: Control Sidebar */}
        <div
          className={`border-r border-slate-200 bg-white order-2 lg:order-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-full lg:w-20' : 'w-full lg:w-[35%]'
            }`}
        >
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
            branding={branding}
            setBranding={setBranding}
            onUploadLogo={handleLogoUpload}
            folderSettings={folderSettings}
            onUpdateFolderSettings={handleUpdateFolderSettings}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* Right: Live Preview */}
        <div
          className={`order-1 lg:order-2 bg-slate-100 sticky top-0 z-10 lg:static h-[50vh] lg:h-auto overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-full lg:w-[calc(100%-5rem)]' : 'w-full lg:w-[65%]'
            }`}
        >
          <LivePreview
            title={title}
            message={message}
            themeColor={themeColor}
            contentBlocks={contentBlocks}
            template={templateData}
            branding={branding}
          />
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4 text-primary">
                <FiCheck className="h-12 w-12 sm:h-16 sm:w-16" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                🎉 Success!
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Your gift card is ready to share
              </p>
            </div>

            {/* QR Code */}
            <QRCodeGenerator value={giftCardUrl} themeColor={themeColor} />

            {/* URL Display */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={giftCardUrl}
                  readOnly
                  className="flex-1 bg-transparent text-slate-700 text-sm focus:outline-none"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FiCopy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1"
              >
                Continue Editing
              </Button>
              <Button
                onClick={() => navigate(`/gallery/${folderId}`)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardBuilder;
