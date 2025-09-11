import { types } from 'react-bricks'

import bricks from './bricks'
import pageTypes from './pageTypes'
import NextLink from './NextLink'

const config: types.ReactBricksConfig = {
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  bricks,
  pageTypes,
  customFields: [],
  logo: '/logo.svg',
  loginUI: {},
  contentClassName: '',
  renderLocalLink: NextLink,
  navigate: (_path: string) => {},
  loginPath: '/admin/login',
  editorPath: '/admin/editor',
  mediaLibraryPath: '/admin/media',
  playgroundPath: '/admin/playground',
  appSettingsPath: '/admin/app-settings',
  previewPath: '/preview',
  isDarkColorMode: false,
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
