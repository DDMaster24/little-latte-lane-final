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
    pluralName: 'homepage',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'lll-hero',
      'lll-welcoming-section', 
      'lll-categories-section', 
      'lll-events-specials-section', 
      'lll-bookings-section'
    ],
  },
  {
    name: 'home',
    pluralName: 'home pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: ['hero-section', 'welcoming-section', 'categories-section', 'events-specials-section', 'footer-section'],
  },
  {
    name: 'menu',
    pluralName: 'menu pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: ['menu-section', 'cart-sidebar'],
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