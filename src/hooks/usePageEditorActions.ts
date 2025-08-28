'use client';

import { useState } from 'react';

export interface PageEditorHookReturn {
  saveElementStyles: (pageName: string, elementId: string, styles: Record<string, string | number | boolean>) => Promise<{ success: boolean; error?: string }>;
  saveElementText: (pageName: string, elementId: string, textContent: string) => Promise<{ success: boolean; error?: string }>;
  getElementStyles: (pageName: string, elementId: string) => Promise<{ success: boolean; styles?: Record<string, string | number | boolean>; error?: string }>;
  getElementText: (pageName: string, elementId: string) => Promise<{ success: boolean; text?: string; error?: string }>;
  isLoading: boolean;
}

export function usePageEditorActions(): PageEditorHookReturn {
  const [isLoading, setIsLoading] = useState(false);

  const saveElementStyles = async (
    pageName: string, 
    elementId: string, 
    styles: Record<string, string | number | boolean>
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/page-editor/styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageName, elementId, styles }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const saveElementText = async (
    pageName: string, 
    elementId: string, 
    textContent: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/page-editor/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageName, elementId, textContent }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const getElementStyles = async (
    pageName: string, 
    elementId: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/page-editor/styles?pageName=${pageName}&elementId=${elementId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const getElementText = async (
    pageName: string, 
    elementId: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/page-editor/text?pageName=${pageName}&elementId=${elementId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveElementStyles,
    saveElementText,
    getElementStyles,
    getElementText,
    isLoading
  };
}
