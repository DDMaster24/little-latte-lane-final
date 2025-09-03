'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  cropLeft: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
}

interface SimpleImageEditorProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  onClose: () => void;
  elementType?: 'icon' | 'background' | 'image';
  elementId?: string;
}

function isEmoji(str: string): boolean {
  const emojiRegex = /^[\u{1F300}-\u{1F9FF}]$/u;
  return emojiRegex.test(str);
}

export default function SimpleImageEditor({
  currentImageUrl = '',
  onImageChange,
  onClose,
  elementType = 'image',
  elementId
}: SimpleImageEditorProps) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [transform, setTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    cropLeft: 0,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Use specific folder based on element type
      if (elementType === 'icon' || elementId?.includes('logo')) {
        formData.append('folder', 'headers'); // Use headers folder for logos
      } else {
        formData.append('folder', 'uploads'); // Default for other images
      }

      const { uploadImage } = await import('@/app/admin/actions');
      const result = await uploadImage(formData);

      if (result.success && result.data) {
        setPreview(result.data.url);
        // Reset transform when new image is loaded
        setTransform({
          x: 0,
          y: 0,
          scale: 1,
          cropLeft: 0,
          cropTop: 0,
          cropRight: 0,
          cropBottom: 0
        });
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [elementType, elementId]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle file input
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Mouse handlers for dragging image
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!preview || isEmoji(preview)) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    });
  }, [preview, transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setTransform(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  // Crop handle mouse handlers
  const handleCropMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    e.preventDefault();
    const container = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convert to percentage of container
    const deltaXPercent = (deltaX / container.width) * 100;
    const deltaYPercent = (deltaY / container.height) * 100;
    
    setTransform(prev => {
      const newTransform = { ...prev };
      
      switch (isResizing) {
        case 'top-left':
          newTransform.cropLeft = Math.max(0, Math.min(prev.cropLeft + deltaXPercent, 80));
          newTransform.cropTop = Math.max(0, Math.min(prev.cropTop + deltaYPercent, 80));
          break;
        case 'top-right':
          newTransform.cropRight = Math.max(0, Math.min(prev.cropRight - deltaXPercent, 80));
          newTransform.cropTop = Math.max(0, Math.min(prev.cropTop + deltaYPercent, 80));
          break;
        case 'bottom-left':
          newTransform.cropLeft = Math.max(0, Math.min(prev.cropLeft + deltaXPercent, 80));
          newTransform.cropBottom = Math.max(0, Math.min(prev.cropBottom - deltaYPercent, 80));
          break;
        case 'bottom-right':
          newTransform.cropRight = Math.max(0, Math.min(prev.cropRight - deltaXPercent, 80));
          newTransform.cropBottom = Math.max(0, Math.min(prev.cropBottom - deltaYPercent, 80));
          break;
      }
      
      return newTransform;
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isResizing, dragStart]);

  // Handle apply
  const handleApply = useCallback(() => {
    if (!preview) return;
    onImageChange(preview);
    onClose();
  }, [preview, onImageChange, onClose]);

  // Handle remove
  const handleRemove = useCallback(() => {
    setPreview('');
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-[95vw] h-[95vh] max-w-6xl flex flex-col border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Simple Image Editor</h2>
            <p className="text-gray-400">Editing: {elementType}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Upload */}
          <div className="w-80 p-6 border-r border-gray-600 bg-gray-750">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Image</h3>
            
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center hover:border-neonCyan transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">Drag and drop your image here</p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-500 text-gray-300"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Supports PNG, JPG, GIF, WebP up to 10MB
              </p>
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Instructions */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">Instructions:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Align your image within the dashed frame</li>
                <li>• Click and drag the image to position it</li>
                <li>• Use scroll wheel to zoom in/out</li>
                <li>• Drag the corner handles to crop</li>
                <li>• Click &quot;Apply Image&quot; when satisfied</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Preview & Edit */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-750 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-white">Preview & Edit</h3>
            </div>

            {/* Preview Container with Static Frame */}
            <div 
              ref={containerRef}
              className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={isDragging ? handleMouseMove : (isResizing ? handleCropMouseMove : undefined)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={(e) => {
                if (!preview || isEmoji(preview)) return;
                e.preventDefault();
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                setTransform(prev => ({
                  ...prev,
                  scale: Math.max(0.1, Math.min(5, prev.scale * delta))
                }));
              }}
            >
              {/* Static Frame Overlay - Shows Target Container Size */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {elementId === 'header-logo' && (
                  <div className="relative">
                    {/* Frame outline showing target logo dimensions */}
                    <div 
                      className="border-2 border-dashed border-neonCyan bg-transparent"
                      style={{
                        width: '128px',  // lg:w-32 = 128px (largest responsive size)
                        height: '128px', // lg:h-32 = 128px 
                        borderRadius: '8px' // rounded-lg
                      }}
                    >
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-neonCyan"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-neonCyan"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-neonCyan"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-neonCyan"></div>
                    </div>
                    {/* Size label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-neonCyan font-mono bg-gray-800 px-2 py-1 rounded">
                      128×128px (Logo Container)
                    </div>
                  </div>
                )}
                {(elementType === 'background' || elementType === 'image') && (
                  <div className="relative">
                    {/* Frame for other image types */}
                    <div 
                      className="border-2 border-dashed border-neonPink bg-transparent"
                      style={{
                        width: '300px',  // Standard image container
                        height: '200px'  // Standard aspect ratio
                      }}
                    >
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-neonPink"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-neonPink"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-neonPink"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-neonPink"></div>
                    </div>
                    {/* Size label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-neonPink font-mono bg-gray-800 px-2 py-1 rounded">
                      300×200px (Image Container)
                    </div>
                  </div>
                )}
              </div>

              {preview ? (
                isEmoji(preview) ? (
                  <div 
                    className="text-6xl transform transition-transform"
                    style={{
                      transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`
                    }}
                  >
                    {preview}
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className="relative transform transition-transform select-none"
                      style={{
                        transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
                        clipPath: `inset(${transform.cropTop}% ${transform.cropRight}% ${transform.cropBottom}% ${transform.cropLeft}%)`
                      }}
                    >
                      <Image
                        ref={imageRef}
                        src={preview}
                        alt="Preview"
                        width={500}
                        height={400}
                        className="object-contain max-w-[500px] max-h-[400px]"
                        onError={() => setPreview('')}
                        draggable={false}
                      />
                    </div>

                    {/* Crop Handles */}
                    {preview && !isEmoji(preview) && (
                      <>
                        {/* Top-left handle */}
                        <div
                          className="absolute w-4 h-4 bg-neonCyan border-2 border-white rounded-full cursor-nw-resize z-10"
                          style={{
                            left: `${transform.cropLeft}%`,
                            top: `${transform.cropTop}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onMouseDown={(e) => handleCropMouseDown(e, 'top-left')}
                        />
                        
                        {/* Top-right handle */}
                        <div
                          className="absolute w-4 h-4 bg-neonCyan border-2 border-white rounded-full cursor-ne-resize z-10"
                          style={{
                            right: `${transform.cropRight}%`,
                            top: `${transform.cropTop}%`,
                            transform: 'translate(50%, -50%)'
                          }}
                          onMouseDown={(e) => handleCropMouseDown(e, 'top-right')}
                        />
                        
                        {/* Bottom-left handle */}
                        <div
                          className="absolute w-4 h-4 bg-neonCyan border-2 border-white rounded-full cursor-sw-resize z-10"
                          style={{
                            left: `${transform.cropLeft}%`,
                            bottom: `${transform.cropBottom}%`,
                            transform: 'translate(-50%, 50%)'
                          }}
                          onMouseDown={(e) => handleCropMouseDown(e, 'bottom-left')}
                        />
                        
                        {/* Bottom-right handle */}
                        <div
                          className="absolute w-4 h-4 bg-neonCyan border-2 border-white rounded-full cursor-se-resize z-10"
                          style={{
                            right: `${transform.cropRight}%`,
                            bottom: `${transform.cropBottom}%`,
                            transform: 'translate(50%, 50%)'
                          }}
                          onMouseDown={(e) => handleCropMouseDown(e, 'bottom-right')}
                        />

                        {/* Crop border lines */}
                        <div
                          className="absolute border-2 border-dashed border-neonCyan pointer-events-none"
                          style={{
                            left: `${transform.cropLeft}%`,
                            top: `${transform.cropTop}%`,
                            right: `${transform.cropRight}%`,
                            bottom: `${transform.cropBottom}%`
                          }}
                        />
                      </>
                    )}
                  </div>
                )
              ) : (
                <div className="text-gray-500 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl mb-2">No image selected</p>
                  <p className="text-sm">Upload an image to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 bg-gray-750 border-t border-gray-600">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-2" />
            Remove Image
          </Button>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!preview || uploading}
              className="bg-neonCyan text-black hover:bg-neonCyan/80 font-medium"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
