import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID
  
  const results: any = {
    timestamp: new Date().toISOString(),
    credentials: {
      API_KEY_LENGTH: API_KEY?.length || 0,
      API_KEY_FORMAT: API_KEY?.match(/^[a-f0-9-]+$/) ? 'Valid UUID format' : 'Invalid format',
      APP_ID_LENGTH: APP_ID?.length || 0,
      APP_ID_FORMAT: APP_ID?.match(/^[a-f0-9-]+$/) ? 'Valid UUID format' : 'Invalid format'
    },
    authTests: []
  }

  // Test 1: Try different auth header format
  try {
    const response1 = await fetch('https://api.reactbricks.com/v2/admin/pages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    results.authTests.push({
      name: 'Auth Test 1: Bearer Token Only',
      status: response1.status,
      headers: Object.fromEntries(response1.headers.entries()),
      response: response1.ok ? await response1.json() : await response1.text()
    })
  } catch (error) {
    results.authTests.push({
      name: 'Auth Test 1: Bearer Token Only',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: Try with both headers
  try {
    const response2 = await fetch('https://api.reactbricks.com/v2/admin/pages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY!,
        'X-App-Id': APP_ID!,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    results.authTests.push({
      name: 'Auth Test 2: Bearer + App Headers',
      status: response2.status,
      headers: Object.fromEntries(response2.headers.entries()),
      response: response2.ok ? await response2.json() : await response2.text()
    })
  } catch (error) {
    results.authTests.push({
      name: 'Auth Test 2: Bearer + App Headers',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Try React Bricks specific endpoint
  try {
    const response3 = await fetch(`https://api.reactbricks.com/v2/apps/${APP_ID}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    results.authTests.push({
      name: 'Auth Test 3: App Verification',
      status: response3.status,
      response: response3.ok ? await response3.json() : await response3.text()
    })
  } catch (error) {
    results.authTests.push({
      name: 'Auth Test 3: App Verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return NextResponse.json(results, { status: 200 })
}