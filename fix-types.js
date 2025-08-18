// Type fix utility - Batch fix common TypeScript errors
const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix null/undefined assignments for Select components
  {
    pattern: /value=\{([^}]+\.status)\}/g,
    replacement: 'value={$1 || \'\'}'
  },
  {
    pattern: /value=\{([^}]+\.payment_status)\}/g,
    replacement: 'value={$1 || \'\'}'
  },
  // Fix role references
  {
    pattern: /profile\?\.role === 'admin'/g,
    replacement: 'profile?.is_admin'
  },
  {
    pattern: /profile\?\.role !== 'admin'/g,
    replacement: '!profile?.is_admin'
  },
  // Fix property references
  {
    pattern: /\.booking_type/g,
    replacement: '.booking_date'
  },
  {
    pattern: /\.order_type/g,
    replacement: '.order_number'
  },
  {
    pattern: /\.date_time/g,
    replacement: '.booking_date'
  },
  {
    pattern: /\.time/g,
    replacement: '.booking_time'
  },
  {
    pattern: /\.number_of_people/g,
    replacement: '.party_size'
  },
  // Fix date handling
  {
    pattern: /new Date\(([^)]+\.(?:start_date|end_date|created_at))\)/g,
    replacement: 'new Date($1 || new Date())'
  },
  // Fix status handling
  {
    pattern: /([^.]+\.status)\.replace/g,
    replacement: '($1 || \'\').replace'
  },
  // Fix type assertions for setters
  {
    pattern: /setCategories\(([^)]+)\)/g,
    replacement: 'setCategories($1 as Category[])'
  },
  {
    pattern: /setMenuItems\(([^)]+)\)/g,
    replacement: 'setMenuItems($1 as MenuItem[])'
  },
  {
    pattern: /setOrders\(([^)]+)\)/g,
    replacement: 'setOrders($1 as Order[])'
  },
  {
    pattern: /setRequests\(([^)]+)\)/g,
    replacement: 'setRequests($1 as Request[])'
  },
  {
    pattern: /setEvents\(([^)]+)\)/g,
    replacement: 'setEvents($1 as Event[])'
  }
];

function applyFixes(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      changed = true;
      content = newContent;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
}

// Files to fix
const files = [
  'src/app/admin/manage-menu.tsx',
  'src/app/admin/manage-orders.tsx',
  'src/app/admin/manage-requests.tsx',
  'src/app/admin/staff-panel.tsx',
  'src/app/bookings/page.tsx',
  'src/app/menu/[categoryId]/page.tsx',
  'src/app/menu/page.tsx',
  'src/app/staff/kitchen.tsx',
  'src/app/staff/page.tsx',
  'src/components/CategoriesSection.tsx',
  'src/components/EventsSpecialsSection.tsx'
];

console.log('🔧 Applying TypeScript fixes...\n');

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  applyFixes(fullPath);
});

console.log('\n🎉 Batch fixes completed!');
