'use client';

import React from 'react';
import UniversalPageEditor from '@/components/Admin/UniversalPageEditor';
import ImagePlaceholder, { LogoPlaceholder, BackgroundImagePlaceholder } from '@/components/Admin/ImagePlaceholder';

/**
 * Enhanced Image Upload Demo Page
 * Showcases all the new image upload and management features
 */
export default function ImageUploadDemoPage() {
  return (
    <UniversalPageEditor
      pageScope="image-demo"
      pageName="Enhanced Image Upload Demo"
      enabledTools={['select', 'image']}
    >
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section with Background Image */}
        <BackgroundImagePlaceholder
          editableId="hero-background"
          className="min-h-[60vh] flex items-center justify-center"
          placeholder="Click to set hero background"
        >
          <div className="text-center z-10 relative">
            <h1 data-editable="hero-title" className="text-5xl font-bold mb-4">
              Enhanced Image Upload System
            </h1>
            <p data-editable="hero-subtitle" className="text-xl text-gray-300 mb-8">
              Drag, drop, edit, and apply images with ease
            </p>
          </div>
        </BackgroundImagePlaceholder>

        {/* Navigation with Logo */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoPlaceholder
              editableId="demo-logo"
              width={150}
              height={50}
              placeholder="Upload your logo"
            />
            <div className="text-neonCyan font-medium">Image Upload Demo</div>
          </div>
        </nav>

        {/* Feature Grid */}
        <div className="container mx-auto px-6 py-12">
          <h2 data-editable="features-title" className="text-3xl font-bold text-center mb-12">
            New Image Management Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <ImagePlaceholder
                editableId="feature-1-image"
                width={300}
                height={200}
                placeholder="Upload feature image"
                className="mb-4 rounded-lg"
              />
              <h3 data-editable="feature-1-title" className="text-xl font-semibold mb-2">
                Drag & Drop Upload
              </h3>
              <p data-editable="feature-1-description" className="text-gray-300">
                Simply drag images from your desktop directly into the editor. No more complex file dialogs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <ImagePlaceholder
                editableId="feature-2-image"
                width={300}
                height={200}
                placeholder="Upload feature image"
                className="mb-4 rounded-lg"
              />
              <h3 data-editable="feature-2-title" className="text-xl font-semibold mb-2">
                Live Preview & Transform
              </h3>
              <p data-editable="feature-2-description" className="text-gray-300">
                See your images before applying. Scale, rotate, and position with real-time preview controls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <ImagePlaceholder
                editableId="feature-3-image"
                width={300}
                height={200}
                placeholder="Upload feature image"
                className="mb-4 rounded-lg"
              />
              <h3 data-editable="feature-3-title" className="text-xl font-semibold mb-2">
                Multiple Image Sources
              </h3>
              <p data-editable="feature-3-description" className="text-gray-300">
                Upload files, paste URLs, choose stock images, or use emojis for icons. All in one interface.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-gray-800 py-12">
          <div className="container mx-auto px-6">
            <h2 data-editable="gallery-title" className="text-3xl font-bold text-center mb-12">
              Image Gallery Demo
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <ImagePlaceholder
                  key={i}
                  editableId={`gallery-image-${i + 1}`}
                  width={250}
                  height={250}
                  placeholder={`Gallery ${i + 1}`}
                  className="rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 data-editable="instructions-title" className="text-2xl font-bold mb-6">
              How to Use the Enhanced Image Editor
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-neonCyan">Quick Start:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Click on any image or placeholder above</li>
                  <li>Select &ldquo;Image&rdquo; tool from the toolbar</li>
                  <li>Choose upload method (Drag & Drop, URL, or Stock)</li>
                  <li>Preview and edit your image</li>
                  <li>Click &ldquo;Apply Image&rdquo; to use it</li>
                  <li>Click &ldquo;Save Changes&rdquo; to make it permanent</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-neonCyan">Pro Tips:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Drag images directly from your desktop</li>
                  <li>Use the transform controls to perfect your image</li>
                  <li>Stock images are ready to use immediately</li>
                  <li>Emoji icons work great for simple graphics</li>
                  <li>All changes preview before saving</li>
                  <li>You can discard changes anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Icon Examples */}
        <footer className="bg-gray-800 border-t border-gray-700 py-8">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div data-editable="footer-icon-1" className="text-4xl mb-2">☕</div>
                <p className="text-sm text-gray-400">Coffee Icon</p>
              </div>
              <div className="text-center">
                <div data-editable="footer-icon-2" className="text-4xl mb-2">🍕</div>
                <p className="text-sm text-gray-400">Food Icon</p>
              </div>
              <div className="text-center">
                <div data-editable="footer-icon-3" className="text-4xl mb-2">⭐</div>
                <p className="text-sm text-gray-400">Star Icon</p>
              </div>
              <div className="text-center">
                <div data-editable="footer-icon-4" className="text-4xl mb-2">❤️</div>
                <p className="text-sm text-gray-400">Heart Icon</p>
              </div>
            </div>
            
            <p data-editable="footer-text" className="text-center text-gray-400 mt-8">
              Click any icon above to change it. The Enhanced Image Editor supports emojis for quick icon replacement.
            </p>
          </div>
        </footer>
      </div>
    </UniversalPageEditor>
  );
}
