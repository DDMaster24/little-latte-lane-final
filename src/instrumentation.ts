export async function register() {
  // Skip Sentry initialization if no valid DSN is provided
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN || 
      process.env.NEXT_PUBLIC_SENTRY_DSN === 'your_sentry_dsn_here' ||
      process.env.NEXT_PUBLIC_SENTRY_DSN.includes('placeholder')) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Dramatically reduce sampling in development for less noise
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,
      
      // Disable debug logging in development to reduce console noise
      debug: false,
      
      environment: process.env.NODE_ENV,
      
      // Server-side specific options
      integrations: [
        // Performance monitoring
        // Add specific integrations you need
      ],
      
      // Filter out noisy transactions
      beforeSendTransaction(transaction) {
        // Don't send health check transactions or common routes in dev
        if (process.env.NODE_ENV === 'development') {
          if (transaction.transaction?.includes('/api/health') ||
              transaction.transaction?.includes('/favicon.ico') ||
              transaction.transaction?.includes('/_next/') ||
              transaction.transaction?.includes('/images/')) {
            return null;
          }
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
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }
}

// Export required hooks for Next.js 15 App Router
export const onRequestError = async (error: Error) => {
  const { captureException } = await import('@sentry/nextjs');
  captureException(error);
};
