import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { elementId, data: _data } = await request.json();
    
    // For now, just return success - this can be implemented later
    return NextResponse.json({ 
      success: true, 
      elementId,
      message: 'Element saved successfully' 
    });
  } catch (error) {
    console.error('Error saving element:', error);
    return NextResponse.json(
      { error: 'Failed to save element' },
      { status: 500 }
    );
  }
}