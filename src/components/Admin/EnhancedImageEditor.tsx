'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Link, 
  Image as ImageIcon, 
  X, 
  Check,
  Crop
} from 'lucide-react';
import { uploadImage } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface EnhancedImageEditorProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onClose: () => void;
  elementType?: 'icon' | 'background' | 'image';
  elementId?: string;
}

interface ImageTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function EnhancedImageEditor({ 
  currentImageUrl, 
  onImageChange, 
  onClose,
  elementType = 'image',
  elementId
}: EnhancedImageEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [preview, setPreview] = useState(currentImageUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upload');
  
  // Image editing state
  const [isEditing, setIsEditing] = useState(false);
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Stock images for quick selection
  const stockImages = {
    background: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    ],
    image: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1592329347535-cc1d88c9ce41?w=400&h=300&fit=crop',
    ],
    icon: [
      '☕', '🍕', '🥐', '🧀', '🍔', '🌮', '🥗', '🍝',
      '🍰', '🧁', '🍪', '🥨', '🍩', '🥪', '🍳', '🥯',
      '📱', '💻', '🛒', '🏠', '⭐', '❤️', '✨', '🎯'
    ]
  };

  // Handle file upload with drag and drop
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', elementType === 'icon' ? 'icons' : 'images');

      const result = await uploadImage(formData);

      if (result.success && result.data) {
        const uploadedUrl = result.data.url;
        setImageUrl(uploadedUrl);
        setPreview(uploadedUrl);
        
        toast({
          title: "✅ Image Uploaded Successfully!",
          description: "Your image has been uploaded. You can now edit and preview it.",
          duration: 2000,
        });
      } else {
        toast({
          title: "❌ Upload Failed",
          description: result.message || "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      toast({
        title: "❌ Invalid File",
        description: "Please drop an image file (PNG, JPG, GIF, WebP)",
        variant: "destructive"
      });
    }
  };

  // Handle URL input
  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreview(url);
  };

  // Handle stock image selection
  const handleStockImageSelect = (url: string) => {
    setImageUrl(url);
    setPreview(url);
  };

  // Handle emoji selection for icons
  const handleEmojiSelect = (emoji: string) => {
    if (elementType === 'icon') {
      setImageUrl(emoji);
      setPreview(emoji);
    }
  };

  // Transform controls
  const updateTransform = (key: keyof ImageTransform, value: number) => {
    setTransform(prev => ({ ...prev, [key]: value }));
  };

  const resetTransform = () => {
    setTransform({
      scale: 1,
      rotation: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  };

  // Apply changes and close
  const handleApply = () => {
    if (!preview) {
      toast({
        title: "❌ No Image Selected",
        description: "Please select or upload an image first",
        variant: "destructive"
      });
      return;
    }

    onImageChange(imageUrl);
    onClose();
    
    toast({
      title: "✅ Image Applied Successfully!",
      description: "The image has been applied to the element",
      duration: 2000,
    });
  };

  // Remove image
  const handleRemove = () => {
    onImageChange('');
    onClose();
    
    toast({
      title: "🗑️ Image Removed",
      description: "The image has been removed from the element",
      duration: 2000,
    });
  };

  // Check if string is emoji
  const isEmoji = (str: string) => {
    return /^\p{Emoji}$/u.test(str);
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Enhanced Image Editor
          </h3>
          <p className="text-gray-400 text-sm">
            {elementId ? `Editing: ${elementId}` : `Type: ${elementType}`}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
        {/* Left Panel - Image Selection */}
        <div className="p-4 border-r border-gray-600 overflow-y-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger 
                value="upload" 
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="url" 
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Link className="w-4 h-4 mr-1" />
                URL
              </TabsTrigger>
              <TabsTrigger 
                value="stock" 
                className="text-gray-300 data-[state=active]:text-white"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Stock
              </TabsTrigger>
              {elementType === 'icon' && (
                <TabsTrigger 
                  value="emoji" 
                  className="text-gray-300 data-[state=active]:text-white"
                >
                  🎨
                </TabsTrigger>
              )}
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Upload New Image</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging 
                      ? 'border-neonCyan bg-neonCyan/10' 
                      : 'border-gray-500 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div className="text-gray-300">
                      <p>Drag and drop your image here</p>
                      <p className="text-sm text-gray-400">or</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="border-gray-500 text-gray-300 hover:bg-gray-700"
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                    <p className="text-xs text-gray-500">
                      Supports PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-700 border-gray-500 text-white"
                />
                <p className="text-xs text-gray-400">
                  Enter a direct link to an image
                </p>
              </div>
            </TabsContent>

            {/* Stock Images Tab */}
            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Stock Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {stockImages[elementType].map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleStockImageSelect(url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                        preview === url 
                          ? 'border-neonCyan shadow-lg' 
                          : 'border-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Stock image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Emoji Tab */}
            {elementType === 'icon' && (
              <TabsContent value="emoji" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Emoji Icons</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {stockImages.icon.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 flex items-center justify-center text-xl ${
                          preview === emoji 
                            ? 'border-neonCyan shadow-lg bg-neonCyan/10' 
                            : 'border-gray-500 hover:border-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Panel - Preview and Edit */}
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-gray-300 font-medium">Preview & Edit</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={`border-gray-500 ${isEditing ? 'bg-neonPink text-black' : 'text-gray-300'}`}
              >
                <Crop className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetTransform}
                className="border-gray-500 text-gray-300"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Preview Container */}
          <div 
            ref={containerRef}
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden"
          >
            {preview ? (
              isEmoji(preview) ? (
                <div 
                  className="text-6xl transform transition-transform"
                  style={{
                    transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(${transform.x}px, ${transform.y}px)`
                  }}
                >
                  {preview}
                </div>
              ) : (
                <div
                  className="relative max-w-full max-h-full transform transition-transform"
                  style={{
                    transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(${transform.x}px, ${transform.y}px)`,
                    width: `${transform.width}%`,
                    height: `${transform.height}%`
                  }}
                >
                  <Image
                    ref={imageRef}
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    onError={() => setPreview('')}
                  />
                </div>
              )
            ) : (
              <div className="text-gray-500 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                <p>No image selected</p>
                <p className="text-sm">Choose an image from the tabs on the left</p>
              </div>
            )}
          </div>

          {/* Edit Controls */}
          {isEditing && preview && !isEmoji(preview) && (
            <div className="mt-4 space-y-3 border-t border-gray-600 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Scale */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Scale</Label>
                  <Slider
                    value={[transform.scale]}
                    onValueChange={([value]) => updateTransform('scale', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">{transform.scale.toFixed(1)}x</div>
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Rotation</Label>
                  <Slider
                    value={[transform.rotation]}
                    onValueChange={([value]) => updateTransform('rotation', value)}
                    min={0}
                    max={360}
                    step={15}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">{transform.rotation}°</div>
                </div>

                {/* X Position */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Position X</Label>
                  <Slider
                    value={[transform.x]}
                    onValueChange={([value]) => updateTransform('x', value)}
                    min={-100}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">{transform.x}px</div>
                </div>

                {/* Y Position */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Position Y</Label>
                  <Slider
                    value={[transform.y]}
                    onValueChange={([value]) => updateTransform('y', value)}
                    min={-100}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">{transform.y}px</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 bg-gray-750 border-t border-gray-600">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="border-red-500 text-red-400 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 mr-2" />
          Remove Image
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
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
  );
}
