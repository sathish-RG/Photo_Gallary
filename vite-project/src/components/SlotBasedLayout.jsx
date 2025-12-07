import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * SlotBasedLayout Component
 * Renders media items using template-defined layout slots
 * Each slot has specific position, size, and styling from the admin template
 */
const SlotBasedLayout = ({ layoutSlots = [], mediaItems = [], themeColor = '#ec4899', baseHeight = 600, selectedMedia = new Set(), onSelect = () => { }, allowSelection = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const BASE_WIDTH = 800; // Standard design width
  const BASE_HEIGHT = baseHeight; // Dynamic design height

  // Helper to get media URL from different data structures
  const getMediaUrl = (item) => {
    if (!item) return null;
    // Builder format (mediaData populated in frontend)
    if (item.mediaData && item.mediaData.filePath) return item.mediaData.filePath;
    // Viewer format (mediaId populated from backend)
    if (item.mediaId && item.mediaId.filePath) return item.mediaId.filePath;
    // Direct format
    if (item.filePath) return item.filePath;
    if (item.url) return item.url;
    return null;
  };

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        // Limit scale to 1 (don't scale up, only down)
        const newScale = Math.min(parentWidth / BASE_WIDTH, 1);
        setScale(newScale);
      }
    };

    // Initial calculation
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!layoutSlots || layoutSlots.length === 0) {
    // Fallback to grid if no slots defined
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mediaItems.map((item, index) => {
          const url = getMediaUrl(item);
          if (!url) return null;
          const mediaId = item.mediaId?._id || item._id;
          const isSelected = selectedMedia.has(mediaId);

          return (
            <div key={item._id || `item-${index}`} className="relative group">
              <img
                src={url}
                alt={item.caption || `Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
              {/* Selection Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                {allowSelection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(mediaId);
                    }}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${isSelected ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
                  >
                    <svg className="w-6 h-6" fill={isSelected ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Calculate container height based on scale
  const containerHeight = BASE_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden mx-auto"
      style={{ height: `${containerHeight}px` }}
    >
      <div
        style={{
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          position: 'absolute',
          top: 0,
          left: '50%',
        }}
      >
        {/* Render each slot with its assigned media */}
        {layoutSlots.map((slot, index) => {
          // Get the media item for this slot (by index for now)
          const mediaItem = mediaItems[index];
          const mediaUrl = getMediaUrl(mediaItem);

          if (!mediaItem || !mediaUrl) {
            // Empty slot - show placeholder
            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                style={{
                  left: `${slot.position.x}px`,
                  top: `${slot.position.y}px`,
                  width: `${slot.position.width}px`,
                  height: `${slot.position.height}px`,
                  borderRadius: slot.style?.borderRadius || '0px',
                }}
              >
                <span className="text-gray-400 text-sm">
                  {slot.label || `Slot ${index + 1}`}
                </span>
              </motion.div>
            );
          }

          const mediaId = mediaItem.mediaId?._id || mediaItem._id;
          const isSelected = selectedMedia.has(mediaId);

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute overflow-hidden group"
              style={{
                left: `${slot.position.x}px`,
                top: `${slot.position.y}px`,
                width: `${slot.position.width}px`,
                height: `${slot.position.height}px`,
                borderRadius: slot.style?.borderRadius || '0px',
                border: slot.style?.border || 'none',
              }}
            >
              {/* Media Content */}
              {slot.type === 'image' && (
                <img
                  src={mediaUrl}
                  alt={mediaItem.caption || slot.label || `Photo ${index + 1}`}
                  className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                  style={{
                    objectFit: slot.style?.objectFit || 'cover',
                    filter: slot.style?.filter || 'none',
                  }}
                />
              )}

              {slot.type === 'video' && mediaItem.type === 'video' && (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-full"
                  style={{
                    objectFit: slot.style?.objectFit || 'cover',
                    filter: slot.style?.filter || 'none',
                  }}
                />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                {/* Selection Button */}
                {allowSelection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(mediaId);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 ${isSelected ? 'bg-pink-500 text-white opacity-100' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
                  >
                    <svg className="w-5 h-5" fill={isSelected ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}

                {mediaItem.caption && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg mt-8">
                    <p className="text-sm text-gray-800 font-medium">
                      {mediaItem.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Slot label (visible on hover) */}
              {slot.label && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full shadow-md text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {slot.label}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotBasedLayout;
