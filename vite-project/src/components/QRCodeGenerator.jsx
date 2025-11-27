import { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ value, themeColor = '#ec4899' }) => {
  const [shape, setShape] = useState('rounded');
  const [color, setColor] = useState(themeColor);
  const qrRef = useRef(null);

  // QR code rendering options based on shape
  const getQRStyle = () => {
    switch (shape) {
      case 'square':
        return {
          marginSize: 4,
          imageSettings: {
            excavate: true,
          }
        };
      case 'dots':
        return {
          marginSize: 4,
          imageSettings: {
            excavate: true,
          }
        };
      case 'rounded':
      default:
        return {
          marginSize: 4,
          imageSettings: {
            excavate: true,
          }
        };
    }
  };

  const handleDownload = (extension) => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Apply shape styling to canvas
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Create a new canvas for download
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;
    const downloadCtx = downloadCanvas.getContext('2d');

    // Fill white background
    downloadCtx.fillStyle = '#ffffff';
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Draw the QR code
    downloadCtx.putImageData(imageData, 0, 0);

    // Convert to blob and download
    downloadCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `gift-card-qr.${extension}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, extension === 'png' ? 'image/png' : 'image/jpeg');
  };

  return (
    <div className="space-y-4">
      {/* QR Code Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mx-auto flex justify-center" ref={qrRef}>
        <div style={{
          padding: '20px',
          borderRadius: shape === 'rounded' ? '20px' : shape === 'dots' ? '50%' : '0',
          overflow: 'hidden',
          display: 'inline-block'
        }}>
          <QRCodeCanvas
            value={value}
            size={260}
            level="H"
            fgColor={color}
            bgColor="#ffffff"
            {...getQRStyle()}
          />
        </div>
      </div>

      {/* Customization Controls */}
      <div className="space-y-3">
        {/* Shape Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">QR Code Style</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShape('square')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${shape === 'square'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Square
            </button>
            <button
              onClick={() => setShape('dots')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${shape === 'dots'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Circular
            </button>
            <button
              onClick={() => setShape('rounded')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${shape === 'rounded'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Rounded
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">QR Code Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Download Buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Download QR Code</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDownload('png')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('jpeg')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              Download JPEG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
