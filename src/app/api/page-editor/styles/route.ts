import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { pageName, elementId, styles } = await request.json();
    
    if (!pageName || !elementId || !styles) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const settingKey = `page_${pageName}_${elementId}`;
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('theme_settings')
      .select('id')
      .eq('setting_key', settingKey)
      .single();

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('theme_settings')
        .update({
          setting_value: JSON.stringify(styles),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('theme_settings')
        .insert({
          setting_key: settingKey,
          setting_value: JSON.stringify(styles),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving element styles:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get('pageName');
    const elementId = searchParams.get('elementId');
    
    if (!pageName || !elementId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const settingKey = `page_${pageName}_${elementId}`;
    
    const { data, error } = await supabase
      .from('theme_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    if (data && data.setting_value) {
      return NextResponse.json({ success: true, styles: JSON.parse(data.setting_value) });
    }

    return NextResponse.json({ success: true, styles: {} });
  } catch (error) {
    console.error('Error getting element styles:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
