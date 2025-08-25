'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  url?: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ 
  url = 'https://littlelattelane.co.za', 
  size = 256,
  className = ''
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Add PWA installation parameters to URL
  const pwaUrl = `${url}?pwa=true&source=qr`;

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrString = await QRCode.toDataURL(pwaUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeUrl(qrString);
      console.log('✅ QR Code generated for:', pwaUrl);
    } catch (error) {
      console.error('❌ QR Code generation failed:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, size, pwaUrl]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'little-latte-lane-qr-code.png';
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code downloaded!');
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Little Latte Lane - QR Code</title>
            <style>
              body {
                margin: 0;
                padding: 40px;
                text-align: center;
                font-family: Arial, sans-serif;
              }
              .header {
                margin-bottom: 30px;
              }
              .qr-container {
                margin: 20px 0;
              }
              .instructions {
                margin-top: 20px;
                color: #666;
                font-size: 14px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
              }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Little Latte Lane</h1>
              <h2>Scan to Order & Install App</h2>
            </div>
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
            </div>
            <div class="instructions">
              <p><strong>How to use:</strong></p>
              <p>1. Open your phone's camera app</p>
              <p>2. Point at this QR code</p>
              <p>3. Tap the notification to open</p>
              <p>4. Install the app when prompted</p>
              <p>5. Start ordering delicious food!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(pwaUrl);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Customer QR Code
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Customers scan this to visit & install the app
        </p>

        {/* QR Code Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
          {isGenerating ? (
            <div className="animate-spin w-8 h-8 border-4 border-neonCyan border-t-transparent rounded-full mx-auto"></div>
          ) : qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={qrCodeUrl} 
              alt="QR Code for Little Latte Lane" 
              className="mx-auto"
              style={{ width: size, height: size }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No QR Code</span>
            </div>
          )}
        </div>

        {/* URL Display */}
        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 mb-1">QR Code URL:</p>
          <div className="flex items-center justify-between">
            <code className="text-xs text-gray-800 break-all flex-1">
              {pwaUrl}
            </code>
            <button
              onClick={copyUrl}
              className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            className="flex items-center gap-2 px-4 py-2 bg-neonCyan hover:bg-cyan-400 text-black rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download PNG
          </button>

          <button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            className="flex items-center gap-2 px-4 py-2 bg-neonPink hover:bg-pink-400 text-black rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📱 Usage Instructions</h4>
          <div className="text-sm text-blue-700 text-left space-y-1">
            <p>• <strong>For customers:</strong> Scan with phone camera</p>
            <p>• <strong>Marketing:</strong> Print for table tents, posters, business cards</p>
            <p>• <strong>Social media:</strong> Share the image online</p>
            <p>• <strong>Auto-install:</strong> Shows PWA install prompt automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}
