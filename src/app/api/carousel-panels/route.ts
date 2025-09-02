import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { Json } from '@/types/supabase';

// GET: Fetch all carousel panels
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: panels, error } = await supabase
      .from('carousel_panels')
      .select('*')
      .order('panel_order', { ascending: true });

    if (error) {
      console.error('Error fetching carousel panels:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panels: panels || []
    });
  } catch (error) {
    console.error('Carousel panels API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new carousel panel
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { template_id, panel_id, config, panel_order } = body;

    if (!template_id || !panel_id || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the next panel order if not provided
    let order = panel_order;
    if (!order) {
      const { data: maxOrder } = await supabase
        .from('carousel_panels')
        .select('panel_order')
        .order('panel_order', { ascending: false })
        .limit(1);
      
      order = (maxOrder?.[0]?.panel_order || 0) + 1;
    }

    const { data: panel, error } = await supabase
      .from('carousel_panels')
      .insert({
        template_id,
        panel_id,
        config,
        panel_order: order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating carousel panel:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panel
    });
  } catch (error) {
    console.error('Carousel panel creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update existing carousel panel
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { id, config, is_active, panel_order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Panel ID is required' },
        { status: 400 }
      );
    }

    const updateData: { 
      updated_at: string; 
      config?: Json; 
      is_active?: boolean; 
      panel_order?: number; 
    } = { updated_at: new Date().toISOString() };
    
    if (config !== undefined) updateData.config = config;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (panel_order !== undefined) updateData.panel_order = panel_order;

    const { data: panel, error } = await supabase
      .from('carousel_panels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating carousel panel:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panel
    });
  } catch (error) {
    console.error('Carousel panel update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove carousel panel
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Panel ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('carousel_panels')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting carousel panel:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Panel deleted successfully'
    });
  } catch (error) {
    console.error('Carousel panel deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
