
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlotBasedLayout from './SlotBasedLayout';

const Slideshow = ({ mediaItems }) => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  if (mediaItems.length === 0) return null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {mediaItems[index].type === 'image' ? (
            <img
              src={mediaItems[index].mediaData.filePath}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : mediaItems[index].type === 'video' ? (
            <video
              src={mediaItems[index].mediaData.filePath}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <audio src={mediaItems[index].mediaData.filePath} controls />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {mediaItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            →
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {mediaItems.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * LivePreview Component
 * Right side preview showing responsive device frames with real-time gift card preview
 */
const LivePreview = ({ title, message, themeColor, contentBlocks = [], template = null, branding = null }) => {
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile', 'tablet', 'desktop'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Device configurations
  const deviceConfig = {
    mobile: {
      width: 'w-[390px]',
      height: 'h-[844px]',
      hasFrame: true,
      hasNotch: true,
    },
    tablet: {
      width: 'w-[768px]',
      height: 'h-[1024px]',
      hasFrame: true,
      hasNotch: false,
    },
    desktop: {
      width: 'w-full',
      height: 'h-full',
      hasFrame: false,
      hasNotch: false,
    },
  };

  const config = deviceConfig[viewMode];

  return (
    <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Sidebar - Viewport Selection */}
      <div className="flex flex-col items-center justify-center py-8 px-3 bg-white/80 backdrop-blur-sm border-r border-gray-200">
        <div className="flex flex-col items-center gap-2 bg-gray-100 rounded-lg p-2">
          {/* Mobile Button */}
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-3 rounded-md font-medium transition-all ${viewMode === 'mobile'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            title="Mobile View (390px)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z" />
            </svg>
          </button>

          {/* Tablet Button */}
          <button
            onClick={() => setViewMode('tablet')}
            className={`p-3 rounded-md font-medium transition-all ${viewMode === 'tablet'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            title="Tablet View (768px)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z" />
            </svg>
          </button>

          {/* Desktop Button */}
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-3 rounded-md font-medium transition-all ${viewMode === 'desktop'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            title="Desktop View (Full Width)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-full h-px bg-gray-300 my-1"></div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-3 rounded-md font-medium transition-all ${isFullscreen
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {/* Device Frame Container with Smooth Transition */}
        <div
          className={`relative transition-all duration-500 ease-in-out ${viewMode === 'desktop' ? 'w-full h-full' : ''
            }`}
          style={{
            width: viewMode === 'mobile' ? '390px' : viewMode === 'tablet' ? '768px' : '100%',
            height: viewMode === 'mobile' ? '75vh' : viewMode === 'tablet' ? '80vh' : '100%',
          }}
        >
          {/* Shadow (only for mobile/tablet) */}
          {config.hasFrame && (
            <div className="absolute inset-0 bg-black/20 blur-2xl transform translate-y-4 -z-10"></div>
          )}

          {/* Device Container */}
          <div
            className={`relative h-full transition-all duration-500 ${viewMode === 'mobile'
              ? 'bg-gray-900 rounded-[3rem] p-3 shadow-2xl'
              : viewMode === 'tablet'
                ? 'bg-gray-800 rounded-3xl p-4 shadow-xl'
                : 'bg-transparent'
              }`}
          >
            {/* Phone Notch (mobile only) */}
            {config.hasNotch && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
            )}

            {/* Screen Content */}
            <div
              className={`relative bg-white overflow-hidden h-full ${viewMode === 'mobile'
                ? 'rounded-[2.5rem]'
                : viewMode === 'tablet'
                  ? 'rounded-2xl'
                  : 'rounded-lg shadow-2xl'
                }`}
            >
              {/* Gift Card Content */}
              <div
                className="h-full overflow-y-auto"
                style={{ backgroundColor: themeColor }}
              >
                {/* Branding Header */}
                {branding && (branding.name || branding.logoUrl) && (
                  <div className="flex items-center gap-3 pt-6 pb-2 px-6">
                    {branding.logoUrl && (
                      <img src={branding.logoUrl} alt={branding.name} className="h-10 object-contain" />
                    )}
                    {branding.name && (
                      <p className="text-sm font-semibold uppercase tracking-wider text-white drop-shadow-sm">
                        {branding.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Header Section */}
                <div className={`p-6 text-white ${viewMode === 'desktop' ? 'max-w-4xl mx-auto' : ''}`}>
                  <h1 className={`font-bold mb-3 drop-shadow-lg ${viewMode === 'desktop' ? 'text-5xl' : viewMode === 'tablet' ? 'text-4xl' : 'text-3xl'
                    }`}>
                    {title || 'Your Title Here'}
                  </h1>
                  <p className={`leading-relaxed drop-shadow-md whitespace-pre-wrap ${viewMode === 'desktop' ? 'text-xl' : 'text-lg'
                    }`}>
                    {message || 'Your heartfelt message will appear here...'}
                  </p>
                </div>

                {/* Content Blocks */}
                <div className={`px-4 pb-6 space-y-8 ${viewMode === 'desktop' ? 'max-w-4xl mx-auto' : ''}`}>
                  {contentBlocks.map((block) => (
                    <div key={block.blockId}>
                      {block.mediaItems.length > 0 && (
                        <>
                          {/* Slot-Based Layout */}
                          {template?.layoutSlots && template.layoutSlots.length > 0 ? (
                            <SlotBasedLayout
                              layoutSlots={template.layoutSlots}
                              mediaItems={block.mediaItems}
                              themeColor={themeColor}
                              baseHeight={template.layoutConfig?.canvasHeight || 600}
                            />
                          ) : (
                            <>
                              {/* Slideshow Layout */}
                              {block.blockLayoutType === 'slideshow' && (
                                <Slideshow mediaItems={block.mediaItems} />
                              )}

                              {/* Grid Standard Layout */}
                              {block.blockLayoutType === 'grid-standard' && (
                                <div className="grid grid-cols-2 gap-2">
                                  {block.mediaItems.map((item) => (
                                    <div key={item.mediaId} className="aspect-square rounded-lg overflow-hidden shadow-sm bg-white">
                                      {item.type === 'image' && (
                                        <img src={item.mediaData.filePath} alt="" className="w-full h-full object-cover" />
                                      )}
                                      {item.type === 'video' && (
                                        <video src={item.mediaData.filePath} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Collage Layout (Masonry-ish) */}
                              {block.blockLayoutType === 'grid-collage' && (
                                <div className="columns-2 gap-2 space-y-2">
                                  {block.mediaItems.map((item) => (
                                    <div key={item.mediaId} className="break-inside-avoid rounded-lg overflow-hidden shadow-sm bg-white mb-2">
                                      {item.type === 'image' && (
                                        <img src={item.mediaData.filePath} alt="" className="w-full h-auto block" />
                                      )}
                                      {item.type === 'video' && (
                                        <video src={item.mediaData.filePath} className="w-full h-auto block" />
                                      )}
                                    </div>
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

                {/* Empty State */}
                {contentBlocks.every(b => b.mediaItems.length === 0) && (
                  <div className="flex items-center justify-center h-64 px-6">
                    <div className="text-center text-white/80">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Select media to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Home Indicator (mobile only) */}
            {config.hasNotch && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
