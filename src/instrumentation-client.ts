import * as Sentry from '@sentry/nextjs';

// Skip Sentry initialization if no valid DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN && 
    process.env.NEXT_PUBLIC_SENTRY_DSN !== 'your_sentry_dsn_here' &&
    !process.env.NEXT_PUBLIC_SENTRY_DSN.includes('placeholder')) {
  
  // Client-side initialization
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Dramatically reduce sampling in development for less noise
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,

    // Disable debug logging to reduce console noise
    debug: false,

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
}

// Export required hooks for Next.js 15 App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
