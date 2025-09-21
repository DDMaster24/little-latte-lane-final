import React from 'react'
import { Text, RichText, Image, types } from 'react-bricks/frontend'
import { useRestaurantClosure } from '@/hooks/useRestaurantClosure'
import { AlertCircle, Clock, Calendar, PowerOff } from 'lucide-react'

//========================================
// Local Types
//========================================
export interface ClosureBannerProps {
  heading: types.TextValue
  subheading: types.TextValue
  bannerImage: types.IImageSource
  showImage: boolean
  bannerColor: 'red' | 'orange' | 'yellow' | 'gray'
  textColor: 'white' | 'dark'
  showIcon: boolean
  iconType: 'alert' | 'clock' | 'calendar' | 'power'
  customMessage: types.TextValue
  showCustomMessage: boolean
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
  backgroundPattern: 'none' | 'diagonal' | 'dots' | 'gradient'
}

//========================================
// Component to be rendered
//========================================
const ClosureBanner: types.Brick<ClosureBannerProps> = ({ 
  heading,
  subheading,
  bannerImage,
  showImage,
  bannerColor,
  textColor,
  showIcon,
  iconType,
  customMessage,
  showCustomMessage,
  borderStyle,
  backgroundPattern
}) => {
  const { closureStatus, isClosed } = useRestaurantClosure()

  // Don't render if restaurant is open
  if (!isClosed) {
    return null
  }

  // Get color classes based on banner color
  const getColorClasses = () => {
    const colors = {
      red: {
        bg: 'bg-red-500/20 border-red-500/40',
        text: textColor === 'white' ? 'text-red-100' : 'text-red-800',
        heading: textColor === 'white' ? 'text-red-200' : 'text-red-900',
        icon: 'text-red-400'
      },
      orange: {
        bg: 'bg-orange-500/20 border-orange-500/40',
        text: textColor === 'white' ? 'text-orange-100' : 'text-orange-800',
        heading: textColor === 'white' ? 'text-orange-200' : 'text-orange-900',
        icon: 'text-orange-400'
      },
      yellow: {
        bg: 'bg-yellow-500/20 border-yellow-500/40',
        text: textColor === 'white' ? 'text-yellow-100' : 'text-yellow-800',
        heading: textColor === 'white' ? 'text-yellow-200' : 'text-yellow-900',
        icon: 'text-yellow-400'
      },
      gray: {
        bg: 'bg-gray-500/20 border-gray-500/40',
        text: textColor === 'white' ? 'text-gray-100' : 'text-gray-800',
        heading: textColor === 'white' ? 'text-gray-200' : 'text-gray-900',
        icon: 'text-gray-400'
      }
    }
    return colors[bannerColor]
  }

  // Get border style class
  const getBorderClass = () => {
    const styles = {
      solid: 'border-2',
      dashed: 'border-2 border-dashed',
      dotted: 'border-2 border-dotted',
      none: 'border-0'
    }
    return styles[borderStyle]
  }

  // Get background pattern class
  const getBackgroundClass = () => {
    const baseClasses = getColorClasses().bg
    const patterns = {
      none: baseClasses,
      diagonal: `${baseClasses} bg-gradient-to-br`,
      dots: `${baseClasses} bg-dotted-pattern`,
      gradient: `${baseClasses} bg-gradient-to-r`
    }
    return patterns[backgroundPattern]
  }

  // Get icon component
  const getIcon = () => {
    const iconClass = `h-6 w-6 sm:h-8 sm:w-8 ${getColorClasses().icon}`
    const icons = {
      alert: <AlertCircle className={iconClass} />,
      clock: <Clock className={iconClass} />,
      calendar: <Calendar className={iconClass} />,
      power: <PowerOff className={iconClass} />
    }
    return icons[iconType]
  }

  const colorClasses = getColorClasses()

  return (
    <div className={`
      relative w-full max-w-7xl mx-auto my-6 p-6 sm:p-8 rounded-xl 
      ${getBackgroundClass()} ${getBorderClass()} 
      backdrop-blur-sm animate-fade-in
    `}>
      {/* Background Pattern Overlay */}
      {backgroundPattern === 'diagonal' && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20 rounded-xl"></div>
      )}
      
      <div className="relative z-10">
        <div className={`flex flex-col lg:flex-row items-center gap-6 ${showImage && bannerImage ? 'lg:gap-8' : ''}`}>
          
          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              {showIcon && getIcon()}
              
              <Text
                propName="heading"
                value={heading}
                placeholder="We're Currently Closed"
                renderBlock={({ children }) => (
                  <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${colorClasses.heading}`}>
                    {children}
                  </h2>
                )}
              />
            </div>

            <Text
              propName="subheading"
              value={subheading}
              placeholder="We'll be back soon! Check our schedule or contact us for more information."
              renderBlock={({ children }) => (
                <p className={`text-lg sm:text-xl mb-4 ${colorClasses.text}`}>
                  {children}
                </p>
              )}
            />

            {/* Dynamic closure information */}
            <div className="space-y-2 mb-4">
              {closureStatus.message && (
                <p className={`text-sm sm:text-base ${colorClasses.text} opacity-90`}>
                  <strong>Reason:</strong> {closureStatus.message}
                </p>
              )}
              
              {closureStatus.reason === 'scheduled' && closureStatus.scheduled_end && (
                <p className={`text-sm sm:text-base ${colorClasses.text} opacity-90 flex items-center justify-center lg:justify-start gap-2`}>
                  <Clock className="h-4 w-4" />
                  <strong>Reopening:</strong> {new Date(closureStatus.scheduled_end).toLocaleString()}
                </p>
              )}
              
              {closureStatus.reason === 'manual' && (
                <p className={`text-sm sm:text-base ${colorClasses.text} opacity-90`}>
                  <strong>Status:</strong> Temporarily closed - Please check back later
                </p>
              )}
            </div>

            {/* Custom Message */}
            {showCustomMessage && (
              <div className={`mt-4 p-4 rounded-lg bg-black/10 border ${borderStyle !== 'none' ? 'border-current' : 'border-transparent'} border-opacity-20`}>
                <RichText
                  propName="customMessage"
                  value={customMessage}
                  placeholder="Add your custom closure message here..."
                  allowedFeatures={[
                    types.RichTextFeatures.Bold,
                    types.RichTextFeatures.Italic,
                    types.RichTextFeatures.Link
                  ]}
                  renderBlock={({ children }) => (
                    <div className={`text-sm sm:text-base ${colorClasses.text}`}>
                      {children}
                    </div>
                  )}
                />
              </div>
            )}
          </div>

          {/* Image Section */}
          {showImage && (
            <div className="flex-shrink-0 w-full lg:w-80 xl:w-96">
              <Image
                propName="bannerImage"
                source={bannerImage}
                alt="Closure banner"
                imageClassName="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg shadow-lg"
                imageStyle={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

//========================================
// Brick Schema
//========================================
ClosureBanner.schema = {
  name: 'closure-banner',
  label: 'Closure Banner',
  category: 'Restaurant Management',
  tags: ['closure', 'banner', 'status', 'restaurant'],
  
  getDefaultProps: () => ({
    heading: 'We\'re Currently Closed',
    subheading: 'We\'ll be back soon! Check our schedule or contact us for more information.',
    bannerImage: {
      src: '',
      placeholderSrc: '',
      srcSet: '',
      alt: 'Closure banner',
      seoName: 'closure-banner'
    },
    showImage: true,
    bannerColor: 'red',
    textColor: 'white',
    showIcon: true,
    iconType: 'alert',
    customMessage: 'Thank you for your patience!',
    showCustomMessage: false,
    borderStyle: 'solid',
    backgroundPattern: 'none'
  }),

  repeaterItems: [],

  sideEditProps: [
    {
      groupName: 'Content',
      props: [
        {
          name: 'showImage',
          label: 'Show Image',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showCustomMessage',
          label: 'Show Custom Message',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Visual Style',
      props: [
        {
          name: 'bannerColor',
          label: 'Banner Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: 'red', label: 'Red (Emergency)' },
              { value: 'orange', label: 'Orange (Warning)' },
              { value: 'yellow', label: 'Yellow (Scheduled)' },
              { value: 'gray', label: 'Gray (Maintenance)' },
            ],
          },
        },
        {
          name: 'textColor',
          label: 'Text Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'white', label: 'Light Text' },
              { value: 'dark', label: 'Dark Text' },
            ],
          },
        },
        {
          name: 'borderStyle',
          label: 'Border Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'none', label: 'No Border' },
            ],
          },
        },
        {
          name: 'backgroundPattern',
          label: 'Background Pattern',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'diagonal', label: 'Diagonal' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Icon',
      props: [
        {
          name: 'showIcon',
          label: 'Show Icon',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'iconType',
          label: 'Icon Type',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'alert', label: 'Alert Circle' },
              { value: 'clock', label: 'Clock' },
              { value: 'calendar', label: 'Calendar' },
              { value: 'power', label: 'Power Off' },
            ],
          },
        },
      ],
    },
  ],
}

export default ClosureBanner