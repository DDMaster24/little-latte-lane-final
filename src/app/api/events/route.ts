import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET: Fetch all events and section settings
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Fetch events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('display_order', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json(
        { success: false, error: eventsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || []
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new event
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { 
      title, 
      description, 
      event_type, 
      start_date, 
      end_date, 
      background_color,
      text_color,
      button_text,
      button_link,
      priority,
      is_active = true
    } = body;

    if (!title || !description || !event_type || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_type,
        start_date,
        end_date: end_date || start_date,
        background_color: background_color || '#1a1a1a',
        text_color: text_color || '#ffffff',
        button_text,
        button_link,
        priority: priority || 0,
        is_active
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update existing event or section settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { type, id, ...updateData } = body;

    if (type === 'event') {
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Event ID is required' },
          { status: 400 }
        );
      }

      const { data: event, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        event
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid update type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Events update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove event
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
