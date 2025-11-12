import React from 'react'
import { Text, Repeater, types } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Footer Link
//========================================
interface FooterLinkProps {
  linkText: types.TextValue
  linkUrl: string
  linkIcon?: types.TextValue
  showIcon: boolean
  linkTarget: '_self' | '_blank'
}

const FooterLink: types.Brick<FooterLinkProps> = ({
  linkText,
  linkUrl = '/',
  linkIcon,
  showIcon = true,
  linkTarget = '_self'
}) => {
  return (
    <Link 
      href={linkUrl} 
      target={linkTarget}
      className="flex items-center gap-2 text-gray-300 hover:text-neonCyan transition-colors duration-300 text-sm"
    >
      {showIcon && linkIcon && (
        <Text
          propName="linkIcon"
          value={linkIcon}
          renderBlock={(props) => (
            <span className="text-sm">{props.children}</span>
          )}
          placeholder="📄"
        />
      )}
      <Text
        propName="linkText"
        value={linkText}
        renderBlock={(props) => (
          <span>{props.children}</span>
        )}
        placeholder="Link"
      />
    </Link>
  )
}

FooterLink.schema = {
  name: 'footer-link',
  label: 'Footer Link',
  getDefaultProps: () => ({
    linkText: 'Link',
    linkUrl: '/',
    linkIcon: '📄',
    showIcon: true,
    linkTarget: '_self'
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      name: 'linkUrl',
      label: 'Link URL',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'linkTarget',
      label: 'Link Target',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: '_self', label: 'Same Window' },
          { value: '_blank', label: 'New Window' },
        ],
      },
    },
    {
      name: 'showIcon',
      label: 'Show Icon',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

//========================================
// Nested Component: Footer Column
//========================================
interface FooterColumnProps {
  columnTitle: types.TextValue
  columnLinks: types.RepeaterItems
  showTitle: boolean
}

const FooterColumn: types.Brick<FooterColumnProps> = ({
  columnTitle,
  columnLinks,
  showTitle = true
}) => {
  return (
    <div className="space-y-3">
      {showTitle && (
        <Text
          propName="columnTitle"
          value={columnTitle}
          renderBlock={(props) => (
            <h3 className="text-neonCyan font-semibold text-lg mb-4">
              {props.children}
            </h3>
          )}
          placeholder="Quick Links"
        />
      )}
      
      <div className="space-y-2">
        <Repeater
          propName="columnLinks"
          items={columnLinks}
          renderWrapper={(items) => (
            <div className="space-y-2">
              {items}
            </div>
          )}
        />
      </div>
    </div>
  )
}

FooterColumn.schema = {
  name: 'footer-column',
  label: 'Footer Column',
  getDefaultProps: () => ({
    columnTitle: 'Quick Links',
    showTitle: true,
    columnLinks: [
      {
        type: 'footer-link',
        props: {
          linkText: 'Home',
          linkUrl: '/',
          linkIcon: '🏠',
          showIcon: true,
          linkTarget: '_self'
        }
      },
      {
        type: 'footer-link',
        props: {
          linkText: 'Menu',
          linkUrl: '/menu',
          linkIcon: '🍽️',
          showIcon: true,
          linkTarget: '_self'
        }
      }
    ]
  }),
  hideFromAddMenu: true,
  repeaterItems: [
    {
      name: 'columnLinks',
      itemType: 'footer-link',
      itemLabel: 'Footer Link',
      min: 0,
      max: 10
    }
  ],
  sideEditProps: [
    {
      name: 'showTitle',
      label: 'Show Column Title',
      type: types.SideEditPropType.Boolean,
    },
  ],
}

//========================================
// Main Component: Footer Section
//========================================
interface FooterSectionProps {
  siteName: types.TextValue
  tagline?: types.TextValue
  copyrightText: types.TextValue
  footerColumns: types.RepeaterItems
  backgroundColor: string
  textColor: { color: string }
  accentColor: { color: string }
  footerPadding: 'sm' | 'md' | 'lg'
  footerLayout: '1-col' | '2-col' | '3-col' | '4-col'
  showTagline: boolean
  showCopyright: boolean
  enableBorder: boolean
  borderStyle: 'solid' | 'neon' | 'gradient'
}

const FooterSection: types.Brick<FooterSectionProps> = ({
  siteName,
  tagline,
  copyrightText,
  footerColumns,
  backgroundColor = '#0a0a0a',
  textColor = { color: '#ffffff' },
  accentColor = { color: '#00ffff' },
  footerPadding = 'md',
  footerLayout = '3-col',
  showTagline = true,
  showCopyright = true,
  enableBorder = true,
  borderStyle = 'neon'
}) => {
  const getPaddingClass = () => {
    switch (footerPadding) {
      case 'sm': return 'py-8 px-4'
      case 'md': return 'py-12 px-4 xs:px-6 sm:px-8'
      case 'lg': return 'py-16 px-6 xs:px-8 sm:px-12'
      default: return 'py-12 px-4 xs:px-6 sm:px-8'
    }
  }

  const getGridClass = () => {
    switch (footerLayout) {
      case '1-col': return 'grid grid-cols-1'
      case '2-col': return 'grid grid-cols-1 md:grid-cols-2'
      case '3-col': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case '4-col': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getBorderClass = () => {
    if (!enableBorder) return ''
    
    switch (borderStyle) {
      case 'solid': return 'border-t border-gray-600'
      case 'neon': return 'border-t border-neonCyan shadow-neon'
      case 'gradient': return 'border-t border-transparent bg-gradient-to-r from-neonCyan via-neonPink to-neonYellow'
      default: return 'border-t border-neonCyan shadow-neon'
    }
  }

  return (
    <footer 
      className={`w-full ${getBorderClass()} mt-8`}
      style={{ 
        backgroundColor,
        color: textColor.color
      }}
    >
      <div className={`container-wide ${getPaddingClass()}`}>
        
        {/* Header Section */}
        <div className="text-center mb-8 xs:mb-12">
          <Text
            propName="siteName"
            value={siteName}
            renderBlock={(props) => (
              <h2 
                className="text-2xl xs:text-3xl font-bold mb-4"
                style={{ color: accentColor.color }}
              >
                {props.children}
              </h2>
            )}
            placeholder="Little Latte Lane"
          />
          
          {showTagline && tagline && (
            <Text
              propName="tagline"
              value={tagline}
              renderBlock={(props) => (
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  {props.children}
                </p>
              )}
              placeholder="Where Great Food Meets Amazing Experiences"
            />
          )}
        </div>

        {/* Footer Columns */}
        <div className={`${getGridClass()} gap-8 xs:gap-12 mb-8 xs:mb-12`}>
          <Repeater
            propName="footerColumns"
            items={footerColumns}
            renderWrapper={(items) => (
              <>
                {items}
              </>
            )}
          />
        </div>

        {/* Copyright Section */}
        {showCopyright && (
          <div className="pt-8 border-t border-gray-700/50 text-center">
            <Text
              propName="copyrightText"
              value={copyrightText}
              renderBlock={(props) => (
                <p className="text-gray-400 text-sm">
                  {props.children}
                </p>
              )}
              placeholder="© 2024 Little Latte Lane. All rights reserved."
            />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-neonPink rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-neonYellow rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </footer>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
FooterSection.schema = {
  name: 'footer-section',
  label: 'Footer Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    siteName: 'Little Latte Lane',
    tagline: 'Where Great Food Meets Amazing Experiences',
    copyrightText: '© 2024 Little Latte Lane. All rights reserved.',
    backgroundColor: '#0a0a0a',
    textColor: { color: '#ffffff' },
    accentColor: { color: '#00ffff' },
    footerPadding: 'md',
    footerLayout: '3-col',
    showTagline: true,
    showCopyright: true,
    enableBorder: true,
    borderStyle: 'neon',
    footerColumns: [
      {
        type: 'footer-column',
        props: {
          columnTitle: 'Quick Links',
          showTitle: true,
          columnLinks: [
            {
              type: 'footer-link',
              props: {
                linkText: 'Home',
                linkUrl: '/',
                linkIcon: '🏠',
                showIcon: true,
                linkTarget: '_self'
              }
            },
            {
              type: 'footer-link',
              props: {
                linkText: 'Menu',
                linkUrl: '/menu',
                linkIcon: '🍽️',
                showIcon: true,
                linkTarget: '_self'
              }
            },
            {
              type: 'footer-link',
              props: {
                linkText: 'Bookings',
                linkUrl: '/bookings',
                linkIcon: '📅',
                showIcon: true,
                linkTarget: '_self'
              }
            }
          ]
        }
      },
      {
        type: 'footer-column',
        props: {
          columnTitle: 'Legal',
          showTitle: true,
          columnLinks: [
            {
              type: 'footer-link',
              props: {
                linkText: 'Privacy Policy',
                linkUrl: '/privacy-policy',
                linkIcon: '🔒',
                showIcon: true,
                linkTarget: '_self'
              }
            },
            {
              type: 'footer-link',
              props: {
                linkText: 'Terms of Service',
                linkUrl: '/terms',
                linkIcon: '📋',
                showIcon: true,
                linkTarget: '_self'
              }
            }
          ]
        }
      },
      {
        type: 'footer-column',
        props: {
          columnTitle: 'Contact',
          showTitle: true,
          columnLinks: [
            {
              type: 'footer-link',
              props: {
                linkText: 'Email Us',
                linkUrl: 'mailto:info@littlelattlane.com',
                linkIcon: '📧',
                showIcon: true,
                linkTarget: '_blank'
              }
            },
            {
              type: 'footer-link',
              props: {
                linkText: 'Location',
                linkUrl: '/location',
                linkIcon: '📍',
                showIcon: true,
                linkTarget: '_self'
              }
            }
          ]
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'footerColumns',
      itemType: 'footer-column',
      itemLabel: 'Footer Column',
      min: 1,
      max: 6
    }
  ],

  sideEditProps: [
    {
      groupName: 'Content Settings',
      defaultOpen: true,
      props: [
        {
          name: 'showTagline',
          label: 'Show Tagline',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showCopyright',
          label: 'Show Copyright',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'footerLayout',
          label: 'Footer Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: '1-col', label: '1 Column' },
              { value: '2-col', label: '2 Columns' },
              { value: '3-col', label: '3 Columns' },
              { value: '4-col', label: '4 Columns' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Design & Styling',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('backgroundColor', 'Background Color', {
          presetColors: BACKGROUND_PALETTE,
          includeTransparency: true
        }),
        createAdvancedColorProp('textColor', 'Text Color', {
          presetColors: TEXT_PALETTE
        }),
        createAdvancedColorProp('accentColor', 'Accent Color', {
          presetColors: TEXT_PALETTE
        }),
        {
          name: 'footerPadding',
          label: 'Footer Padding',
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
      groupName: 'Border Settings',
      defaultOpen: false,
      props: [
        {
          name: 'enableBorder',
          label: 'Enable Top Border',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'borderStyle',
          label: 'Border Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'neon', label: 'Neon Effect' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
          show: (props) => props.enableBorder,
        },
      ],
    },
  ],
}

export default FooterSection
export { FooterLink, FooterColumn }
