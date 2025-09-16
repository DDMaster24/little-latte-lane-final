import { types } from 'react-bricks/rsc'

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
      // Use the exact brick names from our bricks configuration
      'WelcomingSection',
      'CategoriesSection', 
      'EventsSpecialsSection',
      'BookingsSection',
      'DynamicCarousel',
      'MenuSection',
      'FooterSection',
      
      // Additional allowed bricks
      'hero-brick',
      'menu-display',
      'cart-section',
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