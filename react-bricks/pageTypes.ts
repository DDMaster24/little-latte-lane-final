import { types } from 'react-bricks'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'welcoming-section',
      'categories-section',
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
      }
    ],
    allowedBlockTypes: [
      'welcoming-section',
      'categories-section',
      'simple-text-brick',
      'color-test-brick',
      'button-test-brick',
    ]
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
