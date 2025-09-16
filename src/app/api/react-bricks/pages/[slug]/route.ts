import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const apiKey = process.env.API_KEY // Server-side API key
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'React Bricks API key not configured' },
        { status: 500 }
      )
    }

    // Make server-side request to React Bricks API
    const response = await fetch(
      `https://api.reactbricks.com/v2/app/pages/${slug}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.statusText}` },
        { status: response.status }
      )
    }

    const pageData = await response.json()
    return NextResponse.json(pageData)

  } catch (error) {
    console.error('Error fetching React Bricks page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}