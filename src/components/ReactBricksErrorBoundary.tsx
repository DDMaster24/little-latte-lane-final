/**
 * React Bricks Error Boundary
 * Catches and handles React Bricks related errors gracefully
 */

'use client';

import React, { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ReactBricksErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('React Bricks Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ 
      hasError: true, 
      error, 
      errorInfo 
    });

    // Send to error reporting service if available
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Force a hard refresh to reset React Bricks state
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
              <CardTitle className="text-red-400 text-xl">
                React Bricks Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300 text-center">
                <p className="mb-2">Something went wrong with the content management system.</p>
                <p className="text-sm text-gray-400">
                  This is likely a temporary issue that can be resolved by refreshing the page.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-400 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-red-400 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Go Home
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center mt-4">
                If this problem persists, please contact support.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}