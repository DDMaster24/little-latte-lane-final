/**
 * React Bricks Safe Wrapper
 * Provides additional safety checks for React Bricks initialization
 */

'use client';

import React, { Component, type ReactNode } from 'react';
import { ReactBricks } from 'react-bricks';
import type { types } from 'react-bricks/frontend';

interface Props {
  config: types.ReactBricksConfig;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

export class ReactBricksSafeWrapper extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): State | null {
    // Check if this is the specific React Bricks length error
    if (error.message.includes('length') || error.message.includes('Cannot read properties of undefined')) {
      console.warn('React Bricks initialization error detected, will retry...', error);
      return { hasError: true, retryCount: 0 };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Bricks Safe Wrapper caught error:', error, errorInfo);
    
    // Auto-retry for React Bricks initialization errors
    if (this.state.retryCount < 3 && (
      error.message.includes('length') || 
      error.message.includes('Cannot read properties of undefined')
    )) {
      this.retryTimer = setTimeout(() => {
        console.log(`Retrying React Bricks initialization (attempt ${this.state.retryCount + 1}/3)`);
        this.setState({ 
          hasError: false, 
          retryCount: this.state.retryCount + 1 
        });
      }, 1000 * (this.state.retryCount + 1)); // Progressive delay
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show loading state during retry
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-sm text-gray-400">
              Initializing React Bricks... (Attempt {this.state.retryCount + 1}/3)
            </p>
          </div>
        </div>
      );
    }

    try {
      return <ReactBricks {...this.props.config}>{this.props.children}</ReactBricks>;
    } catch (error) {
      // If immediate error occurs, trigger retry mechanism
      console.error('Immediate React Bricks error:', error);
      if (this.state.retryCount < 3) {
        setTimeout(() => {
          this.setState({ 
            hasError: true, 
            retryCount: this.state.retryCount 
          });
        }, 100);
      }
      
      // Return safe fallback
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-sm text-gray-400">Loading content management system...</p>
          </div>
        </div>
      );
    }
  }
}