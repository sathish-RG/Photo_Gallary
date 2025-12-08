import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiImage, FiSearch } from 'react-icons/fi';
import { getMedia } from '../api/mediaApi';
import toast from 'react-hot-toast';

/**
 * MediaPickerModal Component
 * Reusable modal for selecting photos from user's media library
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSelect - Callback with selected media [{id, url, caption}]
 * @param {boolean} multiSelect - Allow multi-selection (default: false)
 * @param {array} selectedIds - Pre-selected media IDs
 */
const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  selectedIds = [],
}) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(selectedIds);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
    // Set selected state when modal opens, not in dependency array
    setSelected(selectedIds);
  }, [isOpen]); // Only re-run when modal opens/closes

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await getMedia(); // Fetch all user media
      // Filter only images and limit initial load
      const images = response.data.filter(item => item.fileType === 'image');
      // Limit to first 50 to prevent resource issues
      setMedia(images.slice(0, 50));

      if (images.length > 50) {
        console.log(`Loaded 50 of ${images.length} images. Pagination can be added if needed.`);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item =>
    item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery
  );

  const handleToggleSelect = (mediaId) => {
    if (multiSelect) {
      setSelected(prev =>
        prev.includes(mediaId)
          ? prev.filter(id => id !== mediaId)
          : [...prev, mediaId]
      );
    } else {
      setSelected([mediaId]);
    }
  };

  const handleConfirm = () => {
    const selectedMedia = media
      .filter(item => selected.includes(item._id))
      .map(item => ({
        id: item._id,
        url: item.filePath,
        caption: item.caption || '',
        fileType: item.fileType,
      }));
    onSelect(selectedMedia);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Select from Library</h2>
            <p className="text-sm text-slate-500 mt-1">
              {multiSelect ? 'Select multiple images' : 'Select an image'}
              {selected.length > 0 && ` (${selected.length} selected)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caption..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20">
              <FiImage className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                {searchQuery ? 'No images found' : 'No images in library'}
              </h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try a different search term' : 'Upload some images to your albums first'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => {
                const isSelected = selected.includes(item._id);
                return (
                  <div
                    key={item._id}
                    onClick={() => handleToggleSelect(item._id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${isSelected
                      ? 'ring-4 ring-indigo-500 scale-95'
                      : 'hover:ring-2 hover:ring-slate-300'
                      }`}
                  >
                    <img
                      src={item.filePath}
                      alt={item.caption || 'Image'}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <div className="bg-indigo-600 rounded-full p-2">
                          <FiCheck className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                        {item.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select {selected.length > 0 && `(${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
