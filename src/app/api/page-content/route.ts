import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to our test page component
const TEST_PAGE_PATH = path.join(process.cwd(), 'src/app/test-page/page.tsx');

export async function GET() {
  try {
    // Read the current test page file
    const fileContent = fs.readFileSync(TEST_PAGE_PATH, 'utf8');
    
    // Extract current values using regex patterns
    const textMatch = fileContent.match(/const \[heading, setHeading\] = useState\(['"`]([^'"`]*)['"`]\)/);
    const colorMatch = fileContent.match(/const \[textColor, setTextColor\] = useState\(['"`]([^'"`]*)['"`]\)/);
    const fontSizeMatch = fileContent.match(/const \[fontSize, setFontSize\] = useState\((\d+)\)/);
    
    const currentContent = {
      text: textMatch ? textMatch[1] : 'Test Heading - Click Edit to Change Me',
      color: colorMatch ? colorMatch[1] : '#ffffff',
      fontSize: fontSizeMatch ? parseInt(fontSizeMatch[1]) : 48
    };
    
    return NextResponse.json(currentContent);
  } catch (error) {
    console.error('Error reading page content:', error);
    return NextResponse.json(
      { error: 'Failed to read page content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, color, fontSize } = await request.json();
    
    // Read current file content
    let fileContent = fs.readFileSync(TEST_PAGE_PATH, 'utf8');
    
    // Update the useState initial values
    fileContent = fileContent.replace(
      /const \[heading, setHeading\] = useState\(['"`][^'"`]*['"`]\)/,
      `const [heading, setHeading] = useState('${text}')`
    );
    
    fileContent = fileContent.replace(
      /const \[textColor, setTextColor\] = useState\(['"`][^'"`]*['"`]\)/,
      `const [textColor, setTextColor] = useState('${color}')`
    );
    
    fileContent = fileContent.replace(
      /const \[fontSize, setFontSize\] = useState\(\d+\)/,
      `const [fontSize, setFontSize] = useState(${fontSize})`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(TEST_PAGE_PATH, fileContent, 'utf8');
    
    return NextResponse.json({ success: true, message: 'Page content updated successfully' });
  } catch (error) {
    console.error('Error updating page content:', error);
    return NextResponse.json(
      { error: 'Failed to update page content' },
      { status: 500 }
    );
  }
}
