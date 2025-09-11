import { NextResponse } from 'next/server';

// This stores the current component data
let componentData = {
  text: 'Test Heading - Click Edit to Change Me',
  color: '#ffffff', 
  backgroundColor: 'transparent',
  fontSize: 48
};

export async function GET() {
  return NextResponse.json(componentData);
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    
    // Update the stored data
    componentData = {
      ...componentData,
      ...updates
    };
    
    return NextResponse.json({ 
      success: true, 
      message: 'Component data updated successfully',
      data: componentData
    });
  } catch (error) {
    console.error('Error updating component data:', error);
    return NextResponse.json(
      { error: 'Failed to update component data' },
      { status: 500 }
    );
  }
}
