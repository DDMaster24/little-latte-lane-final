import React from 'react'
import { types, Text, Image, Repeater } from 'react-bricks/rsc'

//========================================
// ImageGalleryBrick - Image Gallery with Masonry Layout
//========================================

interface ImageGalleryBrickProps {
  backgroundColor: string
  galleryLayout: 'grid' | 'masonry' | 'carousel'
  columns: 2 | 3 | 4
  showCaptions: boolean
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
}

const ImageGalleryBrick: types.Brick<ImageGalleryBrickProps> = ({
  backgroundColor = 'bg-darkBg',
  galleryLayout: _galleryLayout = 'grid', // Placeholder for future layout options
  columns = 3,
  showCaptions = true,
  aspectRatio = 'auto',
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  // For future use when implementing different gallery layouts
  const _aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  return (
    <section className={`${backgroundColor} py-16 px-8`}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Text
            propName="title"
            placeholder="Gallery Title"
            value=""
            renderBlock={(props) => (
              <h2 className="text-4xl md:text-5xl font-bold text-neonCyan mb-4 leading-tight">
                {props.children}
              </h2>
            )}
          />
          
          <Text
            propName="description"
            placeholder="Gallery description..."
            value=""
            renderBlock={(props) => (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {props.children}
              </p>
            )}
          />
        </div>

        {/* Gallery Grid */}
        <div className={`grid grid-cols-1 ${columnClasses[columns]} gap-6`}>
          <Repeater
            propName="images"
            items={[]}
            renderWrapper={(items) => <>{items}</>}
            renderItemWrapper={(item) => (
              <div className="group relative overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm border border-neonCyan/20 hover:border-neonPink/40 transition-all duration-300">
                {item}
              </div>
            )}
            itemProps={{
              backgroundColor,
              showCaptions,
              aspectRatio,
            }}
          />
        </div>

        {/* Add Image Button (visible in editor) */}
        <div className="text-center mt-12">
          <Text
            propName="addImageText"
            placeholder="Click + to add images in the gallery above"
            value=""
            renderBlock={(props) => (
              <p className="text-gray-400 italic">
                {props.children}
              </p>
            )}
          />
        </div>
      </div>
    </section>
  )
}

// Gallery Image Item Brick
interface GalleryImageBrickProps {
  showCaptions: boolean
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
}

const GalleryImageBrick: types.Brick<GalleryImageBrickProps> = ({
  showCaptions = true,
  aspectRatio = 'auto'
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  return (
    <div className="relative">
      <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
        <Image
          propName="image"
          alt="Gallery image"
          source={{
            src: '/images/placeholder.jpg',
            placeholderSrc: '/images/placeholder.jpg',
            srcSet: '',
            alt: 'Gallery image'
          }}
          maxWidth={800}
          imageClassName={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${aspectRatio === 'auto' ? 'h-auto' : ''}`}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {showCaptions && (
        <div className="p-4">
          <Text
            propName="title"
            placeholder="Image title"
            value=""
            renderBlock={(props) => (
              <h4 className="text-lg font-semibold text-neonCyan mb-2">
                {props.children}
              </h4>
            )}
          />
          
          <Text
            propName="caption"
            placeholder="Image caption or description..."
            value=""
            renderBlock={(props) => (
              <p className="text-sm text-gray-300 leading-relaxed">
                {props.children}
              </p>
            )}
          />
        </div>
      )}
    </div>
  )
}

ImageGalleryBrick.schema = {
  name: 'image-gallery',
  label: 'Image Gallery',
  category: 'content',
  
  sideEditProps: [
    {
      name: 'backgroundColor',
      label: 'Background',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-darkBg', label: 'Dark' },
          { value: 'bg-darkBg/95', label: 'Dark Transparent' },
          { value: 'bg-gradient-to-br from-darkBg to-black', label: 'Dark Gradient' },
          { value: 'bg-black/80', label: 'Black Transparent' },
        ],
      },
    },
    {
      name: 'galleryLayout',
      label: 'Layout Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'masonry', label: 'Masonry' },
          { value: 'carousel', label: 'Carousel' },
        ],
      },
    },
    {
      name: 'columns',
      label: 'Columns',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
        ],
      },
    },
    {
      name: 'aspectRatio',
      label: 'Image Aspect Ratio',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'auto', label: 'Auto (Original)' },
          { value: 'square', label: 'Square (1:1)' },
          { value: 'landscape', label: 'Landscape (16:9)' },
          { value: 'portrait', label: 'Portrait (3:4)' },
        ],
      },
    },
    {
      name: 'showCaptions',
      label: 'Show Image Captions',
      type: types.SideEditPropType.Boolean,
    },
  ],
  
  repeaterItems: [
    {
      name: 'images',
      itemType: 'gallery-image',
      itemLabel: 'Image',
      min: 1,
      max: 12,
    },
  ],
}

GalleryImageBrick.schema = {
  name: 'gallery-image',
  label: 'Gallery Image',
  category: 'content',
  hideFromAddMenu: true, // Only accessible through repeater
}

export default ImageGalleryBrick
export { GalleryImageBrick }
