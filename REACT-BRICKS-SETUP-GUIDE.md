# React Bricks Setup Guide for Little Latte Lane

## Overview

React Bricks is a **Universal CMS** (Headless + Visual) that provides:
- Headless CMS capabilities with visual editing
- React component-based development
- Inline content editing directly on styled pages
- TypeScript support
- Enterprise-ready features (DAM, SEO, localization, collaboration)

## Core Architecture

### What is React Bricks?
- **Universal CMS**: Bridges gap between traditional headless CMSs and visual builders
- **Component-Based**: Uses React components ("bricks") for content blocks
- **Visual Editing**: Content editors work directly on styled content (no preview needed)
- **Storage**: Content stored as JSON in React Bricks SaaS backend
- **Rendering**: Library matches database content with code bricks

### Key Components:
1. **React Library**: For creating visually editable content blocks
2. **SaaS Backend**: Where content is stored
3. **Admin Interface**: Integrated within your frontend project
4. **Bricks**: React components with visual editing capabilities

## Prerequisites

- **Node.js**: v18 or higher ✅ (Our project uses Node.js)
- **Text Editor**: VS Code with React Bricks snippets extension ✅ (Already installed)
- **Terminal**: PowerShell ✅ (Windows environment)
- **Framework**: Next.js ✅ (Our project is Next.js 15 with App Router)

## Installation Process

### Step 1: CLI Installation
```powershell
npm create reactbricks-app@latest
```

**Important**: This creates a NEW project. For existing projects, we need to:
1. Create a temporary project to understand structure
2. Manually integrate components into our existing project
3. Configure environment variables and authentication

### Step 2: CLI Wizard Questions
- **Authentication**: Use existing React Bricks account
- **App Selection**: Choose "Little Latte Lane" project
- **Project Name**: We'll integrate into existing project
- **Template**: Empty project or Website with blog
- **Framework**: Next.js with App Router ✅

## Project Structure

### New Directories (to be added):
```
react-bricks/
├── bricks/
│   ├── custom/           # Our custom bricks
│   ├── react-bricks-ui/ # Pre-made bricks
│   └── index.ts          # Brick exports and themes
├── config.tsx            # React Bricks configuration
├── NextLink.tsx          # Link component integration
├── NextLinkClient.tsx    # Client-side link component
└── pageTypes.ts          # Page type definitions

app/admin/               # Content management interface
├── (sso)/              # Single sign-on routes
├── app-settings/       # App configuration
├── editor/             # Visual editor
├── media/              # Digital asset manager
├── playground/         # Brick testing
├── layout.tsx          # Admin layout
├── page.tsx            # Admin dashboard
└── ReactBricksApp.tsx  # Admin app component

app/preview/            # Preview routes
├── layout.tsx
└── page.tsx
```

### Environment Variables:
```
# React Bricks Configuration
REACT_BRICKS_APP_ID=your_app_id
REACT_BRICKS_API_KEY=your_api_key
REACT_BRICKS_ENVIRONMENT=production
```

## Brick Development

### What is a Brick?
A React component that:
1. Uses React Bricks visual editing components (Text, RichText, Image, Repeater, Link, File)
2. Has a schema property defining name, default props, and sidebar controls

### Visual Components Available:
- **Text**: Editable plain text
- **RichText**: Editable rich text with formatting options
- **Image**: Editable images with CDN optimization, cropping, rotation
- **Repeater**: For repeating nested items (galleries, lists)
- **Link**: Link management with framework integration
- **File**: File uploads served from global CDN
- **RichTextExt**: Extensible rich text with custom plugins

### Basic Brick Structure:
```typescript
import { types, RichText } from 'react-bricks/frontend'

interface HeroUnitProps {
  title: types.TextValue
  padding: 'big' | 'small'
}

const HeroUnit: types.Brick<HeroUnitProps> = ({ title, padding }) => {
  return (
    <div className={`${padding === 'big' ? 'py-20' : 'py-12'}`}>
      <RichText
        propName="title"
        value={title}
        placeholder="Type a title..."
        renderBlock={({ children }) => (
          <h1 className="text-3xl text-center">{children}</h1>
        )}
        allowedFeatures={[types.RichTextFeatures.Bold]}
      />
    </div>
  )
}

HeroUnit.schema = {
  name: 'hero-unit',
  label: 'Hero Unit',
  getDefaultProps: () => ({
    padding: 'big',
    title: 'Default Title',
  }),
  sideEditProps: [
    {
      name: 'padding',
      label: 'Padding',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'big', label: 'Big' },
          { value: 'small', label: 'Small' },
        ],
      },
    },
  ],
}

export default HeroUnit
```

### Schema Properties:
#### Required:
- **name**: Unique brick identifier
- **label**: Display name in editor

#### Optional:
- **getDefaultProps**: Default props when brick is added
- **sideEditProps**: Sidebar controls for editing props
- **repeaterItems**: Define repeatable brick types
- **stories**: Reusable brick configurations
- **hideFromAddMenu**: Hide from add menu
- **previewImageUrl**: Preview image for brick selection
- **tags**: Search tags for brick discovery
- **category**: Brick categorization

## Integration with Our Existing Project

### Considerations for Little Latte Lane:
1. **Authentication Integration**: React Bricks has its own auth, but we need to sync with our Supabase auth
2. **Admin Access**: Only admin users should access `/admin` routes
3. **Styling**: Maintain our neon theme in brick development
4. **Performance**: Ensure React Bricks doesn't conflict with our PWA setup
5. **Database**: React Bricks content is separate from our Supabase data

### Integration Strategy:
1. **Phase 1**: Set up foundation with minimal example
2. **Phase 2**: Create custom bricks for existing components
3. **Phase 3**: Integrate with admin authentication
4. **Phase 4**: Convert existing pages to use React Bricks

## Content Editing Workflow

### For Developers:
1. Create bricks using React + TypeScript
2. Define schemas with sidebar controls
3. Add bricks to theme configuration
4. Test in playground

### For Content Editors:
1. Access `/admin` interface
2. Select pages to edit
3. Use visual editor with drag-and-drop
4. Edit content inline with rich formatting
5. Use sidebar controls for styling options
6. Publish changes instantly

## Learning Resources

1. **Step-by-step Tutorial**: https://reactbricks.com/learn (Gamified)
2. **Video Workshop**: 1-hour session with CTO (YouTube)
3. **Documentation**: https://docs.reactbricks.com/ (Comprehensive)
4. **Discord Community**: For support and discussions

## Next Steps for Implementation

### Session 1 (Current):
1. ✅ Research and documentation
2. 🔄 Create setup guide
3. ⏳ Install React Bricks CLI and explore structure
4. ⏳ Configure environment and basic setup

### Session 2 (Future):
1. Convert existing components to bricks
2. Set up admin authentication integration
3. Create custom theme for Little Latte Lane
4. Test visual editing workflow

### Session 3 (Future):
1. Convert home page to React Bricks
2. Convert menu and ordering pages
3. Integrate with existing Supabase data
4. Deploy and test production setup

## Technical Notes

### Compatibility:
- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ PWA setup
- ⚠️ Supabase integration (needs planning)
- ⚠️ Yoco payment system (shouldn't conflict)

### Security Considerations:
- Admin routes must be protected
- React Bricks API keys must be secured
- Content publishing permissions
- Integration with existing RLS policies

---

*Created: September 13, 2025*
*Project: Little Latte Lane - Phase 3 (Advanced Features)*
*Purpose: Comprehensive admin dashboard with content editing capabilities*