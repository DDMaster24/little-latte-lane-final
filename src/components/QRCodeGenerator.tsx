/**
 * Permanent QR Code Generator for PWA Installation
 * Creates a fixed, unchangeable QR code for printing and physical deployment
 */

'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, ExternalLink, Check } from 'lucide-react';

// PERMANENT INSTALL URL - This never changes!
const PERMANENT_INSTALL_URL = 'https://littlelattelane.co.za/install';

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

      const qrCodeUrl = await QRCode.toDataURL(PERMANENT_INSTALL_URL, qrCodeOptions);
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
    link.download = 'little-latte-lane-install-qr-code.png';
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
          <title>Little Latte Lane - Install QR Code</title>
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
            <div class="subtitle">Scan to Install Mobile App</div>
            <img src="${qrCodeDataUrl}" alt="QR Code for Little Latte Lane App" class="qr-code" />
            <div class="url">${PERMANENT_INSTALL_URL}</div>
            <div class="instructions">
              <strong>Instructions:</strong><br>
              1. Open your phone's camera app<br>
              2. Point it at this QR code<br>
              3. Tap the notification to install<br>
              4. Or visit the URL above manually
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

  const openInstallPage = () => {
    window.open(PERMANENT_INSTALL_URL, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 to-darkBg border-neonCyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neonCyan">
            <Check className="w-5 h-5" />
            Permanent PWA Install QR Code
          </CardTitle>
          <CardDescription>
            Fixed QR code for printing and physical deployment. This QR code never changes!
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
            <p className="text-sm text-gray-400 mb-2">Permanent Install URL:</p>
            <div className="bg-gray-800 px-4 py-2 rounded font-mono text-sm text-neonCyan break-all">
              {PERMANENT_INSTALL_URL}
            </div>
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
              onClick={openInstallPage}
              variant="outline"
              className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Install Page
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-gradient-to-r from-neonPink/20 to-neonCyan/20 border border-neonPink/30 rounded-lg p-4">
            <h4 className="font-bold text-neonPink mb-2">🔒 PERMANENT QR CODE</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• This QR code URL never changes - safe for printing</li>
              <li>• High error correction (Level H) for damaged/worn prints</li>
              <li>• Works on all devices and browsers</li>
              <li>• Direct install page with manual instructions</li>
              <li>• 512x512 resolution optimal for printing</li>
            </ul>
          </div>

          {/* Backup Instructions */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <h4 className="font-bold text-neonGreen mb-2">� BACKUP PLAN</h4>
            <p className="text-sm text-gray-300 mb-2">
              If QR scanning fails, users can manually visit:
            </p>
            <div className="bg-black px-3 py-2 rounded font-mono text-xs text-neonCyan">
              littlelattelane.co.za/install
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This page provides platform-specific installation instructions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Legacy export for backward compatibility
export default QRCodeGenerator;
