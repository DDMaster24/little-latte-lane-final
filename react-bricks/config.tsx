import { types } from 'react-bricks/rsc'

import bricks from './bricks/index'
import pageTypes from './pageTypes'
import NextLink from './NextLink'

const config: types.ReactBricksConfig = {
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  apiKey: process.env.API_KEY || '',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  bricks,
  pageTypes,
  customFields: [],
  logo: '/logo.svg',
  loginUI: {},
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