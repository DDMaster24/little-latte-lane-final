'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  src?: string;
  alt?: string;
  className?: string;
  editableId: string;
  placeholder?: string;
  fallbackIcon?: React.ReactNode;
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

/**
 * Enhanced Image Placeholder Component
 * Automatically creates editable image placeholders that work with the visual editor
 */
export default function ImagePlaceholder({
  src,
  alt = "Editable image",
  className = "",
  editableId,
  placeholder = "Click to add image",
  fallbackIcon,
  width,
  height,
  children
}: ImagePlaceholderProps) {
  
  useEffect(() => {
    // Auto-register this element as editable on mount
    const element = document.querySelector(`[data-editable="${editableId}"]`);
    if (element) {
      // Add visual editing indicators
      (element as HTMLElement).style.position = 'relative';
      (element as HTMLElement).style.cursor = 'pointer';
      
      // Add hover effect for editing
      element.addEventListener('mouseenter', () => {
        (element as HTMLElement).style.outline = '2px dashed #06FFA5';
        (element as HTMLElement).style.outlineOffset = '2px';
      });
      
      element.addEventListener('mouseleave', () => {
        (element as HTMLElement).style.outline = 'none';
      });
    }
  }, [editableId]);

  // If we have a valid image source, render the image
  if (src && src.trim() !== '') {
    return (
      <div 
        data-editable={editableId}
        className={`relative group ${className}`}
        style={{ width, height }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          unoptimized={src.startsWith('http')} // Allow external images
        />
        
        {/* Edit overlay - appears on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="text-white text-sm font-medium flex items-center space-x-1">
            <ImageIcon className="w-4 h-4" />
            <span>Click to edit</span>
          </div>
        </div>
        
        {children}
      </div>
    );
  }

  // Render placeholder when no image is set
  return (
    <div 
      data-editable={editableId}
      className={`relative border-2 border-dashed border-gray-400 hover:border-neonCyan transition-colors duration-200 flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-pointer group ${className}`}
      style={{ width: width || 200, height: height || 150 }}
    >
      <div className="text-center p-4">
        {fallbackIcon || <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />}
        <p className="text-gray-500 text-sm font-medium">{placeholder}</p>
        <p className="text-gray-400 text-xs mt-1">Click to select image</p>
      </div>
      
      {/* Edit indicator */}
      <div className="absolute top-2 right-2 bg-neonCyan text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        Editable
      </div>
      
      {children}
    </div>
  );
}

/**
 * Quick wrapper for background images
 */
export function BackgroundImagePlaceholder({
  backgroundImage,
  editableId,
  className = "",
  placeholder = "Click to set background",
  children,
  ...props
}: {
  backgroundImage?: string;
  editableId: string;
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const hasBackground = backgroundImage && backgroundImage !== 'none' && backgroundImage.trim() !== '';
  
  return (
    <div
      data-editable={editableId}
      className={`relative group cursor-pointer ${className}`}
      style={{
        backgroundImage: hasBackground ? backgroundImage : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...props.style
      }}
      {...props}
    >
      {!hasBackground && (
        <div className="absolute inset-0 border-2 border-dashed border-gray-400 hover:border-neonCyan transition-colors duration-200 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
          <div className="text-center p-4">
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm font-medium">{placeholder}</p>
            <p className="text-gray-400 text-xs mt-1">Click to select background</p>
          </div>
        </div>
      )}
      
      {/* Edit overlay */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="text-white text-sm font-medium flex items-center space-x-1">
          <ImageIcon className="w-4 h-4" />
          <span>Click to edit background</span>
        </div>
      </div>
      
      {children}
    </div>
  );
}

/**
 * Quick wrapper for logos/icons
 */
export function LogoPlaceholder({
  src,
  editableId,
  className = "",
  alt = "Logo",
  width = 120,
  height = 60,
  placeholder = "Click to upload logo"
}: {
  src?: string;
  editableId: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      editableId={editableId}
      className={className}
      width={width}
      height={height}
      placeholder={placeholder}
      fallbackIcon={<div className="w-8 h-8 bg-neonCyan rounded flex items-center justify-center text-black font-bold text-sm">LOGO</div>}
    />
  );
}
