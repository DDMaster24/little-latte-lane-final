/**
 * Debug API - Check current URL configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCallbackUrls } from '@/lib/yoco';

export async function GET(request: NextRequest) {
  const testOrderId = 'test-order-123';
  const urls = generateCallbackUrls(testOrderId);
  
  return NextResponse.json({
    message: 'URL Configuration Debug',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    },
    requestInfo: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    },
    generatedUrls: urls,
    currentUrl: request.url,
  });
}
