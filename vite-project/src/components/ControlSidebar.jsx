import { useState } from 'react';

const predefinedColors = [
  '#ec4899', '#8b5cf6', '#3b82f6', '#10b981',
  '#f59e0b', '#ef4444', '#6b7280', '#111827'
];

/**
 * ControlSidebar Component
 * Left sidebar with accordion sections for gift card customization
 */
const ControlSidebar = ({
  title,
  setTitle,
  message,
  setMessage,
  themeColor,
  setThemeColor,
  password,
  setPassword,
  contentBlocks,
  activeBlockId,
  setActiveBlockId,
  availableMedia,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlockLayout,
  onReorderBlocks,
  onToggleMedia,
  onRemoveMediaFromBlock,
  onMoveMediaInBlock,
  onSave,
  saving,
  isEditMode,
  branding,
  setBranding,
  onUploadLogo,
  folderSettings,
  onUpdateFolderSettings,
  isCollapsed,
  onToggleCollapse
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [openSection, setOpenSection] = useState('content'); // Default open content

  const activeBlock = contentBlocks.find(b => b.blockId === activeBlockId);

  const isMediaSelectedInActiveBlock = (mediaId) => {
    return activeBlock?.mediaItems.some(item => item.mediaId === mediaId);
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  if (isCollapsed) {
    return (
      <div className="h-full bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 overflow-y-auto w-20">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors mb-4"
          title="Expand Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('basics'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Basics">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('styling'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Styling">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('content'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Layout & Content">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('branding'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Branding">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('settings'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Album Settings">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button onClick={() => { onToggleCollapse(); toggleSection('security'); }} className="p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors" title="Security">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col relative">
      {/* Toggle Button Header */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Collapse Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-12">
        {/* Accordion Sections */}
        <div className="space-y-4">
          {/* BASICS Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('basics')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Basics</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'basics' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'basics' && (
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Happy Birthday!"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a heartfelt message..."
                    maxLength={1000}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length} / 1000 characters</p>
                </div>
              </div>
            )}
          </div>

          {/* STYLING Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('styling')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Styling</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'styling' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'styling' && (
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#ec4899"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${themeColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LAYOUT & CONTENT Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('content')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Layout & Content</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'content' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'content' && (
              <div className="p-4 bg-white space-y-6">

                {/* Block Management */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Blocks</label>
                    <button
                      onClick={onAddBlock}
                      className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded hover:bg-pink-200 transition-colors"
                    >
                      + Add Block
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {contentBlocks.map((block, index) => (
                      <div
                        key={block.blockId}
                        onClick={() => setActiveBlockId(block.blockId)}
                        className={`flex-shrink-0 cursor-pointer px-3 py-2 rounded-lg border-2 transition-all ${activeBlockId === block.blockId
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Block {index + 1}</span>
                          {contentBlocks.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveBlock(block.blockId);
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {block.blockLayoutType.replace('grid-', '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activeBlock && (
                  <div className="border-t border-gray-100 pt-4">
                    {/* Block Layout Selector */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Block Layout</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'grid-standard', label: 'Grid', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                          { id: 'grid-collage', label: 'Collage', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z' },
                          { id: 'slideshow', label: 'Slideshow', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' }
                        ].map((layout) => (
                          <button
                            key={layout.id}
                            onClick={() => onUpdateBlockLayout(activeBlockId, layout.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${activeBlock.blockLayoutType === layout.id
                              ? 'border-pink-500 bg-pink-50 text-pink-600'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={layout.icon} />
                            </svg>
                            <span className="text-xs">{layout.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Available Media */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Media to Block</label>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                        {availableMedia.map((media) => (
                          <div
                            key={media._id}
                            onClick={() => onToggleMedia(media)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${isMediaSelectedInActiveBlock(media._id) ? 'border-pink-500 shadow-md' : 'border-gray-200'
                              }`}
                          >
                            {media.fileType === 'image' && (
                              <img src={media.filePath} alt="" className="w-full h-20 object-cover" />
                            )}
                            {media.fileType === 'video' && (
                              <div className="w-full h-20 bg-gray-900 flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            {isMediaSelectedInActiveBlock(media._id) && (
                              <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Media List (Reorder) */}
                    {activeBlock.mediaItems.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Block Media (Reorder)</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activeBlock.mediaItems.map((item, index) => (
                            <div key={item.mediaId} className="flex items-center gap-2 bg-pink-50 p-2 rounded-lg">
                              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                {item.type === 'image' && (
                                  <img src={item.mediaData.filePath} alt="" className="w-full h-full object-cover" />
                                )}
                                {item.type === 'video' && (
                                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">Item {index + 1}</p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onMoveMediaInBlock(activeBlockId, index, index - 1)}
                                  disabled={index === 0}
                                  className="p-1 bg-white rounded hover:bg-pink-100 disabled:opacity-30"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => onMoveMediaInBlock(activeBlockId, index, index + 1)}
                                  disabled={index === activeBlock.mediaItems.length - 1}
                                  className="p-1 bg-white rounded hover:bg-pink-100 disabled:opacity-30"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => onRemoveMediaFromBlock(activeBlockId, item.mediaId)}
                                  className="p-1 bg-white rounded hover:bg-red-100 text-red-500"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BRANDING Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('branding')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">White Label Branding</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'branding' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'branding' && (
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={branding?.name || ''}
                    onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                    placeholder="Your Brand Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
                  {branding?.logoUrl && (
                    <div className="mb-2 relative group w-fit">
                      <img src={branding.logoUrl} alt="Brand Logo" className="h-12 object-contain border border-gray-200 rounded p-1" />
                      <button
                        onClick={() => setBranding({ ...branding, logoUrl: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        onUploadLogo(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ALBUM SETTINGS Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Album Settings</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'settings' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'settings' && (
              <div className="p-4 space-y-6 bg-white">
                {!folderSettings ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading settings...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-4">
                      These settings apply to the entire album and all gift cards created from it.
                    </div>

                    {/* Watermark Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700">Watermark</label>
                        <button
                          onClick={() => onUpdateFolderSettings({
                            ...folderSettings,
                            watermarkSettings: {
                              ...folderSettings.watermarkSettings,
                              enabled: !folderSettings.watermarkSettings?.enabled
                            }
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${folderSettings.watermarkSettings?.enabled ? 'bg-pink-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${folderSettings.watermarkSettings?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {folderSettings.watermarkSettings?.enabled && (
                        <div className="space-y-3 pl-2 border-l-2 border-pink-100 ml-1">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
                            <input
                              type="text"
                              value={folderSettings.watermarkSettings?.text || ''}
                              onChange={(e) => onUpdateFolderSettings({
                                ...folderSettings,
                                watermarkSettings: {
                                  ...folderSettings.watermarkSettings,
                                  text: e.target.value
                                }
                              })}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Opacity ({folderSettings.watermarkSettings?.opacity || 50}%)</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={folderSettings.watermarkSettings?.opacity || 50}
                              onChange={(e) => onUpdateFolderSettings({
                                ...folderSettings,
                                watermarkSettings: {
                                  ...folderSettings.watermarkSettings,
                                  opacity: parseInt(e.target.value)
                                }
                              })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                            <select
                              value={folderSettings.watermarkSettings?.position || 'center'}
                              onChange={(e) => onUpdateFolderSettings({
                                ...folderSettings,
                                watermarkSettings: {
                                  ...folderSettings.watermarkSettings,
                                  position: e.target.value
                                }
                              })}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                            >
                              <option value="center">Center</option>
                              <option value="north">Top</option>
                              <option value="south">Bottom</option>
                              <option value="east">Right</option>
                              <option value="west">Left</option>
                              <option value="north_east">Top Right</option>
                              <option value="north_west">Top Left</option>
                              <option value="south_east">Bottom Right</option>
                              <option value="south_west">Bottom Left</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Allow Downloads */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700 block">Allow Downloads</label>
                        <p className="text-xs text-gray-500">Viewers can download original files</p>
                      </div>
                      <button
                        onClick={() => onUpdateFolderSettings({
                          ...folderSettings,
                          allowDownload: !folderSettings.allowDownload
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${folderSettings.allowDownload ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${folderSettings.allowDownload ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Allow Client Selection */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700 block">Client Selection</label>
                        <p className="text-xs text-gray-500">Viewers can select favorites</p>
                      </div>
                      <button
                        onClick={() => onUpdateFolderSettings({
                          ...folderSettings,
                          allowClientSelection: !folderSettings.allowClientSelection
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${folderSettings.allowClientSelection ? 'bg-pink-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${folderSettings.allowClientSelection ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SECURITY Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('security')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Security</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'security' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'security' && (
              <div className="p-4 bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set password to protect..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank for no password protection</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onSave}
              disabled={saving || !title.trim() || !message.trim() || contentBlocks.every(b => b.mediaItems.length === 0)}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
            >
              {saving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Gift Card' : 'Save & Generate Link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlSidebar;
