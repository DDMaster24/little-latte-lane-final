'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Image as ImageIcon, X } from 'lucide-react';
import { uploadImage } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onClose: () => void;
  elementType?: 'icon' | 'background' | 'image';
}

export default function ImageUploader({ 
  currentImageUrl, 
  onImageChange, 
  onClose,
  elementType = 'image'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [preview, setPreview] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Emoji presets for icon replacement
  const emojiPresets = [
    // Food & Drink
    '☕', '🍕', '🥐', '🧀', '🍔', '🌮', '🥗', '🍝',
    '🍰', '🧁', '🍪', '🥨', '🍩', '🥪', '🍳', '🥯',
    // Symbols
    '🔥', '⭐', '💎', '🌟', '✨', '🎯', '🏆', '🎉',
    '❤️', '💚', '💙', '💜', '🧡', '💛', '🤍', '🖤',
    // Objects
    '🎨', '🎭', '🎪', '🎯', '🚀', '🌈', '⚡', '🔔',
    '📱', '💻', '🖥️', '⌚', '📷', '🎧', '🎮', '🕹️'
  ];

  // Stock image suggestions based on element type
  const stockImages = {
    icon: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&h=100&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=100&h=100&fit=crop&crop=center',
    ],
    background: [
      'https://images.unsplash.com/photo-1558618666-fbd6c1c56c05?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=400&fit=crop',
    ],
    image: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
    ]
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
          description: "Your image has been uploaded and is ready to use",
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

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreview(url);
  };

  const handleEmojiSelect = (emoji: string) => {
    // For icons, we can use emojis directly
    if (elementType === 'icon') {
      setImageUrl(emoji);
      setPreview(emoji);
    }
  };

  const handleStockImageSelect = (url: string) => {
    setImageUrl(url);
    setPreview(url);
  };

  const handleApply = () => {
    onImageChange(imageUrl);
    onClose();
  };

  const handleRemove = () => {
    onImageChange('');
    onClose();
  };

  const isEmoji = (str: string) => {
    return /^\p{Emoji}$/u.test(str);
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">
          {elementType === 'icon' ? 'Icon Selector' : 'Image Uploader'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      <Tabs defaultValue={elementType === 'icon' ? 'emoji' : 'upload'} className="w-full">
        <TabsList className={`grid w-full ${elementType === 'icon' ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-700`}>
          <TabsTrigger value="upload" className="text-gray-300 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="text-gray-300 data-[state=active]:text-white">
            <Link className="w-4 h-4 mr-1" />
            URL
          </TabsTrigger>
          <TabsTrigger value="stock" className="text-gray-300 data-[state=active]:text-white">
            <ImageIcon className="w-4 h-4 mr-1" />
            Stock
          </TabsTrigger>
          {elementType === 'icon' && (
            <TabsTrigger value="emoji" className="text-gray-300 data-[state=active]:text-white">
              🎨
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Upload New Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <div className="text-xs text-gray-400">
              Supports PNG, JPG, GIF up to 5MB
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-gray-700 border-gray-500 text-white"
            />
            <div className="text-xs text-gray-400">
              Enter a direct link to an image
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Stock Images</Label>
            <div className="grid grid-cols-4 gap-2">
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
            <div className="text-xs text-gray-400">
              Free stock images for quick use
            </div>
          </div>
        </TabsContent>

        {elementType === 'icon' && (
          <TabsContent value="emoji" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Emoji Icons</Label>
              <div className="grid grid-cols-8 gap-2">
                {emojiPresets.map((emoji, index) => (
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
              <div className="text-xs text-gray-400">
                Click any emoji to use as an icon
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <Label className="text-gray-300">Preview</Label>
          <div className="mt-2 flex items-center justify-center">
            {isEmoji(preview) ? (
              <div className="text-4xl bg-gray-700 rounded-lg p-4 border border-gray-500">
                {preview}
              </div>
            ) : (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-500">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => setPreview('')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="border-red-500 text-red-400 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 mr-2" />
          Remove
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
            disabled={!preview}
            className="bg-neonCyan text-black hover:bg-neonCyan/80"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
