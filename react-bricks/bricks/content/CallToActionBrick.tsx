import React from 'react'
import { types, Text, Image } from 'react-bricks/rsc'
import { MapPin, Star, ArrowRight } from 'lucide-react'

//========================================
// CallToActionBrick - Powerful CTA Section
//========================================

interface CallToActionBrickProps {
  backgroundColor: string
  ctaStyle: 'centered' | 'split' | 'overlay' | 'minimal'
  buttonStyle: 'primary' | 'secondary' | 'outline' | 'neon'
  showImage: boolean
  urgency: 'none' | 'limited' | 'countdown'
}

const CallToActionBrick: types.Brick<CallToActionBrickProps> = ({
  backgroundColor = 'bg-neon-gradient',
  ctaStyle = 'centered',
  buttonStyle = 'neon',
  showImage = true,
  urgency: _urgency = 'none', // For future countdown implementation
}) => {
  const buttonClasses = {
    primary: 'bg-neonCyan text-black hover:bg-neonCyan/90',
    secondary: 'bg-neonPink text-white hover:bg-neonPink/90',
    outline: 'border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black',
    neon: 'neon-button'
  }

  const StyleCentered = () => (
    <div className="text-center max-w-4xl mx-auto">
      {showImage && (
        <div className="mb-8">
          <Image
            propName="heroImage"
            alt="Call to action image"
            source={{
              src: '/images/cta-hero.jpg',
              placeholderSrc: '/images/cta-hero.jpg',
              srcSet: '',
              alt: 'Call to action image'
            }}
            maxWidth={800}
            aspectRatio={16/9}
            imageClassName="rounded-lg shadow-neon mx-auto"
          />
        </div>
      )}
      
      <Text
        propName="heading"
        placeholder="Ready to Experience the Future?"
        value=""
        renderBlock={(props) => (
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {props.children}
          </h2>
        )}
      />
      
      <Text
        propName="subheading"
        placeholder="Join us for an unforgettable blend of gaming and gourmet dining"
        value=""
        renderBlock={(props) => (
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            {props.children}
          </p>
        )}
      />
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className={`${buttonClasses[buttonStyle]} px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 group`}>
          <Text
            propName="primaryButtonText"
            placeholder="Order Now"
            value=""
            renderBlock={(props) => <span>{props.children}</span>}
          />
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
          <Text
            propName="secondaryButtonText"
            placeholder="View Menu"
            value=""
            renderBlock={(props) => <span>{props.children}</span>}
          />
        </button>
      </div>
    </div>
  )

  const StyleSplit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <Text
          propName="heading"
          placeholder="Ready to Experience the Future?"
          value=""
          renderBlock={(props) => (
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {props.children}
            </h2>
          )}
        />
        
        <Text
          propName="subheading"
          placeholder="Join us for an unforgettable blend of gaming and gourmet dining in our neon-lit paradise."
          value=""
          renderBlock={(props) => (
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              {props.children}
            </p>
          )}
        />
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-gray-200">
            <Star className="text-neonYellow fill-neonYellow" size={20} />
            <Text
              propName="feature1"
              placeholder="Award-winning virtual golf experience"
              value=""
              renderBlock={(props) => <span>{props.children}</span>}
            />
          </div>
          
          <div className="flex items-center gap-3 text-gray-200">
            <Star className="text-neonYellow fill-neonYellow" size={20} />
            <Text
              propName="feature2"
              placeholder="Gourmet dining with local ingredients"
              value=""
              renderBlock={(props) => <span>{props.children}</span>}
            />
          </div>
          
          <div className="flex items-center gap-3 text-gray-200">
            <Star className="text-neonYellow fill-neonYellow" size={20} />
            <Text
              propName="feature3"
              placeholder="Unique neon atmosphere and ambiance"
              value=""
              renderBlock={(props) => <span>{props.children}</span>}
            />
          </div>
        </div>
        
        <button className={`${buttonClasses[buttonStyle]} px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 group`}>
          <Text
            propName="primaryButtonText"
            placeholder="Book Your Experience"
            value=""
            renderBlock={(props) => <span>{props.children}</span>}
          />
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {showImage && (
        <div className="relative">
          <Image
            propName="heroImage"
            alt="Call to action image"
            source={{
              src: '/images/cta-split.jpg',
              placeholderSrc: '/images/cta-split.jpg',
              srcSet: '',
              alt: 'Call to action image'
            }}
            maxWidth={600}
            aspectRatio={4/3}
            imageClassName="rounded-lg shadow-neon"
          />
          
          <div className="absolute -bottom-6 -right-6 bg-neonCyan text-black p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <Text
                propName="locationText"
                placeholder="Cape Town"
                value=""
                renderBlock={(props) => (
                  <span className="font-semibold text-sm">{props.children}</span>
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (ctaStyle) {
      case 'split':
        return <StyleSplit />
      case 'centered':
      default:
        return <StyleCentered />
    }
  }

  return (
    <section className={`${backgroundColor} py-20 px-8 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {renderContent()}
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-neonPink/30 rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border border-neonCyan/30 rounded-full animate-pulse delay-1000" />
    </section>
  )
}

CallToActionBrick.schema = {
  name: 'call-to-action',
  label: 'Call to Action',
  category: 'content',
  
  sideEditProps: [
    {
      name: 'backgroundColor',
      label: 'Background',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-neon-gradient', label: 'Neon Gradient' },
          { value: 'bg-gradient-to-br from-neonCyan/20 to-neonPink/20', label: 'Cyan to Pink' },
          { value: 'bg-gradient-to-r from-darkBg to-black', label: 'Dark Gradient' },
          { value: 'bg-black', label: 'Pure Black' },
          { value: 'bg-darkBg', label: 'Dark' },
        ],
      },
    },
    {
      name: 'ctaStyle',
      label: 'Layout Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'centered', label: 'Centered' },
          { value: 'split', label: 'Split Layout' },
          { value: 'overlay', label: 'Image Overlay' },
          { value: 'minimal', label: 'Minimal' },
        ],
      },
    },
    {
      name: 'buttonStyle',
      label: 'Button Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'neon', label: 'Neon Button' },
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
        ],
      },
    },
    {
      name: 'urgency',
      label: 'Urgency Type',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'none', label: 'None' },
          { value: 'limited', label: 'Limited Time' },
          { value: 'countdown', label: 'Countdown Timer' },
        ],
      },
    },
    {
      name: 'showImage',
      label: 'Show Image',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

export default CallToActionBrick
