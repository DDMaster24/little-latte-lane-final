export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Setting this option to true will print useful information to the console while you're setting up Sentry
      debug: process.env.NODE_ENV === 'development',
      
      // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
      // spotlight: process.env.NODE_ENV === 'development',
      
      environment: process.env.NODE_ENV,
      
      // Server-side specific options
      integrations: [
        // Performance monitoring
        // Add specific integrations you need
      ],
      
      // Filter out noisy transactions
      beforeSendTransaction(transaction) {
        // Don't send health check transactions
        if (transaction.transaction?.includes('/api/health')) {
          return null;
        }
        return transaction;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      environment: process.env.NODE_ENV,
    });
  }
}

// Export required hooks for Next.js 15 App Router
export const onRequestError = async (error: Error) => {
  const { captureException } = await import('@sentry/nextjs');
  captureException(error);
};
