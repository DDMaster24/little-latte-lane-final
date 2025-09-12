import React from 'react'
import { types, Text, Image, Link } from 'react-bricks/rsc'
import { Phone, MapPin, Clock, Mail, Heart } from 'lucide-react'

//========================================
// FooterBrick - Customizable Site Footer
//========================================

interface FooterBrickProps {
  backgroundColor: string
  footerStyle: 'minimal' | 'full' | 'compact'
  showContactInfo: boolean
  showSocialLinks: boolean
  showBusinessHours: boolean
  columns: 2 | 3 | 4
}

const FooterBrick: types.Brick<FooterBrickProps> = ({
  backgroundColor = 'bg-darkBg',
  footerStyle = 'full',
  showContactInfo = true,
  showSocialLinks = true,
  showBusinessHours = true,
  columns = 3,
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  const footerClasses = {
    minimal: 'py-8',
    full: 'py-12',
    compact: 'py-6'
  }

  return (
    <footer className={`${backgroundColor} ${footerClasses[footerStyle]} border-t border-neonCyan/20 mt-auto`}>
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className={`grid grid-cols-1 ${columnClasses[columns]} gap-8 mb-8`}>
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  propName="footerLogo"
                  alt="Little Latte Lane Logo"
                  source={{
                    src: '/images/logo.svg',
                    placeholderSrc: '/images/logo.svg',
                    srcSet: '',
                    alt: 'Little Latte Lane Logo'
                  }}
                  maxWidth={40}
                  imageClassName="w-full h-full object-contain"
                />
              </div>
              
              <Text
                propName="companyName"
                placeholder="Little Latte Lane"
                value=""
                renderBlock={(props) => (
                  <h3 className="text-xl font-bold text-neonCyan">
                    {props.children}
                  </h3>
                )}
              />
            </div>
            
            <Text
              propName="aboutText"
              placeholder="Experience the perfect blend of gaming and gourmet in our neon-lit paradise. Where virtual adventures meet real flavors."
              value=""
              renderBlock={(props) => (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {props.children}
                </p>
              )}
            />
          </div>

          {/* Contact Information */}
          {showContactInfo && (
            <div className="space-y-4">
              <Text
                propName="contactTitle"
                placeholder="Contact Us"
                value=""
                renderBlock={(props) => (
                  <h4 className="text-lg font-semibold text-neonPink mb-4">
                    {props.children}
                  </h4>
                )}
              />
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-neonCyan mt-0.5 flex-shrink-0" />
                  <Text
                    propName="address"
                    placeholder="123 Gaming Street, Tech District, Cape Town, 8000"
                    value=""
                    renderBlock={(props) => (
                      <span className="text-gray-300">
                        {props.children}
                      </span>
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-neonCyan flex-shrink-0" />
                  <Text
                    propName="phone"
                    placeholder="+27 123 456 789"
                    value=""
                    renderBlock={(props) => (
                      <span className="text-gray-300">
                        {props.children}
                      </span>
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-neonCyan flex-shrink-0" />
                  <Text
                    propName="email"
                    placeholder="info@littlelattelane.co.za"
                    value=""
                    renderBlock={(props) => (
                      <span className="text-gray-300">
                        {props.children}
                      </span>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Hours */}
          {showBusinessHours && (
            <div className="space-y-4">
              <Text
                propName="hoursTitle"
                placeholder="Opening Hours"
                value=""
                renderBlock={(props) => (
                  <h4 className="text-lg font-semibold text-neonPink mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-neonCyan" />
                    {props.children}
                  </h4>
                )}
              />
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <Text
                    propName="mondayFriday"
                    placeholder="Monday - Friday:"
                    value=""
                    renderBlock={(props) => <span>{props.children}</span>}
                  />
                  <Text
                    propName="mondayFridayHours"
                    placeholder="8:00 AM - 10:00 PM"
                    value=""
                    renderBlock={(props) => <span>{props.children}</span>}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Text
                    propName="weekend"
                    placeholder="Saturday - Sunday:"
                    value=""
                    renderBlock={(props) => <span>{props.children}</span>}
                  />
                  <Text
                    propName="weekendHours"
                    placeholder="9:00 AM - 11:00 PM"
                    value=""
                    renderBlock={(props) => <span>{props.children}</span>}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-4">
            <Text
              propName="linksTitle"
              placeholder="Quick Links"
              value=""
              renderBlock={(props) => (
                <h4 className="text-lg font-semibold text-neonPink mb-4">
                  {props.children}
                </h4>
              )}
            />
            
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-gray-300 hover:text-neonCyan transition-colors">
                <Text
                  propName="homeLink"
                  placeholder="Home"
                  value=""
                  renderBlock={(props) => <span>{props.children}</span>}
                />
              </Link>
              
              <Link href="/menu" className="block text-gray-300 hover:text-neonCyan transition-colors">
                <Text
                  propName="menuLink"
                  placeholder="Menu"
                  value=""
                  renderBlock={(props) => <span>{props.children}</span>}
                />
              </Link>
              
              <Link href="/bookings" className="block text-gray-300 hover:text-neonCyan transition-colors">
                <Text
                  propName="bookingsLink"
                  placeholder="Bookings"
                  value=""
                  renderBlock={(props) => <span>{props.children}</span>}
                />
              </Link>
              
              <Link href="/privacy-policy" className="block text-gray-300 hover:text-neonCyan transition-colors">
                <Text
                  propName="privacyLink"
                  placeholder="Privacy Policy"
                  value=""
                  renderBlock={(props) => <span>{props.children}</span>}
                />
              </Link>
              
              <Link href="/terms" className="block text-gray-300 hover:text-neonCyan transition-colors">
                <Text
                  propName="termsLink"
                  placeholder="Terms of Service"
                  value=""
                  renderBlock={(props) => <span>{props.children}</span>}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {showSocialLinks && (
          <div className="border-t border-neonCyan/20 pt-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text
                propName="socialTitle"
                placeholder="Follow us for updates and special offers"
                value=""
                renderBlock={(props) => (
                  <p className="text-gray-400 text-sm">
                    {props.children}
                  </p>
                )}
              />
              
              <div className="flex items-center gap-4">
                <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
                  <Text
                    propName="facebookText"
                    placeholder="Facebook"
                    value=""
                    renderBlock={(props) => <span className="text-sm font-medium">{props.children}</span>}
                  />
                </Link>
                
                <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
                  <Text
                    propName="instagramText"
                    placeholder="Instagram"
                    value=""
                    renderBlock={(props) => <span className="text-sm font-medium">{props.children}</span>}
                  />
                </Link>
                
                <Link href="#" className="text-gray-400 hover:text-neonCyan transition-colors">
                  <Text
                    propName="twitterText"
                    placeholder="Twitter"
                    value=""
                    renderBlock={(props) => <span className="text-sm font-medium">{props.children}</span>}
                  />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-neonCyan/20 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <Text
              propName="copyright"
              placeholder="© 2025 Little Latte Lane. All rights reserved."
              value=""
              renderBlock={(props) => (
                <p>{props.children}</p>
              )}
            />
            
            <Text
              propName="designCredit"
              placeholder="Made with ❤️ in Cape Town"
              value=""
              renderBlock={(_props) => (
                <p className="flex items-center gap-1">
                  Made with <Heart size={14} className="text-neonPink" fill="currentColor" /> in Cape Town
                </p>
              )}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

FooterBrick.schema = {
  name: 'footer',
  label: 'Site Footer',
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
          { value: 'bg-black', label: 'Pure Black' },
          { value: 'bg-gradient-to-t from-black to-darkBg', label: 'Gradient to Dark' },
          { value: 'bg-darkBg/95', label: 'Dark Transparent' },
        ],
      },
    },
    {
      name: 'footerStyle',
      label: 'Footer Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'minimal', label: 'Minimal' },
          { value: 'full', label: 'Full' },
          { value: 'compact', label: 'Compact' },
        ],
      },
    },
    {
      name: 'columns',
      label: 'Content Columns',
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
      name: 'showContactInfo',
      label: 'Show Contact Info',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showBusinessHours',
      label: 'Show Business Hours',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showSocialLinks',
      label: 'Show Social Links',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

export default FooterBrick
