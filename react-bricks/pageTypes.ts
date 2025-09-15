import { types } from 'react-bricks/rsc'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      // Homepage components
      'welcoming-section',
      'categories-section', 
      'events-specials-section',
      'bookings-section',
      
      // Menu components
      'menu-hero',
      'menu-display',
      
      // Layout components
      'header-section',
      'footer-section',
      
      // Legacy components (for backwards compatibility)
      'hero-brick',
      'menu-section',
      'cart-section',
      
      // Blog components
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
]

export default pageTypes