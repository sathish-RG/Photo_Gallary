import { useState } from 'react';

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
  selectedMedia,
  availableMedia,
  onToggleMedia,
  onRemoveMedia,
  onMoveMediaUp,
  onMoveMediaDown,
  onSave,
  saving,
  isEditMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [openSection, setOpenSection] = useState('basics'); // Track which accordion is open

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const predefinedColors = [
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
  ];

  const isMediaSelected = (mediaId) => selectedMedia.some(item => item.mediaId === mediaId);

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200 p-6">
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

        {/* CONTENT Section */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800">Content ({selectedMedia.length})</span>
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
            <div className="p-4 bg-white">
              {/* Available Media */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Media</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableMedia.map((media) => (
                    <div
                      key={media._id}
                      onClick={() => onToggleMedia(media)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${isMediaSelected(media._id) ? 'border-pink-500 shadow-md' : 'border-gray-200'
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
                      {isMediaSelected(media._id) && (
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

              {/* Selected Media List */}
              {selectedMedia.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Media (Reorder)</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedMedia.map((item, index) => (
                      <div key={item.mediaId} className="flex items-center gap-2 bg-pink-50 p-2 rounded-lg">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
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
                            onClick={() => onMoveMediaUp(index)}
                            disabled={index === 0}
                            className="p-1 bg-white rounded hover:bg-pink-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onMoveMediaDown(index)}
                            disabled={index === selectedMedia.length - 1}
                            className="p-1 bg-white rounded hover:bg-pink-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onRemoveMedia(item.mediaId)}
                            className="p-1 bg-white rounded hover:bg-red-100"
                            title="Remove"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onSave}
          disabled={saving || !title.trim() || !message.trim() || selectedMedia.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
        >
          {saving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Gift Card' : 'Save & Generate Link')}
        </button>
      </div>
    </div>
  );
};

export default ControlSidebar;
