import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

interface SavePageRequest {
  page: string;
  data: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body: SavePageRequest = await request.json();
    
    const { page, data } = body;
    
    // Generate setting key for this page
    const settingKey = `craft-editor-${page}`;
    
    // Save to theme_settings table using the existing structure
    const { error } = await supabase
      .from('theme_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: JSON.stringify(data),
        category: 'craft_editor',
        page_scope: page
      });
    
    if (error) {
      console.error('Database save error:', error);
      return NextResponse.json(
        { error: 'Failed to save page data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Page saved successfully'
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || 'homepage';
    
    // Fetch page data
    const { data, error } = await supabase
      .from('theme_settings')
      .select('setting_value')
      .eq('category', 'craft_editor')
      .eq('page_scope', page)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page data' },
        { status: 500 }
      );
    }
    
    const pageData = data?.setting_value ? JSON.parse(data.setting_value) : null;
    
    return NextResponse.json({ 
      success: true, 
      data: pageData 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
