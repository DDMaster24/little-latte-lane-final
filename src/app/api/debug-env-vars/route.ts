import { NextResponse } from 'next/server'

export async function GET() {
  // Debug what environment variables are actually being read
  const envCheck = {
    // Public vars (should be available client-side)
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID || 'NOT_SET',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'NOT_SET',
    
    // Private vars (server-side only)
    API_KEY: process.env.API_KEY ? 'SET_BUT_HIDDEN' : 'NOT_SET',
    API_KEY_LENGTH: process.env.API_KEY?.length || 0,
    API_KEY_STARTS_WITH: process.env.API_KEY?.substring(0, 8) || 'NONE',
    
    // Check if old variable names still exist
    OLD_NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'STILL_EXISTS' : 'NOT_SET',
    
    // Runtime check
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_VERCEL'
  }

  return NextResponse.json(envCheck, { status: 200 })
}