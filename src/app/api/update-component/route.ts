import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to our component file
const COMPONENT_PATH = path.join(process.cwd(), 'src/components/TestPageComponents/TestPageHeading.tsx');

export async function POST(request: NextRequest) {
  try {
    const { componentName, updates } = await request.json();
    
    if (componentName !== 'TestPageHeading') {
      return NextResponse.json(
        { error: 'Invalid component name' },
        { status: 400 }
      );
    }

    // Read current file content
    let fileContent = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    // Update the useState initial values in the component
    if (updates.text) {
      fileContent = fileContent.replace(
        /const \[heading, setHeading\] = useState\(['"`]([^'"`]*)['"`]\)/,
        `const [heading, setHeading] = useState('${updates.text.replace(/'/g, "\\'")}')`
      );
    }
    
    if (updates.color) {
      fileContent = fileContent.replace(
        /const \[textColor, _setTextColor\] = useState\(['"`]([^'"`]*)['"`]\)/,
        `const [textColor, _setTextColor] = useState('${updates.color}')`
      );
    }
    
    if (updates.fontSize) {
      fileContent = fileContent.replace(
        /const \[fontSize, _setFontSize\] = useState\((\d+)\)/,
        `const [fontSize, _setFontSize] = useState(${updates.fontSize})`
      );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(COMPONENT_PATH, fileContent, 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Component updated successfully',
      updates: updates
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    );
  }
}
