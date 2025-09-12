import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'Present' : 'Missing',
      APP_ID: process.env.NEXT_PUBLIC_APP_ID ? 'Present' : 'Missing',
      ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'Not set'
    },
    tests: []
  }

  // Test 1: Session endpoint
  try {
    const sessionResponse = await fetch('https://api.reactbricks.com/v2/admin/session?refreshToken=true', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'X-App-Id': process.env.NEXT_PUBLIC_APP_ID || '',
        'Content-Type': 'application/json'
      }
    })
    
    results.tests.push({
      name: 'Session Endpoint',
      status: sessionResponse.status,
      success: sessionResponse.ok,
      response: sessionResponse.ok ? await sessionResponse.json() : await sessionResponse.text()
    })
  } catch (error) {
    results.tests.push({
      name: 'Session Endpoint',
      status: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: App endpoint
  try {
    const appResponse = await fetch(`https://api.reactbricks.com/v2/apps/${process.env.NEXT_PUBLIC_APP_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    results.tests.push({
      name: 'App Endpoint',
      status: appResponse.status,
      success: appResponse.ok,
      response: appResponse.ok ? await appResponse.json() : await appResponse.text()
    })
  } catch (error) {
    results.tests.push({
      name: 'App Endpoint',
      status: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Pages endpoint
  try {
    const pagesResponse = await fetch(`https://api.reactbricks.com/v2/pages?appId=${process.env.NEXT_PUBLIC_APP_ID}&environment=${process.env.NEXT_PUBLIC_ENVIRONMENT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    results.tests.push({
      name: 'Pages Endpoint',
      status: pagesResponse.status,
      success: pagesResponse.ok,
      response: pagesResponse.ok ? await pagesResponse.json() : await pagesResponse.text()
    })
  } catch (error) {
    results.tests.push({
      name: 'Pages Endpoint',
      status: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return NextResponse.json(results)
}