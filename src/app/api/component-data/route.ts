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
    console.error('Database error:', error);
    // Return defaults if database fails
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
    const updates = await request.json();
    
    // Save each update to database
    for (const [key, value] of Object.entries(updates)) {
      const settingKey = `editor_${key}`;
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      // Upsert setting (insert or update if setting_key exists)
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
    
    // Get updated data
    const updatedData = await getEditorSettings();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Component data updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating component data:', error);
    return NextResponse.json(
      { error: 'Failed to update component data' },
      { status: 500 }
    );
  }
}
