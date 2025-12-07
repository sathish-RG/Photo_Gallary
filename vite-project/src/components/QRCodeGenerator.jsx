import { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ value, themeColor = '#ec4899' }) => {
  const [shape, setShape] = useState('square');
  const [color, setColor] = useState(themeColor);
  const qrRef = useRef(null);
  const canvasRef = useRef(null);

  // Apply custom styling to QR code based on shape
  useEffect(() => {
    const applyCustomStyle = () => {
      const qrCanvas = qrRef.current?.querySelector('canvas');
      const customCanvas = canvasRef.current;

      if (!qrCanvas || !customCanvas) {
        return;
      }

      try {
        const ctx = qrCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
        const data = imageData.data;

        // Check if canvas is empty (all white or transparent)
        let hasBlack = false;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < 128) { // Check Red channel
            hasBlack = true;
            break;
          }
        }

        if (!hasBlack) {
          // Canvas not ready yet
          return;
        }

        // Set custom canvas size
        customCanvas.width = qrCanvas.width;
        customCanvas.height = qrCanvas.height;
        const customCtx = customCanvas.getContext('2d');

        // Add roundRect polyfill if not available
        if (!customCtx.roundRect) {
          customCtx.roundRect = function (x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
          };
        }

        // Fill white background
        customCtx.fillStyle = '#ffffff';
        customCtx.fillRect(0, 0, customCanvas.width, customCanvas.height);

        // 1. Robustly detect module size and start offset
        // Scan for the first black pixel (top-left of finder pattern)
        let startX = 0;
        let startY = 0;
        let finderWidth = 0;
        let found = false;

        for (let y = 0; y < qrCanvas.height; y++) {
          for (let x = 0; x < qrCanvas.width; x++) {
            const i = (y * qrCanvas.width + x) * 4;
            if (data[i] < 128) {
              // Found top-left black pixel
              startX = x;
              startY = y;

              // Measure width of this black run (finder pattern width is 7 modules)
              let run = 0;
              for (let k = x; k < qrCanvas.width; k++) {
                const ki = (y * qrCanvas.width + k) * 4;
                if (data[ki] < 128) run++;
                else break;
              }
              finderWidth = run;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        // Calculate module size
        // Finder pattern is 7 modules wide
        const moduleSize = found ? Math.max(1, Math.round(finderWidth / 7)) : Math.floor(qrCanvas.width / 33);

        // If detection failed, default to 0 offset
        if (!found) {
          startX = 0;
          startY = 0;
        }

        // Draw custom styled QR code
        // We iterate based on the detected grid
        for (let y = startY; y < qrCanvas.height; y += moduleSize) {
          for (let x = startX; x < qrCanvas.width; x += moduleSize) {
            // Sample from the CENTER of the module
            const centerX = Math.min(x + Math.floor(moduleSize / 2), qrCanvas.width - 1);
            const centerY = Math.min(y + Math.floor(moduleSize / 2), qrCanvas.height - 1);

            const index = (centerY * qrCanvas.width + centerX) * 4;
            const isBlack = data[index] < 128;

            if (isBlack) {
              customCtx.fillStyle = color;

              // Adjust size slightly to avoid gaps
              const drawSize = moduleSize;

              if (shape === 'dots') {
                // Circular dots
                customCtx.beginPath();
                customCtx.arc(
                  x + moduleSize / 2,
                  y + moduleSize / 2,
                  moduleSize / 2.2,
                  0,
                  Math.PI * 2
                );
                customCtx.fill();
              } else if (shape === 'rounded') {
                // Rounded squares
                const radius = moduleSize / 3;
                customCtx.roundRect(x, y, drawSize, drawSize, radius);
                customCtx.fill();
              } else {
                // Square
                customCtx.fillRect(x, y, drawSize, drawSize);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error rendering QR code:', error);
      }
    };

    // Try multiple times to ensure QR code is rendered
    const timers = [
      setTimeout(applyCustomStyle, 50),
      setTimeout(applyCustomStyle, 150),
      setTimeout(applyCustomStyle, 300),
      setTimeout(applyCustomStyle, 500),
      setTimeout(applyCustomStyle, 1000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [shape, color, value]);

  const handleDownload = (extension) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
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
      <div className="bg-white p-6 rounded-2xl shadow-lg mx-auto flex justify-center">
        <div className="relative">
          {/* Hidden original QR code for data extraction */}
          <div ref={qrRef} style={{ position: 'absolute', left: '-9999px' }}>
            <QRCodeCanvas
              value={value}
              size={260}
              level="H"
              fgColor={color}
              bgColor="#ffffff"
            />
          </div>
          {/* Custom styled QR code */}
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: shape === 'rounded' ? '20px' : '0',
              display: 'block',
              maxWidth: '260px',
              height: 'auto'
            }}
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
