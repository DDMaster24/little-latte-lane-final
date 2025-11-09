/**
 * Permanent QR Code Generator for App Download
 * Creates a fixed, unchangeable QR code for printing and physical deployment
 * Redirects users to the appropriate app store (iOS/Android)
 */

'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, ExternalLink, Check, Smartphone } from 'lucide-react';

// PERMANENT APP DOWNLOAD URL - Uses environment variable or production fallback
const PERMANENT_APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/download`
    : 'https://littlelattelane.co.za/download';

export const QRCodeGenerator = () => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate the permanent QR code on mount
  useEffect(() => {
    generatePermanentQRCode();
  }, []);

  const generatePermanentQRCode = async () => {
    try {
      setIsLoaded(false);
      
      // Generate QR code with optimal settings for printing
      const qrCodeOptions = {
        errorCorrectionLevel: 'H' as const, // High error correction for physical printing
        type: 'image/png' as const,
        quality: 1,
        margin: 2,
        color: {
          dark: '#000000',  // Black for maximum contrast
          light: '#FFFFFF'  // White background
        },
        width: 512,  // High resolution for printing
      };

      const qrCodeUrl = await QRCode.toDataURL(PERMANENT_APP_URL, qrCodeOptions);
      setQrCodeDataUrl(qrCodeUrl);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error generating permanent QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'little-latte-lane-app-download-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeDataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Little Latte Lane - Download App QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              text-align: center;
              background: white;
            }
            .qr-container {
              max-width: 400px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #000;
              border-radius: 10px;
            }
            .qr-code {
              width: 300px;
              height: 300px;
              margin: 20px auto;
              display: block;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .subtitle {
              font-size: 16px;
              margin-bottom: 20px;
              color: #333;
            }
            .url {
              font-size: 14px;
              font-family: monospace;
              background: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              margin-top: 20px;
              word-break: break-all;
            }
            .instructions {
              font-size: 12px;
              color: #666;
              margin-top: 15px;
              text-align: left;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .qr-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="title">Little Latte Lane</div>
            <div class="subtitle">Download Our Mobile App</div>
            <img src="${qrCodeDataUrl}" alt="QR Code for Little Latte Lane App Download" class="qr-code" />
            <div class="url">${PERMANENT_APP_URL}</div>
            <div class="instructions">
              <strong>Instructions:</strong><br>
              1. Open your phone's camera app<br>
              2. Point it at this QR code<br>
              3. Tap the notification<br>
              4. Download from App Store or Google Play
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const openDownloadPage = () => {
    window.open(PERMANENT_APP_URL, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 to-darkBg border-neonCyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neonCyan">
            <Smartphone className="w-5 h-5" />
            App Download QR Code
          </CardTitle>
          <CardDescription>
            Smart QR code that detects device and redirects to App Store or Google Play. Perfect for printing!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              {isLoaded && qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="Permanent QR Code for Little Latte Lane App Installation"
                  width={256}
                  height={256}
                  className="mx-auto"
                  unoptimized // Required for data URLs
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500">Generating QR Code...</span>
                </div>
              )}
            </div>
          </div>

          {/* URL Display */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Smart Download URL:</p>
            <div className="bg-gray-800 px-4 py-2 rounded font-mono text-sm text-neonCyan break-all">
              {PERMANENT_APP_URL}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Automatically detects iOS/Android and redirects to the correct app store
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={downloadQRCode}
              disabled={!isLoaded}
              className="bg-neonBlue hover:bg-blue-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            
            <Button
              onClick={printQRCode}
              disabled={!isLoaded}
              className="bg-neonGreen hover:bg-green-600 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print QR Code
            </Button>
            
            <Button
              onClick={openDownloadPage}
              variant="outline"
              className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Download Page
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-gradient-to-r from-neonPink/20 to-neonCyan/20 border border-neonPink/30 rounded-lg p-4">
            <h4 className="font-bold text-neonPink mb-2">📱 SMART QR CODE</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Automatically detects iOS or Android device</li>
              <li>• Redirects to App Store or Google Play automatically</li>
              <li>• This QR code URL never changes - safe for printing</li>
              <li>• High error correction (Level H) for damaged/worn prints</li>
              <li>• 512x512 resolution optimal for printing</li>
            </ul>
          </div>

          {/* Store Links */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <h4 className="font-bold text-neonGreen mb-2">📲 APP STORE LINKS</h4>
            <p className="text-sm text-gray-300 mb-2">
              Download directly from:
            </p>
            <div className="space-y-2">
              <div className="bg-black px-3 py-2 rounded text-xs">
                <span className="text-gray-400">iOS:</span>{' '}
                <span className="text-neonCyan font-mono">apps.apple.com/za/app/little-latte-lane/id6754854354</span>
              </div>
              <div className="bg-black px-3 py-2 rounded text-xs">
                <span className="text-gray-400">Android:</span>{' '}
                <span className="text-neonCyan font-mono">play.google.com/store/apps/details?id=co.za.littlelattelane.app</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Legacy export for backward compatibility
export default QRCodeGenerator;
