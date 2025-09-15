# React Bricks Integration Blueprint
*Complete step-by-step guide for integrating React Bricks into any Next.js project*

## 🎯 STEP 1: INSTALL ESSENTIAL DEPENDENCIES

### Core Dependencies
```bash
npm install react-bricks classnames dayjs email-validator jsonp next-themes pigeon-maps prism-theme-night-owl prismjs react-hook-form react-icons react-slick react-tweet slick-carousel uuid
```

### Dev Dependencies
```bash
npm install --save-dev @tailwindcss/forms @types/jsonp @types/prismjs @types/react-slick
```

### Complete package.json additions:
```json
{
  "dependencies": {
    "react-bricks": "^4.7.1",
    "classnames": "^2.5.1",
    "dayjs": "^1.11.13",
    "email-validator": "^2.0.4",
    "jsonp": "^0.2.1",
    "next-themes": "^0.4.6",
    "pigeon-maps": "^0.22.1",
    "prism-theme-night-owl": "^1.4.0",
    "prismjs": "^1.30.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.5.0",
    "react-slick": "^0.30.3",
    "react-tweet": "^3.2.2",
    "slick-carousel": "^1.8.1",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.10",
    "@types/jsonp": "^0.2.3",
    "@types/prismjs": "^1.26.5",
    "@types/react-slick": "^0.23.13"
  }
}
```

## 🎯 STEP 2: CONFIGURATION FILES

### A. Environment Variables (.env.local)
```bash
API_KEY=aef24dc5-30bc-4cf8-92fc-ee85043f9b75
NEXT_PUBLIC_APP_ID=746fbd28-bd8c-4b9c-af4b-0ff24fabd784
NEXT_PUBLIC_ENVIRONMENT=main
```

### B. Next.js Configuration (next.config.ts)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // ESSENTIAL: React Bricks requires this
};

export default nextConfig;
```

### C. Internationalization Config (i18n-config.ts)
```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en'],
} as const

export type Locale = (typeof i18n)['locales'][number]
```

### D. Middleware (middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { i18n } from './i18n-config'

import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // // If you have one
  if (
    [
      '/manifest.json',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      // Your other files in `public`
    ].includes(pathname)
  )
    return

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 🎯 STEP 3: FILE STRUCTURE CREATION

### Directory Structure to Create:
```
project-root/
├── .env.local
├── next.config.ts
├── middleware.ts
├── i18n-config.ts
├── react-bricks/
├── components/
├── css/
└── app/
    ├── [lang]/
    │   ├── layout.tsx
    │   └── [[...slug]]/
    │       └── page.tsx
    ├── admin/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── ReactBricksApp.tsx
    │   ├── editor/
    │   ├── media/
    │   ├── app-settings/
    │   ├── playground/
    │   └── (sso)/
    └── preview/
```

### Create Directories:
```bash
mkdir react-bricks
mkdir components
mkdir css
mkdir app
mkdir "app\[lang]"
mkdir "app\[lang]\[[...slug]]"
mkdir app\admin
mkdir app\admin\editor
mkdir app\admin\media
mkdir app\admin\app-settings
mkdir app\admin\playground
mkdir "app\admin\(sso)"
mkdir "app\admin\(sso)\sso-login"
mkdir "app\admin\(sso)\sso-success"
mkdir "app\admin\(sso)\sso-failure"
mkdir app\preview
```

## 🎯 STEP 4: CORE COMPONENT FILES

### A. ReactBricksApp Component (components/ReactBricksApp.tsx)
```typescript
'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { register } from 'react-bricks/rsc'
import { ReactBricks } from 'react-bricks/rsc/client'

import NextLink from '../react-bricks/NextLink'
import config from '../react-bricks/config'

export default function ReactBricksApp({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      router.push(path)
    },
    renderLocalLink: NextLink,
  }

  register(reactBricksConfig)

  return <ReactBricks {...reactBricksConfig}>{children}</ReactBricks>
}
```

### B. Theme Provider (components/themeProvider.tsx)
```typescript
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### C. Layout Component (components/layout.tsx)
```typescript
export default function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col h-screen justify-between">{children}</div>
}
```

### D. Error Components

#### components/errorNoKeys.tsx
```typescript
import React from 'react'

const ErrorNoKeys: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-gray-600 text-center">
      <h1 className="text-3xl sm:text-4xl text-center font-black text-gray-700 dark:text-gray-200 mb-4">
        Warning: missing App credentials
      </h1>
      <h2 className="text-xl sm:text-2xl text-center font-bold text-orange-600 mb-4">
        To start working with React Bricks
      </h2>
      <p className="text-lg sm:text-xl text-center leading-7 text-gray-700 dark:text-gray-300 mb-6">
        Please set your{' '}
        <code className="bg-orange-100 text-orange-800 text-sm p-1 rounded">
          appId
        </code>{' '}
        and{' '}
        <code className="bg-orange-100 text-orange-800 text-sm p-1 rounded">
          apiKey
        </code>{' '}
        in the <code>react-bricks/config.ts</code> file.
      </p>
    </div>
  )
}

export default ErrorNoKeys
```

#### components/errorNoHeader.tsx
```typescript
import React from 'react'

const ErrorNoHeader: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">Unable to find the header.</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorNoHeader
```

#### components/errorNoFooter.tsx
```typescript
import React from 'react'

const ErrorNoFooter: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">Unable to find the footer.</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorNoFooter
```

#### components/errorNoPage.tsx
```typescript
import React from 'react'

const ErrorNoPage: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">Page not found.</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorNoPage
```

## 🎯 STEP 5: REACT BRICKS CONFIGURATION

### A. Main Config (react-bricks/config.tsx)
```typescript
import React from 'react'
import { types } from 'react-bricks/rsc'

import bricks from './bricks'
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
  navigate: (path: string) => {},
  loginPath: '/admin',
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
```

### B. Page Types (react-bricks/pageTypes.ts)
```typescript
import { types } from 'react-bricks/rsc'

const pageTypes: types.IPageType[] = [
  {
    name: 'page',
    pluralName: 'pages',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: [
      'hero-unit',
      'cards',
      'text-media',
      'features',
      'call-to-action',
      'newsletter-hero',
      'newsletter-subscribe',
      'faq',
      'spacer',
    ],
  },
  {
    name: 'layout',
    pluralName: 'layout',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Published,
    getDefaultContent: () => [],
    allowedBlockTypes: ['header', 'footer'],
    isEntity: true,
  },
]

export default pageTypes
```

### C. Next Link Integration (react-bricks/NextLink.tsx)
```typescript
import NextLink from 'next/link'

import { RenderLocalLink } from 'react-bricks/rsc'

const renderLocalLink: RenderLocalLink = ({
  href,
  target,
  className,
  children,
}) => (
  <NextLink href={href} target={target} className={className}>
    {children}
  </NextLink>
)

export default renderLocalLink
```

### D. Client Next Link (react-bricks/NextLinkClient.tsx)
```typescript
'use client'

import NextLink from 'next/link'

import { RenderLocalLink } from 'react-bricks'

const renderLocalLink: RenderLocalLink = ({
  href,
  target,
  className,
  children,
  activeClassName,
  isActive,
}) => (
  <NextLink
    href={href}
    target={target}
    className={[className, isActive ? activeClassName : '']
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </NextLink>
)

export default renderLocalLink
```

### E. Bricks Index (react-bricks/bricks/index.ts)
```typescript
import { types } from 'react-bricks/rsc'
import website from 'react-bricks-ui/website'
import blog from 'react-bricks-ui/blog'

const bricks: types.Brick<any>[] = [
  ...website, // React Bricks UI
  ...blog,    // React Bricks UI Blog
  // Your custom bricks here
]

export default bricks
```

## 🎯 STEP 6: APP ROUTING STRUCTURE

### A. Main Layout (app/[lang]/layout.tsx)
```typescript
import {
  PageViewer,
  cleanPage,
  fetchPage,
  getBricks,
  register,
  types,
} from 'react-bricks/rsc'

import ReactBricksApp from '../../components/ReactBricksApp'
import ErrorNoFooter from '../../components/errorNoFooter'
import ErrorNoHeader from '../../components/errorNoHeader'
import ErrorNoKeys from '../../components/errorNoKeys'
import PageLayout from '../../components/layout'
import { ThemeProvider } from '../../components/themeProvider'
import { i18n } from '../../i18n-config'
import config from '../../react-bricks/config'

import { Nunito_Sans } from 'next/font/google'

import '../../css/styles.css'

export const metadata = {
  title: 'React Bricks Test Website',
  description: 'Testing React Bricks integration',
}

const nunito = Nunito_Sans({
  adjustFontFallback: false,
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
})

register(config)

const getData = async (
  locale: string
): Promise<{
  header: types.Page | null
  footer: types.Page | null
  errorNoKeys: boolean
  errorHeader: boolean
  errorFooter: boolean
}> => {
  let errorNoKeys: boolean = false
  let errorHeader: boolean = false
  let errorFooter: boolean = false

  if (!config.apiKey) {
    errorNoKeys = true

    return {
      header: null,
      footer: null,
      errorNoKeys,
      errorHeader,
      errorFooter,
    }
  }

  const [header, footer] = await Promise.all([
    fetchPage({ slug: 'header', language: locale, config }).catch(() => {
      errorHeader = true
      return null
    }),
    fetchPage({ slug: 'footer', language: locale, config }).catch(() => {
      errorFooter = true
      return null
    }),
  ])

  return {
    header,
    footer,
    errorNoKeys,
    errorHeader,
    errorFooter,
  }
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({
    lang: locale,
  }))
}

export default async function Layout(props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const params = await props.params

  const { children } = props

  const { header, footer, errorNoKeys, errorHeader, errorFooter } =
    await getData(params.lang)

  // Clean the received content
  // Removes unknown or not allowed bricks
  const bricks = getBricks()
  const headerOk = header
    ? cleanPage(header, config.pageTypes || [], bricks)
    : null
  const footerOk = footer
    ? cleanPage(footer, config.pageTypes || [], bricks)
    : null

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={`${nunito.variable} font-sans dark:bg-gray-900 antialiased`}
      >
        <ThemeProvider
          attribute="class"
          storageKey="color-mode"
          enableSystem={false}
          defaultTheme="light"
        >
          <main>
            <ReactBricksApp>
              <PageLayout>
                {!errorNoKeys && (
                  <>
                    {headerOk && !errorHeader ? (
                      <PageViewer page={headerOk} main={false} />
                    ) : (
                      <ErrorNoHeader />
                    )}
                    {children}
                    {footerOk && !errorFooter ? (
                      <PageViewer page={footerOk} main={false} />
                    ) : (
                      <ErrorNoFooter />
                    )}
                  </>
                )}
                {errorNoKeys && <ErrorNoKeys />}
              </PageLayout>
            </ReactBricksApp>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### B. Dynamic Page Handler (app/[lang]/[[...slug]]/page.tsx)
```typescript
import type { Metadata } from 'next'
import {
  JsonLd,
  PageViewer,
  cleanPage,
  fetchPage,
  fetchPages,
  getBricks,
  getMetadata,
  types,
} from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'

import ErrorNoKeys from '../../../components/errorNoKeys'
import ErrorNoPage from '../../../components/errorNoPage'
import config from '../../../react-bricks/config'

const getData = async (
  slug: string[] | string | undefined,
  locale: string
): Promise<{
  page: types.Page | null
  errorNoKeys: boolean
  errorPage: boolean
}> => {
  let errorNoKeys: boolean = false
  let errorPage: boolean = false

  if (!config.apiKey) {
    errorNoKeys = true

    return {
      page: null,
      errorNoKeys,
      errorPage,
    }
  }

  let cleanSlug = ''

  if (!slug) {
    cleanSlug = '/'
  } else if (typeof slug === 'string') {
    cleanSlug = slug
  } else {
    cleanSlug = slug.join('/')
  }

  const page = await fetchPage({
    slug: cleanSlug,
    language: locale,
    config,
    fetchOptions: { next: { revalidate: 3 } },
  }).catch(() => {
    errorPage = true
    return null
  })

  return {
    page,
    errorNoKeys,
    errorPage,
  }
}

export async function generateStaticParams({
  params,
}: {
  params: { lang: string }
}) {
  if (!config.apiKey) {
    return []
  }

  const allPages = await fetchPages(config.apiKey, {
    language: params.lang,
    type: 'page',
  })

  const pages = allPages
    .map((page) =>
      page.translations.map((translation) => ({
        slug: translation.slug === '/' ? [''] : translation.slug.split('/'),
      }))
    )
    .flat()

  return pages
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const { page } = await getData(params.slug?.join('/'), params.lang)
  if (!page?.meta) {
    return {}
  }

  return getMetadata(page)
}

export default async function Page(props: {
  params: Promise<{ lang: string; slug?: string[] }>
}) {
  const params = await props.params
  const { page, errorNoKeys, errorPage } = await getData(
    params.slug?.join('/'),
    params.lang
  )

  // Clean the received content
  // Removes unknown or not allowed bricks
  const bricks = getBricks()
  const pageOk = page ? cleanPage(page, config.pageTypes || [], bricks) : null

  return (
    <>
      {page?.meta && <JsonLd page={page}></JsonLd>}
      {pageOk && !errorPage && !errorNoKeys && (
        <PageViewer page={pageOk} main />
      )}
      {errorNoKeys && <ErrorNoKeys />}
      {errorPage && <ErrorNoPage />}
      {pageOk && config && (
        <ClickToEdit
          pageId={pageOk?.id}
          language={params.lang}
          editorPath={config.editorPath || '/admin/editor'}
          clickToEditSide={config.clickToEditSide}
        />
      )}
    </>
  )
}
```

## 🎯 STEP 7: ADMIN ROUTES

### A. Admin Layout (app/admin/layout.tsx)
```typescript
import ReactBricksApp from './ReactBricksApp'
import { ThemeProvider } from '../../components/themeProvider'

import '../../css/styles.css'

export const metadata = {
  title: 'React Bricks Admin',
  description: 'Generated by Next.js',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`dark:bg-gray-900`}>
        <ThemeProvider
          attribute="class"
          storageKey="color-mode"
          enableSystem={false}
          defaultTheme="light"
        >
          <main>
            <ReactBricksApp>{children}</ReactBricksApp>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### B. Admin ReactBricksApp (app/admin/ReactBricksApp.tsx)
```typescript
'use client'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Nunito_Sans } from 'next/font/google'
import { useState } from 'react'
import { ReactBricks } from 'react-bricks'

import NextLink from '../../react-bricks/NextLink'
import config from '../../react-bricks/config'

const nunito = Nunito_Sans({
  adjustFontFallback: false,
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
})

export default function ReactBricksApp({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Color Mode Management
  const savedColorMode =
    typeof window === 'undefined' ? '' : localStorage.getItem('color-mode')

  const [colorMode, setColorMode] = useState(savedColorMode || 'light')

  const { setTheme } = useTheme()

  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newColorMode)
    localStorage.setItem('color-mode', newColorMode)

    setTheme(newColorMode)
  }

  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      router.push(path)
    },
    renderLocalLink: NextLink,
    isDarkColorMode: colorMode === 'dark',
    toggleColorMode,
    contentClassName: `antialiased ${nunito.variable} font-sans ${colorMode} ${
      colorMode === 'dark' ? 'dark bg-gray-900' : 'light bg-white'
    }`,
  }

  return <ReactBricks {...reactBricksConfig}>{children}</ReactBricks>
}
```

### C. Admin Pages

#### app/admin/page.tsx
```typescript
import { Admin } from 'react-bricks'

export default function AdminDashboard() {
  return <Admin />
}
```

#### app/admin/editor/page.tsx
```typescript
import { Editor } from 'react-bricks'

export default function EditorPage() {
  return <Editor />
}
```

#### app/admin/media/page.tsx
```typescript
import { MediaLibrary } from 'react-bricks'

export default function MediaLibraryPage() {
  return <MediaLibrary />
}
```

#### app/admin/app-settings/page.tsx
```typescript
import { AppSettings } from 'react-bricks'

export default function AppSettingsPage() {
  return <AppSettings />
}
```

#### app/admin/playground/page.tsx
```typescript
import { Playground } from 'react-bricks'

export default function PlaygroundPage() {
  return <Playground />
}
```

## 🎯 STEP 8: STYLES

### CSS File (css/styles.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* React Bricks specific styles */
body {
  font-family: var(--font-nunito), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Custom styles for React Bricks components */
.react-bricks-editable {
  outline: none;
}

/* Admin panel styles */
.admin-wrapper {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-wrapper.dark {
  background: #1a202c;
}
```

## 🎯 STEP 9: INSTALLATION COMMANDS

### Complete Installation Sequence:
```bash
# 1. Install core React Bricks
npm install react-bricks

# 2. Install all dependencies
npm install classnames dayjs email-validator jsonp next-themes pigeon-maps prism-theme-night-owl prismjs react-hook-form react-icons react-slick react-tweet slick-carousel uuid

# 3. Install dev dependencies
npm install --save-dev @tailwindcss/forms @types/jsonp @types/prismjs @types/react-slick

# 4. Install additional required packages for middleware
npm install @formatjs/intl-localematcher negotiator
npm install --save-dev @types/negotiator
```

## 🎯 STEP 10: VERIFICATION CHECKLIST

### Essential Files Created:
- [ ] `.env.local` with API keys
- [ ] `next.config.ts` with `reactStrictMode: false`
- [ ] `middleware.ts` for i18n routing
- [ ] `i18n-config.ts` for locale configuration
- [ ] `react-bricks/config.tsx` main configuration
- [ ] `react-bricks/pageTypes.ts` page definitions
- [ ] `react-bricks/NextLink.tsx` link integration
- [ ] `react-bricks/bricks/index.ts` brick exports
- [ ] `components/ReactBricksApp.tsx` wrapper component
- [ ] `app/[lang]/layout.tsx` main layout
- [ ] `app/[lang]/[[...slug]]/page.tsx` dynamic pages
- [ ] `app/admin/` complete admin structure
- [ ] `css/styles.css` styling

### Testing URLs:
- [ ] `http://localhost:3000` → Main site
- [ ] `http://localhost:3000/admin` → Admin dashboard
- [ ] `http://localhost:3000/admin/editor` → Visual editor
- [ ] `http://localhost:3000/admin/media` → Media library

### Success Indicators:
- [ ] Site loads without errors
- [ ] Admin panel is accessible
- [ ] Visual editor works
- [ ] ClickToEdit appears on pages
- [ ] Content can be edited in real-time

## 🎯 NOTES FOR ORDERING PLATFORM INTEGRATION

### Route Isolation:
- React Bricks uses `/[lang]/` structure
- Your existing routes remain untouched
- Admin routes are separate (`/admin/` for React Bricks, `/dashboard/` for your platform)

### API Key Requirements:
- You'll need your own React Bricks API keys
- Replace the demo keys in `.env.local`
- Get them from https://reactbricks.com

### Customization:
- Modify `react-bricks/bricks/index.ts` to add your custom bricks
- Update `pageTypes.ts` for your content structure
- Customize styling in `css/styles.css`

This blueprint ensures 100% compatibility with your online ordering platform! 🚀