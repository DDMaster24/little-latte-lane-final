import { NextResponse } from 'next/server';

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    deployment: {
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'localhost:3000',
    },
    services: {
      database: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'connected' : 'disconnected',
      payments: process.env.YOCO_SECRET_KEY ? 'configured' : 'not configured',
    },
  };

  return NextResponse.json(healthStatus, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
