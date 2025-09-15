import { types } from 'react-bricks/rsc'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
  },
  {
    name: 'homepage',
    pluralName: 'Homepage',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'welcoming-section',     // Our professional welcoming section
      'categories-section',    // Our professional categories section
      'hero-brick',           // Keep for backwards compatibility
      // 'events-specials-section',  // Coming next
      // 'bookings-section',         // Coming next
    ],
  },
  {
    name: 'ordering',
    pluralName: 'Ordering Page',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'cart-section',         // Cart system with customizable cards
      'welcoming-section',    // Can reuse welcoming section
      'categories-section',   // Can reuse categories section
    ],
  },
  {
    name: 'menu',
    pluralName: 'Menu Page',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'menu-section',         // Menu page skeleton
      'categories-section',   // Can reuse categories section
      'cart-section',         // Cart integration
    ],
  },
  {
    name: 'card-system',
    pluralName: 'Card System',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'cart-section',         // Main card system
      'categories-section',   // Card-based categories
    ],
  },
  {
    name: 'header',
    pluralName: 'Header',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'header-section',       // Header skeleton
    ],
  },
  {
    name: 'footer',
    pluralName: 'Footer',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'footer-section',       // Footer skeleton
    ],
  },
  {
    name: 'blog',
    pluralName: 'Blog',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'title',
      'paragraph',
      'big-image',
      'video',
      'code',
      'tweet',
      'tweet-light',
      'blog-title',
      'newsletter-subscribe',
    ],
  },
  {
    name: 'layout',
    pluralName: 'layout',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    isEntity: true,
    allowedBlockTypes: ['header', 'footer'],
  },
]

export default pageTypes