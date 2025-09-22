import { types } from 'react-bricks/frontend'

import bricks from './bricks/index'
import pageTypes from './pageTypes'
import NextLink from './NextLink'

const config: types.ReactBricksConfig = {
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'main',
  bricks,
  pageTypes,
  customFields: [],
  logo: '/images/logo.svg',
  loginUI: {
    logo: '/images/logo.svg',
    logoWidth: 120,
    logoHeight: 60,
  },
  contentClassName: '',
  renderLocalLink: NextLink,
  navigate: (path: string) => {
    // Navigate in same tab instead of opening new tab
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  },
  loginPath: '/admin/cms',
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
  enableDefaultEmbedBrick: false,
  allowAccentsInSlugs: true,
}

export default config
