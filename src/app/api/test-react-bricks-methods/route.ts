import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID
  const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'main'
  
  const results: any = {
    timestamp: new Date().toISOString(),
    reactBricksTests: []
  }

  // Test 1: Try the exact endpoint React Bricks frontend uses
  try {
    const response = await fetch(`https://api.reactbricks.com/v2/pages/${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        appId: APP_ID,
        environment: ENVIRONMENT,
        slug: 'homepage',
        language: 'en'
      })
    })
    
    results.reactBricksTests.push({
      name: 'React Bricks Frontend Style API Call',
      status: response.status,
      success: response.ok,
      response: response.ok ? await response.json() : await response.text()
    })
  } catch (error) {
    results.reactBricksTests.push({
      name: 'React Bricks Frontend Style API Call',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: Try with API key in URL path instead of header
  try {
    const response = await fetch(`https://api.reactbricks.com/v2/pages?apiKey=${API_KEY}&appId=${APP_ID}&environment=${ENVIRONMENT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    results.reactBricksTests.push({
      name: 'API Key in Query Parameters',
      status: response.status,
      success: response.ok,
      response: response.ok ? await response.json() : await response.text()
    })
  } catch (error) {
    results.reactBricksTests.push({
      name: 'API Key in Query Parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Try the exact React Bricks fetchPage method format
  try {
    const response = await fetch('https://api.reactbricks.com/v2/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        appId: APP_ID,
        environment: ENVIRONMENT,
        slug: 'homepage'
      })
    })
    
    results.reactBricksTests.push({
      name: 'React Bricks fetchPage Style',
      status: response.status,
      success: response.ok,
      response: response.ok ? await response.json() : await response.text()
    })
  } catch (error) {
    results.reactBricksTests.push({
      name: 'React Bricks fetchPage Style',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 4: Check if we can get any successful response from React Bricks
  try {
    const response = await fetch('https://api.reactbricks.com/v2/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    results.reactBricksTests.push({
      name: 'React Bricks Health Check',
      status: response.status,
      success: response.ok,
      response: response.ok ? await response.json() : await response.text()
    })
  } catch (error) {
    results.reactBricksTests.push({
      name: 'React Bricks Health Check',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return NextResponse.json(results, { status: 200 })
}