import { NextResponse } from 'next/server';
import sql from '../../../../db.js';

// Helper function to get all editor settings from database
async function getEditorSettings() {
  try {
    const settings = await sql`
      SELECT setting_key, setting_value 
      FROM theme_settings 
      WHERE category = 'editor' OR category IS NULL
    `;
    
    // Convert array to object format
    const result = {
      text: 'Test Heading - Click Edit to Change Me',
      color: '#ffffff', 
      backgroundColor: 'transparent',
      fontSize: 48,
      imageUrl: '/images/logo.svg',
      imageSize: { width: 200, height: 200 }
    };
    
    // Override with database values
    settings.forEach(setting => {
      if (setting.setting_key === 'editor_text') result.text = setting.setting_value;
      if (setting.setting_key === 'editor_color') result.color = setting.setting_value;
      if (setting.setting_key === 'editor_backgroundColor') result.backgroundColor = setting.setting_value;
      if (setting.setting_key === 'editor_fontSize') result.fontSize = parseInt(setting.setting_value);
      if (setting.setting_key === 'editor_imageUrl') result.imageUrl = setting.setting_value;
      if (setting.setting_key === 'editor_imageSize') result.imageSize = JSON.parse(setting.setting_value);
    });
    
    return result;
  } catch (error) {
    console.error('Error getting editor settings:', error);
    return {
      text: 'Test Heading - Click Edit to Change Me',
      color: '#ffffff',
      backgroundColor: 'transparent', 
      fontSize: 48,
      imageUrl: '/images/logo.svg',
      imageSize: { width: 200, height: 200 }
    };
  }
}

export async function GET() {
  const componentData = await getEditorSettings();
  return NextResponse.json(componentData);
}

export async function POST(request: Request) {
  try {
    // Check if request has content
    const contentLength = request.headers.get('content-length');
    if (contentLength === '0' || contentLength === null) {
      return NextResponse.json({ error: 'No request body provided' }, { status: 400 });
    }

    const body = await request.json();
    
    // Handle new component-based API format
    if (body.componentId && body.action) {
      if (body.action === 'get') {
        // Get component data from database
        try {
          const settings = await sql`
            SELECT setting_value 
            FROM theme_settings 
            WHERE setting_key = ${body.componentId}
          `;
          
          if (settings.length > 0) {
            const data = JSON.parse(settings[0].setting_value);
            return NextResponse.json({ success: true, content: data });
          } else {
            return NextResponse.json({ success: true, content: null });
          }
        } catch (error) {
          console.error('Error getting component data:', error);
          return NextResponse.json({ success: true, content: null });
        }
      } else if (body.action === 'save' || body.action === 'update') {
        // Save component data to database
        try {
          const settingValue = JSON.stringify(body.data || body.content);
          
          // Upsert setting (insert or update if setting_key exists)
          const existingSettings = await sql`
            SELECT id FROM theme_settings WHERE setting_key = ${body.componentId}
          `;
          
          if (existingSettings.length > 0) {
            // Update existing setting
            await sql`
              UPDATE theme_settings 
              SET setting_value = ${settingValue}, updated_at = NOW()
              WHERE setting_key = ${body.componentId}
            `;
          } else {
            // Insert new setting
            await sql`
              INSERT INTO theme_settings (setting_key, setting_value, category)
              VALUES (${body.componentId}, ${settingValue}, 'component')
            `;
          }
          
          // Also save styling if provided (for content editor)
          if (body.styling) {
            const stylingKey = `${body.componentId}_styling`;
            const stylingValue = JSON.stringify(body.styling);
            
            const existingStyling = await sql`
              SELECT id FROM theme_settings WHERE setting_key = ${stylingKey}
            `;
            
            if (existingStyling.length > 0) {
              await sql`
                UPDATE theme_settings 
                SET setting_value = ${stylingValue}, updated_at = NOW()
                WHERE setting_key = ${stylingKey}
              `;
            } else {
              await sql`
                INSERT INTO theme_settings (setting_key, setting_value, category)
                VALUES (${stylingKey}, ${stylingValue}, 'styling')
              `;
            }
          }
          
          return NextResponse.json({ success: true });
        } catch (error) {
          console.error('Error saving component data:', error);
          return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, { status: 500 });
        }
      }
    }

    // Handle legacy format (for old test page)
    const updates = body;
    
    // Save each update to database
    for (const [key, value] of Object.entries(updates)) {
      const settingKey = `editor_${key}`;
      let settingValue: string;
      
      if (typeof value === 'object') {
        settingValue = JSON.stringify(value);
      } else {
        settingValue = String(value);
      }
      
      // Check if setting exists
      const existingSettings = await sql`
        SELECT id FROM theme_settings WHERE setting_key = ${settingKey}
      `;
      
      if (existingSettings.length > 0) {
        // Update existing setting
        await sql`
          UPDATE theme_settings 
          SET setting_value = ${settingValue}, updated_at = NOW()
          WHERE setting_key = ${settingKey}
        `;
      } else {
        // Insert new setting  
        await sql`
          INSERT INTO theme_settings (setting_key, setting_value, category)
          VALUES (${settingKey}, ${settingValue}, 'editor')
        `;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
