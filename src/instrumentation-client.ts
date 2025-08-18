import * as Sentry from '@sentry/nextjs';

// Client-side initialization
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: process.env.NODE_ENV === 'development',

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  integrations: [
    Sentry.replayIntegration({
      // Capture 10% of all sessions,
      // plus 100% of sessions with an error
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Filter out noisy errors
  beforeSend(event) {
    // Don't send errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
      frame => frame.filename?.includes('chrome-extension://')
    )) {
      return null;
    }
    return event;
  },
});

// Export required hooks for Next.js 15 App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
