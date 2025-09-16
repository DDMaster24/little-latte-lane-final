import React from 'react'
import { Text, Repeater, Image, types } from 'react-bricks/rsc'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Navigation Link
//========================================
interface NavLinkProps {
  linkText: types.TextValue
  linkUrl: string
  linkIcon?: types.TextValue
  isActive?: boolean
  linkStyle: 'default' | 'neon' | 'outline' | 'minimal'
  showIcon: boolean
}

const NavLink: types.Brick<NavLinkProps> = ({
  linkText,
  linkUrl = '/',
  linkIcon,
  isActive = false,
  linkStyle = 'neon',
  showIcon = true
}) => {
  const getLinkStyleClass = () => {
    switch (linkStyle) {
      case 'default': return 'text-neonText hover:text-neonCyan transition-colors duration-300'
      case 'neon': return 'neon-button text-sm px-3 py-2'
      case 'outline': return 'border border-neonCyan/50 text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 px-3 py-2 rounded'
      case 'minimal': return 'text-gray-300 hover:text-white transition-colors duration-300'
      default: return 'neon-button text-sm px-3 py-2'
    }
  }

  return (
    <Link href={linkUrl} className={`flex items-center gap-2 ${getLinkStyleClass()} ${isActive ? 'text-neonPink' : ''}`}>
      {showIcon && linkIcon && (
        <Text
          propName="linkIcon"
          value={linkIcon}
          renderBlock={(props) => (
            <span className="text-sm">{props.children}</span>
          )}
          placeholder="🏠"
        />
      )}
      <Text
        propName="linkText"
        value={linkText}
        renderBlock={(props) => (
          <span>{props.children}</span>
        )}
        placeholder="Home"
      />
    </Link>
  )
}

NavLink.schema = {
  name: 'nav-link',
  label: 'Navigation Link',
  getDefaultProps: () => ({
    linkText: 'Home',
    linkUrl: '/',
    linkIcon: '🏠',
    isActive: false,
    linkStyle: 'neon',
    showIcon: true
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      name: 'linkUrl',
      label: 'Link URL',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'linkStyle',
      label: 'Link Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'default', label: 'Default' },
          { value: 'neon', label: 'Neon Button' },
          { value: 'outline', label: 'Outline' },
          { value: 'minimal', label: 'Minimal' },
        ],
      },
    },
    {
      name: 'showIcon',
      label: 'Show Icon',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'isActive',
      label: 'Is Active',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

//========================================
// Main Component: Header Section
//========================================
interface HeaderSectionProps {
  siteName: types.TextValue
  logo?: types.IImageSource
  showLogo: boolean
  navigationLinks: types.RepeaterItems
  backgroundColor: string
  textColor: { color: string }
  headerPadding: 'sm' | 'md' | 'lg'
  logoSize: 'sm' | 'md' | 'lg'
  headerLayout: 'left' | 'center' | 'split'
  enableShadow: boolean
  enableSticky: boolean
  _mobileMenuStyle: 'hamburger' | 'dropdown' | 'slide'
}

const HeaderSection: types.Brick<HeaderSectionProps> = ({
  siteName,
  logo,
  showLogo = true,
  navigationLinks,
  backgroundColor = '#0f0f0f',
  textColor = { color: '#ffffff' },
  headerPadding = 'md',
  logoSize = 'md',
  headerLayout = 'split',
  enableShadow = true,
  enableSticky = false,
  _mobileMenuStyle = 'hamburger'
}) => {
  // Note: mobileMenuStyle will be used in future mobile menu enhancements
  const getPaddingClass = () => {
    switch (headerPadding) {
      case 'sm': return 'py-2'
      case 'md': return 'py-2 xs:py-3'
      case 'lg': return 'py-4 xs:py-6'
      default: return 'py-2 xs:py-3'
    }
  }

  const getLogoSizeClass = () => {
    switch (logoSize) {
      case 'sm': return 'w-16 h-16 xs:w-20 xs:h-20'
      case 'md': return 'w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
      case 'lg': return 'w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32'
      default: return 'w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
    }
  }

  const getLayoutClass = () => {
    switch (headerLayout) {
      case 'left': return 'flex flex-col md:flex-row md:items-center md:space-x-8'
      case 'center': return 'flex flex-col items-center space-y-4 md:space-y-0'
      case 'split': return 'flex items-center justify-between'
      default: return 'flex items-center justify-between'
    }
  }

  const headerClasses = [
    'w-full',
    getPaddingClass(),
    enableShadow ? 'shadow-neon' : '',
    enableSticky ? 'sticky top-0 z-40' : '',
    'relative'
  ].filter(Boolean).join(' ')

  return (
    <header 
      className={headerClasses}
      style={{ 
        backgroundColor,
        color: textColor.color
      }}
    >
      <div className="container-full">
        <div className={getLayoutClass()}>
          
          {/* Logo and Site Name Section */}
          <div className="flex items-center space-x-3">
            {showLogo && logo && (
              <Link href="/" className="flex items-center">
                <Image
                  propName="logo"
                  source={logo}
                  alt="Site Logo"
                  imageClassName={`${getLogoSizeClass()} object-contain`}
                />
              </Link>
            )}
            
            {siteName && (
              <Link href="/" className="flex items-center">
                <Text
                  propName="siteName"
                  value={siteName}
                  renderBlock={(props) => (
                    <h1 className="text-xl xs:text-2xl font-bold text-neonCyan hover:text-neonPink transition-colors duration-300">
                      {props.children}
                    </h1>
                  )}
                  placeholder="Little Latte Lane"
                />
              </Link>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          {headerLayout === 'split' && (
            <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <Repeater
                propName="navigationLinks"
                items={navigationLinks}
                renderWrapper={(items) => (
                  <div className="flex items-center space-x-3 xl:space-x-4">
                    {items}
                  </div>
                )}
              />
            </nav>
          )}

          {/* Centered Navigation for center layout */}
          {headerLayout === 'center' && (
            <nav className="flex flex-wrap items-center justify-center gap-3 xl:gap-4">
              <Repeater
                propName="navigationLinks"
                items={navigationLinks}
                renderWrapper={(items) => (
                  <div className="flex flex-wrap items-center justify-center gap-3 xl:gap-4">
                    {items}
                  </div>
                )}
              />
            </nav>
          )}

          {/* Left layout navigation */}
          {headerLayout === 'left' && (
            <nav className="flex flex-wrap items-center gap-3 xl:gap-4 mt-4 md:mt-0">
              <Repeater
                propName="navigationLinks"
                items={navigationLinks}
                renderWrapper={(items) => (
                  <div className="flex flex-wrap items-center gap-3 xl:gap-4">
                    {items}
                  </div>
                )}
              />
            </nav>
          )}

          {/* Right section placeholder for auth components */}
          {headerLayout === 'split' && (
            <div className="flex items-center justify-end space-x-2 xs:space-x-3">
              <div className="text-xs text-gray-500 px-3 py-2 border border-gray-600 rounded">
                Auth Components
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation (Always shown for demo) */}
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-700/50">
          <nav className="flex flex-col space-y-2">
            <Repeater
              propName="navigationLinks"
              items={navigationLinks}
              renderWrapper={(items) => (
                <div className="flex flex-col space-y-2">
                  {items}
                </div>
              )}
            />
          </nav>
        </div>
      </div>
    </header>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
HeaderSection.schema = {
  name: 'header-section',
  label: 'Header Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    siteName: 'Little Latte Lane',
    showLogo: true,
    backgroundColor: '#0f0f0f',
    textColor: { color: '#ffffff' },
    headerPadding: 'md',
    logoSize: 'md',
    headerLayout: 'split',
    enableShadow: true,
    enableSticky: false,
    mobileMenuStyle: 'hamburger',
    navigationLinks: [
      {
        type: 'nav-link',
        props: {
          linkText: 'Home',
          linkUrl: '/',
          linkIcon: '🏠',
          isActive: true,
          linkStyle: 'neon',
          showIcon: true
        }
      },
      {
        type: 'nav-link',
        props: {
          linkText: 'Menu',
          linkUrl: '/menu',
          linkIcon: '🍽️',
          isActive: false,
          linkStyle: 'neon',
          showIcon: true
        }
      },
      {
        type: 'nav-link',
        props: {
          linkText: 'Bookings',
          linkUrl: '/bookings',
          linkIcon: '📅',
          isActive: false,
          linkStyle: 'neon',
          showIcon: true
        }
      },
      {
        type: 'nav-link',
        props: {
          linkText: 'Account',
          linkUrl: '/account',
          linkIcon: '👤',
          isActive: false,
          linkStyle: 'neon',
          showIcon: true
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'navigationLinks',
      itemType: 'nav-link',
      itemLabel: 'Navigation Link',
      min: 1,
      max: 10
    }
  ],

  sideEditProps: [
    {
      groupName: 'Header Content',
      defaultOpen: true,
      props: [
        {
          name: 'showLogo',
          label: 'Show Logo',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'headerLayout',
          label: 'Header Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'split', label: 'Split (Logo left, Nav center, Auth right)' },
              { value: 'center', label: 'Centered' },
              { value: 'left', label: 'Left Aligned' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Design & Layout',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('backgroundColor', 'Background Color', {
          presetColors: BACKGROUND_PALETTE,
          includeTransparency: true
        }),
        createAdvancedColorProp('textColor', 'Text Color', {
          presetColors: TEXT_PALETTE
        }),
        {
          name: 'headerPadding',
          label: 'Header Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
        },
        {
          name: 'logoSize',
          label: 'Logo Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Advanced Settings',
      defaultOpen: false,
      props: [
        {
          name: 'enableShadow',
          label: 'Enable Shadow Effect',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'enableSticky',
          label: 'Enable Sticky Header',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'mobileMenuStyle',
          label: 'Mobile Menu Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'hamburger', label: 'Hamburger Menu' },
              { value: 'dropdown', label: 'Dropdown' },
              { value: 'slide', label: 'Slide Out' },
            ],
          },
        },
      ],
    },
  ],
}

export default HeaderSection
export { NavLink }