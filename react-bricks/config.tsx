import { types } from 'react-bricks/rsc'

import bricks from './bricks'
import pageTypes from './pageTypes'
import NextLink from './NextLink'

const config: types.ReactBricksConfig = {
  appId: process.env.NEXT_PUBLIC_REACT_BRICKS_APP_ID || '',
  apiKey: process.env.REACT_BRICKS_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_REACT_BRICKS_ENVIRONMENT,
  bricks,
  pageTypes,
  customFields: [],
  logo: '/images/logo.svg',
  loginUI: {},
  contentClassName: '',
  renderLocalLink: NextLink,
  navigate: (_path: string) => {},
  loginPath: '/admin-rb',
  editorPath: '/admin-rb/editor',
  mediaLibraryPath: '/admin-rb/media',
  playgroundPath: '/admin-rb/playground',
  appSettingsPath: '/admin-rb/app-settings',
  previewPath: '/preview',
  // getAdminMenu: () => [],
  isDarkColorMode: true, // Match our neon theme
  toggleColorMode: () => {},
  useCssInJs: false,
  appRootElement: 'body',
  clickToEditSide: types.ClickToEditSide.BottomRight,
  enableAutoSave: true,
  disableSaveIfInvalidProps: false,
  enablePreview: true,
  blockIconsPosition: types.BlockIconsPosition.OutsideBlock,
  enableUnsplash: true,
  unsplashApiKey: '',
  enablePreviewImage: true,
  enableDefaultEmbedBrick: true,
  allowAccentsInSlugs: true,
}

export default config