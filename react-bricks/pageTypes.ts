import { types } from 'react-bricks/frontend'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [
      // Provide default content so pages aren't empty
      {
        id: 'default-welcome',
        type: 'WelcomingSection',
        props: {
          title: 'Welcome to Little Latte Lane',
          subtitle: 'Café & Deli - Where Great Food Meets Amazing Experiences',
          ctaText: 'Explore Menu',
          ctaLink: '/menu'
        }
      }
    ],
    allowedBlockTypes: [
      // Homepage Components
      'WelcomingSection',
      'CategoriesSection', 
      'EventsSpecialsSection',
      'BookingsSection',
      
      // Menu Components
      'MenuHero',
      'menu-drinks-section',
      'menu-main-food-section', 
      'menu-breakfast-sides-section',
      'menu-extras-specialties-section',
      
      // Restaurant Management Components
      'closure-banner',
      
      // Layout Components
      'FooterSection',
      'HeaderSection',
      
      // Legacy Components (for existing content compatibility)
      'welcoming-section',
      'categories-section', 
      'events-specials-section',
      'bookings-section',
      'dynamic-carousel',
      'menu-display',
      'cart-section',
      'footer-section',
      'feature-item',
      'badge-item',
      
      // Basic Content Components
      'hero-brick',
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
