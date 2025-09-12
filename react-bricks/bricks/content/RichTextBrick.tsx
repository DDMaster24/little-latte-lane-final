import React from 'react'
import { types, Text, RichText, Image } from 'react-bricks/rsc'

//========================================
// RichTextBrick - Rich Content Editor
//========================================

interface RichTextBrickProps {
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
  padding: 'sm' | 'md' | 'lg' | 'xl'
  showImage: boolean
}

const RichTextBrick: types.Brick<RichTextBrickProps> = ({
  backgroundColor = 'bg-darkBg',
  textAlign = 'left',
  padding = 'md',
  showImage = false,
}) => {
  const paddingClasses = {
    sm: 'py-8 px-6',
    md: 'py-12 px-8',
    lg: 'py-16 px-12',
    xl: 'py-20 px-16'
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <section className={`${backgroundColor} ${paddingClasses[padding]}`}>
      <div className="container mx-auto max-w-4xl">
        {showImage && (
          <div className="mb-8 text-center">
            <Image
              propName="featuredImage"
              alt="Featured content image"
              maxWidth={800}
              aspectRatio={16/9}
              imageClassName="rounded-lg shadow-neon"
              source={{
                src: '/images/placeholder.jpg',
                placeholderSrc: '/images/placeholder.jpg',
                srcSet: '',
                alt: 'Featured content image'
              }}
            />
          </div>
        )}
        
        <div className={`prose prose-invert max-w-none ${textAlignClasses[textAlign]}`}>
          <Text
            propName="heading"
            placeholder="Enter main heading..."
            value=""
            renderBlock={(props) => (
              <h2 className="text-4xl md:text-5xl font-bold text-neonCyan mb-6 leading-tight">
                {props.children}
              </h2>
            )}
          />
          
          <Text
            propName="subheading"
            placeholder="Enter subheading..."
            value=""
            renderBlock={(props) => (
              <h3 className="text-xl md:text-2xl text-neonPink mb-8 font-medium">
                {props.children}
              </h3>
            )}
          />
          
          <div className="text-lg leading-relaxed">
            <RichText
              propName="content"
              placeholder="Start writing your content here..."
              value=""
              allowedFeatures={[
                types.RichTextFeatures.Bold,
                types.RichTextFeatures.Italic,
                types.RichTextFeatures.Highlight,
                types.RichTextFeatures.Code,
                types.RichTextFeatures.Link,
                types.RichTextFeatures.UnorderedList,
                types.RichTextFeatures.OrderedList,
                types.RichTextFeatures.Quote,
              ]}
              renderCode={(props) => (
                <code className="bg-neonCyan/20 text-neonCyan px-2 py-1 rounded text-sm">
                  {props.children}
                </code>
              )}
              renderBold={(props) => (
                <strong className="text-neonPink font-semibold">
                  {props.children}
                </strong>
              )}
              renderItalic={(props) => (
                <em className="text-neonCyan italic">{props.children}</em>
              )}
              renderHighlight={(props) => (
                <mark className="bg-neonYellow/30 text-neonYellow px-1 rounded">
                  {props.children}
                </mark>
              )}
              renderLink={(props) => (
                <a
                  href={props.href}
                  className="text-neonCyan hover:text-neonPink transition-colors underline"
                  target={props.target}
                >
                  {props.children}
                </a>
              )}
              renderUL={(props) => (
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  {props.children}
                </ul>
              )}
              renderOL={(props) => (
                <ol className="list-decimal list-inside space-y-2 text-gray-200">
                  {props.children}
                </ol>
              )}
              renderLI={(props) => (
                <li className="text-gray-200">{props.children}</li>
              )}
              renderQuote={(props) => (
                <blockquote className="border-l-4 border-neonCyan bg-neonCyan/10 pl-6 py-4 my-6 italic text-gray-200">
                  {props.children}
                </blockquote>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

RichTextBrick.schema = {
  name: 'rich-text',
  label: 'Rich Text Content',
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
          { value: 'bg-neon-gradient', label: 'Neon Gradient' },
          { value: 'bg-black/80', label: 'Black Transparent' },
        ],
      },
    },
    {
      name: 'textAlign',
      label: 'Text Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
    },
    {
      name: 'padding',
      label: 'Section Padding',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
      },
    },
    {
      name: 'showImage',
      label: 'Show Featured Image',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

export default RichTextBrick
