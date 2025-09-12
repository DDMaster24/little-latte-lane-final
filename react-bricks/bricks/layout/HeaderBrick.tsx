import React from 'react'
import { types, Text, Image, Link } from 'react-bricks/rsc'
import { Phone, Clock, Mail } from 'lucide-react'

//========================================
// HeaderBrick - Customizable Site Header
//========================================

interface HeaderBrickProps {
  backgroundColor: string
  logoPosition: 'left' | 'center' | 'right'
  showContactInfo: boolean
  headerStyle: 'minimal' | 'full' | 'transparent'
  showSocialLinks: boolean
}

const HeaderBrick: types.Brick<HeaderBrickProps> = ({
  backgroundColor = 'bg-darkBg',
  logoPosition = 'left',
  showContactInfo = true,
  headerStyle = 'full',
  showSocialLinks = true,
}) => {
  const logoPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  const headerClasses = {
    minimal: 'py-4',
    full: 'py-6',
    transparent: 'py-4 bg-transparent backdrop-blur-md'
  }

  return (
    <header className={`${backgroundColor} ${headerClasses[headerStyle]} border-b border-neonCyan/20 sticky top-0 z-50`}>
      <div className="container mx-auto px-6">
        {/* Top Contact Bar */}
        {showContactInfo && headerStyle === 'full' && (
          <div className="border-b border-neonCyan/10 pb-3 mb-3">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-neonCyan" />
                  <Text
                    propName="phone"
                    placeholder="+27 123 456 789"
                    value=""
                    renderBlock={(props) => (
                      <span>{props.children}</span>
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-neonCyan" />
                  <Text
                    propName="email"
                    placeholder="info@littlelattelane.co.za"
                    value=""
                    renderBlock={(props) => (
                      <span>{props.children}</span>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-neonCyan" />
                <Text
                  propName="hours"
                  placeholder="Mon-Sun: 8AM-10PM"
                  value=""
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className={`flex ${logoPositionClasses[logoPosition]} flex-1`}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12">
                <Image
                  propName="logo"
                  alt="Little Latte Lane Logo"
                  source={{
                    src: '/images/logo.svg',
                    placeholderSrc: '/images/logo.svg',
                    srcSet: '',
                    alt: 'Little Latte Lane Logo'
                  }}
                  maxWidth={48}
                  imageClassName="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="hidden md:block">
                <Text
                  propName="siteName"
                  placeholder="Little Latte Lane"
                  value=""
                  renderBlock={(props) => (
                    <h1 className="text-2xl font-bold text-neonCyan group-hover:text-neonPink transition-colors">
                      {props.children}
                    </h1>
                  )}
                />
                
                <Text
                  propName="tagline"
                  placeholder="Neon Nights & Virtual Delights"
                  value=""
                  renderBlock={(props) => (
                    <p className="text-sm text-gray-400">
                      {props.children}
                    </p>
                  )}
                />
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-neonCyan transition-colors font-medium">
              <Text
                propName="homeText"
                placeholder="Home"
                value=""
                renderBlock={(props) => <span>{props.children}</span>}
              />
            </Link>
            
            <Link href="/menu" className="text-gray-300 hover:text-neonCyan transition-colors font-medium">
              <Text
                propName="menuText"
                placeholder="Menu"
                value=""
                renderBlock={(props) => <span>{props.children}</span>}
              />
            </Link>
            
            <Link href="/bookings" className="text-gray-300 hover:text-neonCyan transition-colors font-medium">
              <Text
                propName="bookingsText"
                placeholder="Bookings"
                value=""
                renderBlock={(props) => <span>{props.children}</span>}
              />
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link href="/menu" className="neon-button">
              <Text
                propName="ctaText"
                placeholder="Order Now"
                value=""
                renderBlock={(props) => <span>{props.children}</span>}
              />
            </Link>
          </div>
        </div>

        {/* Social Links */}
        {showSocialLinks && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-neonCyan/10">
            <Text
              propName="socialTitle"
              placeholder="Follow Us:"
              value=""
              renderBlock={(props) => (
                <span className="text-sm text-gray-400 mr-2">
                  {props.children}
                </span>
              )}
            />
            
            <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
              <Text
                propName="facebookText"
                placeholder="Facebook"
                value=""
                renderBlock={(props) => <span className="text-sm">{props.children}</span>}
              />
            </Link>
            
            <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
              <Text
                propName="instagramText"
                placeholder="Instagram"
                value=""
                renderBlock={(props) => <span className="text-sm">{props.children}</span>}
              />
            </Link>
            
            <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
              <Text
                propName="twitterText"
                placeholder="Twitter"
                value=""
                renderBlock={(props) => <span className="text-sm">{props.children}</span>}
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

HeaderBrick.schema = {
  name: 'header',
  label: 'Site Header',
  category: 'layout',
  
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
          { value: 'bg-black/80', label: 'Black Transparent' },
          { value: 'bg-gradient-to-r from-darkBg to-black', label: 'Dark Gradient' },
        ],
      },
    },
    {
      name: 'headerStyle',
      label: 'Header Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'minimal', label: 'Minimal' },
          { value: 'full', label: 'Full' },
          { value: 'transparent', label: 'Transparent' },
        ],
      },
    },
    {
      name: 'logoPosition',
      label: 'Logo Position',
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
      name: 'showContactInfo',
      label: 'Show Contact Info',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showSocialLinks',
      label: 'Show Social Links',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

export default HeaderBrick
