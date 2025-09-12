import { types } from 'react-bricks'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      // Layout bricks
      'welcoming-section',
      'categories-section',
      'events-specials-section',
      'bookings-section',
      'header',
      'footer',
      
      // Menu bricks
      'menu-hero-brick',
      'menu-category-brick',
      'menu-item-brick',
      
      // Content bricks
      'rich-text',
      'image-gallery',
      'gallery-image',
      'testimonials',
      'testimonial-item',
      'call-to-action',
      'stats',
      'stat-item',
      
      // Test bricks
      'simple-text-brick',
      'color-test-brick', 
      'button-test-brick',
    ]
  },
  {
    name: 'test-page',
    pluralName: 'test pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      {
        id: 'simple-text-1',
        type: 'simple-text-brick',
        props: {}
      },
      {
        id: 'color-test-1',
        type: 'color-test-brick',
        props: {}
      },
      {
        id: 'button-test-1',
        type: 'button-test-brick',
        props: {}
      }
    ],
    allowedBlockTypes: [
      'simple-text-brick',
      'color-test-brick',
      'button-test-brick',
      'welcoming-section',
      'categories-section',
      'events-specials-section',
      'bookings-section',
      'menu-hero-brick',
      'menu-category-brick',
      'menu-item-brick',
      'rich-text',
      'image-gallery',
      'testimonials',
      'call-to-action',
      'stats',
    ]
  },
  {
    name: 'home', 
    pluralName: 'home pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      {
        id: 'welcoming-1',
        type: 'welcoming-section',
        props: {}
      },
      {
        id: 'categories-1', 
        type: 'categories-section',
        props: {}
      },
      {
        id: 'events-specials-1',
        type: 'events-specials-section',
        props: {}
      },
      {
        id: 'bookings-1',
        type: 'bookings-section',
        props: {}
      }
    ],
    allowedBlockTypes: [
      'welcoming-section',
      'categories-section',
      'events-specials-section',
      'bookings-section',
      'rich-text',
      'image-gallery',
      'testimonials',
      'call-to-action',
      'stats',
      'menu-hero-brick',
      'menu-category-brick',
      'menu-item-brick',
      'simple-text-brick',
      'color-test-brick',
      'button-test-brick',
    ]
  },
  {
    name: 'menu',
    pluralName: 'menu pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      {
        id: 'menu-hero-1',
        type: 'menu-hero-brick',
        props: {}
      },
      {
        id: 'menu-category-1',
        type: 'menu-category-brick',
        props: {}
      },
      {
        id: 'menu-category-2',
        type: 'menu-category-brick',
        props: {}
      },
      {
        id: 'menu-item-1',
        type: 'menu-item-brick',
        props: {}
      },
      {
        id: 'menu-item-2',
        type: 'menu-item-brick',
        props: {}
      }
    ],
    allowedBlockTypes: [
      'menu-hero-brick',
      'menu-category-brick',
      'menu-item-brick',
      'rich-text',
      'image-gallery',
      'testimonials',
      'call-to-action',
      'stats',
      'simple-text-brick',
      'color-test-brick',
      'button-test-brick',
    ]
  },
  {
    name: 'content',
    pluralName: 'content pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      {
        id: 'rich-text-1',
        type: 'rich-text',
        props: {}
      },
      {
        id: 'image-gallery-1',
        type: 'image-gallery',
        props: {}
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        props: {}
      },
      {
        id: 'call-to-action-1',
        type: 'call-to-action',
        props: {}
      },
      {
        id: 'stats-1',
        type: 'stats',
        props: {}
      }
    ],
    allowedBlockTypes: [
      'rich-text',
      'image-gallery',
      'gallery-image',
      'testimonials',
      'testimonial-item',
      'call-to-action',
      'stats',
      'stat-item',
      'welcoming-section',
      'categories-section',
      'events-specials-section',
      'bookings-section',
    ]
  },
  {
    name: 'layout',
    pluralName: 'layout',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      {
        id: 'header-1',
        type: 'header',
        props: {}
      },
      {
        id: 'footer-1',
        type: 'footer',
        props: {}
      }
    ],
    isEntity: true,
    allowedBlockTypes: ['header', 'footer'],
  },
]

export default pageTypes
