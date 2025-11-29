import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * TemplateCanvas Component
 * Visual canvas for creating and editing template layout slots
 */
const TemplateCanvas = ({ slots = [], onSlotsChange, canvasWidth = 800, canvasHeight = 600 }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const addSlot = () => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      type: 'image',
      position: {
        x: 50,
        y: 50,
        width: 200,
        height: 200
      },
      style: {
        borderRadius: '8px',
        border: '2px solid #ec4899',
        objectFit: 'cover',
        filter: 'none'
      },
      constraints: {},
      label: `Slot ${slots.length + 1}`
    };
    onSlotsChange([...slots, newSlot]);
    setSelectedSlot(newSlot.id);
  };

  const updateSlot = (slotId, updates) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId ? { ...slot, ...updates } : slot
    );
    onSlotsChange(updatedSlots);
  };

  const deleteSlot = (slotId) => {
    onSlotsChange(slots.filter(slot => slot.id !== slotId));
    if (selectedSlot === slotId) setSelectedSlot(null);
  };

  const handleSlotMouseDown = (e, slotId) => {
    e.stopPropagation();
    setSelectedSlot(slotId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedSlot || !dragStart) return;

    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    updateSlot(selectedSlot, {
      position: {
        ...slot.position,
        x: Math.max(0, Math.min(canvasWidth - slot.position.width, slot.position.x + deltaX)),
        y: Math.max(0, Math.min(canvasHeight - slot.position.height, slot.position.y + deltaY))
      }
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <div className="flex gap-6">
      {/* Canvas */}
      <div className="flex-1">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Layout Canvas</h3>
          <button
            onClick={addSlot}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
          >
            + Add Slot
          </button>
        </div>

        <div
          className="relative bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden"
          style={{ width: canvasWidth, height: canvasHeight }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#ec4899 1px, transparent 1px), linear-gradient(90deg, #ec4899 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Slots */}
          {slots.map((slot) => (
            <motion.div
              key={slot.id}
              className={`absolute cursor-move transition-all ${selectedSlot === slot.id ? 'ring-4 ring-pink-500 ring-opacity-50' : ''
                }`}
              style={{
                left: slot.position.x,
                top: slot.position.y,
                width: slot.position.width,
                height: slot.position.height,
                borderRadius: slot.style.borderRadius,
                border: slot.style.border,
                backgroundColor: '#f3f4f6',
                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
              onMouseDown={(e) => handleSlotMouseDown(e, slot.id)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-md">
                  <p className="text-sm font-medium text-gray-700">{slot.label || slot.id}</p>
                </div>
              </div>

              {/* Resize Handle */}
              {selectedSlot === slot.id && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 rounded-tl-lg cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // TODO: Implement resize logic
                  }}
                />
              )}
            </motion.div>
          ))}

          {slots.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">Click "Add Slot" to start designing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slot Editor Panel */}
      {selectedSlot && (
        <div className="w-80 bg-white rounded-xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Slot Properties</h3>

          {(() => {
            const slot = slots.find(s => s.id === selectedSlot);
            if (!slot) return null;

            return (
              <div className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={slot.label || ''}
                    onChange={(e) => updateSlot(selectedSlot, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Main Photo"
                  />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
                    <input
                      type="number"
                      value={slot.position.x}
                      onChange={(e) => updateSlot(selectedSlot, {
                        position: { ...slot.position, x: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
                    <input
                      type="number"
                      value={slot.position.y}
                      onChange={(e) => updateSlot(selectedSlot, {
                        position: { ...slot.position, y: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="number"
                      value={slot.position.width}
                      onChange={(e) => updateSlot(selectedSlot, {
                        position: { ...slot.position, width: parseInt(e.target.value) || 100 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="number"
                      value={slot.position.height}
                      onChange={(e) => updateSlot(selectedSlot, {
                        position: { ...slot.position, height: parseInt(e.target.value) || 100 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                  <input
                    type="text"
                    value={slot.style.borderRadius}
                    onChange={(e) => updateSlot(selectedSlot, {
                      style: { ...slot.style, borderRadius: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 8px"
                  />
                </div>

                {/* Object Fit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Object Fit</label>
                  <select
                    value={slot.style.objectFit}
                    onChange={(e) => updateSlot(selectedSlot, {
                      style: { ...slot.style, objectFit: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteSlot(selectedSlot)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md mt-6"
                >
                  Delete Slot
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TemplateCanvas;
