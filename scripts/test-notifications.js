/**
 * Comprehensive Notification System Diagnostic
 * Tests all notification infrastructure components
 */

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60) + '\n');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testNotificationSystem() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  function test(name, condition, warningOnly = false) {
    results.total++;
    if (condition) {
      success(name);
      results.passed++;
      return true;
    } else {
      if (warningOnly) {
        warning(name);
        results.warnings++;
      } else {
        error(name);
        results.failed++;
      }
      return false;
    }
  }

  header('🔍 NOTIFICATION SYSTEM DIAGNOSTIC');

  // ============================================================
  // 1. ENVIRONMENT VARIABLES CHECK
  // ============================================================
  header('1️⃣  Environment Variables');

  test(
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY is set',
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
  
  test(
    'VAPID_PRIVATE_KEY is set',
    !!process.env.VAPID_PRIVATE_KEY
  );
  
  test(
    'VAPID_SUBJECT is set',
    !!process.env.VAPID_SUBJECT
  );

  test(
    'RESEND_API_KEY is set (for email notifications)',
    !!process.env.RESEND_API_KEY,
    true // warning only
  );

  // Validate VAPID key format
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    const publicKeyValid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length === 87;
    test('VAPID public key has valid length (87 characters)', publicKeyValid);
  }

  if (process.env.VAPID_PRIVATE_KEY) {
    const privateKeyValid = process.env.VAPID_PRIVATE_KEY.length === 43;
    test('VAPID private key has valid length (43 characters)', privateKeyValid);
  }

  if (process.env.VAPID_SUBJECT) {
    const subjectValid = process.env.VAPID_SUBJECT.startsWith('mailto:');
    test('VAPID subject has valid mailto: format', subjectValid);
  }

  // ============================================================
  // 2. NPM PACKAGES CHECK
  // ============================================================
  header('2️⃣  NPM Package Installation');

  try {
    require('web-push');
    success('web-push package is installed');
    results.passed++;
  } catch (err) {
    error('web-push package is NOT installed');
    results.failed++;
    info('Run: npm install web-push @types/web-push');
  }
  results.total++;

  // ============================================================
  // 3. FILE STRUCTURE CHECK
  // ============================================================
  header('3️⃣  File Structure');

  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'src/app/api/notifications/send/route.ts',
    'src/app/api/notifications/subscribe/route.ts',
    'src/app/api/notifications/unsubscribe/route.ts',
    'src/app/api/notifications/preferences/route.ts',
    'src/app/api/notifications/broadcast/route.ts',
    'src/lib/notifications.ts',
    'src/components/Admin/AdminNotificationsTab.tsx',
    'public/sw-custom.js',
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    test(`File exists: ${file}`, fs.existsSync(filePath));
  });

  // ============================================================
  // 4. SERVICE WORKER CHECK
  // ============================================================
  header('4️⃣  Service Worker Configuration');

  const swPath = path.join(process.cwd(), 'public/sw-custom.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    test(
      'Service worker handles push events',
      swContent.includes('self.addEventListener(\'push\'')
    );
    test(
      'Service worker handles notification clicks',
      swContent.includes('self.addEventListener(\'notificationclick\'')
    );
    test(
      'Service worker has notification payload parsing',
      swContent.includes('event.data.json()') || swContent.includes('JSON.parse')
    );
  }

  // ============================================================
  // 5. DATABASE CONNECTION TEST
  // ============================================================
  header('5️⃣  Database Connection & Schema');

  const { createClient } = require('@supabase/supabase-js');
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
      // Check notifications table
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('user_id')
        .limit(1);

      test('notifications table exists and is accessible', !notifError);

      if (!notifError && notifData) {
        info(`Found ${notifData.length} notification preference records`);
      }

      // Check notification_history table
      const { data: historyData, error: historyError } = await supabase
        .from('notification_history')
        .select('id')
        .limit(1);

      test('notification_history table exists and is accessible', !historyError);

      if (!historyError && historyData) {
        const { count } = await supabase
          .from('notification_history')
          .select('id', { count: 'exact', head: true });
        
        info(`Notification history has ${count || 0} records`);
      }

      // Check broadcast_messages table
      const { data: broadcastData, error: broadcastError } = await supabase
        .from('broadcast_messages')
        .select('id')
        .limit(1);

      test('broadcast_messages table exists (optional)', !broadcastError, true);

      // Check for users with push subscriptions
      const { data: subsData } = await supabase
        .from('notifications')
        .select('user_id')
        .not('push_subscription', 'is', null);

      const subCount = subsData?.length || 0;
      info(`${subCount} users have active push subscriptions`);
      
      if (subCount === 0) {
        warning('No users have subscribed to push notifications yet');
        results.warnings++;
      }

    } catch (err) {
      error('Database connection failed: ' + err.message);
      results.failed++;
    }
  } else {
    error('Supabase credentials not found in environment');
    results.failed++;
  }
  results.total += 3;

  // ============================================================
  // 6. WEB-PUSH CONFIGURATION TEST
  // ============================================================
  header('6️⃣  Web-Push Configuration');

  try {
    const webpush = require('web-push');
    
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:test@test.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      
      success('web-push configured with VAPID keys');
      results.passed++;
      
      info('VAPID Subject: ' + (process.env.VAPID_SUBJECT || 'Not set'));
      info('Public Key (first 20 chars): ' + process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 20) + '...');
    } else {
      error('web-push cannot be configured - missing VAPID keys');
      results.failed++;
    }
  } catch (err) {
    error('web-push configuration failed: ' + err.message);
    results.failed++;
  }
  results.total++;

  // ============================================================
  // 7. API ROUTES ACCESSIBILITY
  // ============================================================
  header('7️⃣  API Routes (File Check Only)');

  const apiRoutes = [
    'src/app/api/notifications/send/route.ts',
    'src/app/api/notifications/subscribe/route.ts',
    'src/app/api/notifications/unsubscribe/route.ts',
    'src/app/api/notifications/preferences/route.ts',
    'src/app/api/notifications/broadcast/route.ts',
  ];

  apiRoutes.forEach(route => {
    const routePath = path.join(process.cwd(), route);
    const routeName = route.split('/').slice(-2, -1)[0];
    test(`API route: /api/notifications/${routeName}`, fs.existsSync(routePath));
  });

  // ============================================================
  // 8. ADMIN PANEL CHECK
  // ============================================================
  header('8️⃣  Admin Panel Integration');

  const adminNotifPath = path.join(process.cwd(), 'src/components/Admin/AdminNotificationsTab.tsx');
  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');

  test('AdminNotificationsTab component exists', fs.existsSync(adminNotifPath));
  
  if (fs.existsSync(adminPagePath)) {
    const adminContent = fs.readFileSync(adminPagePath, 'utf8');
    test(
      'Admin page imports AdminNotificationsTab',
      adminContent.includes('AdminNotificationsTab')
    );
  }

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  header('📊 DIAGNOSTIC SUMMARY');

  console.log('');
  log(`Total Tests: ${results.total}`, 'bright');
  success(`Passed: ${results.passed}`);
  error(`Failed: ${results.failed}`);
  warning(`Warnings: ${results.warnings}`);
  console.log('');

  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  
  if (results.failed === 0) {
    success(`🎉 All critical tests passed! (${passRate}%)`);
    console.log('');
    log('✨ Your notification system is fully configured and ready to use!', 'green');
  } else if (results.failed <= 2) {
    warning(`⚠️  Mostly configured with ${results.failed} issue(s) (${passRate}%)`);
    console.log('');
    log('🔧 Fix the failed tests above to complete setup', 'yellow');
  } else {
    error(`❌ Configuration incomplete (${passRate}%)`);
    console.log('');
    log('🔧 Multiple issues found. Review the failed tests above.', 'red');
  }

  console.log('');
  header('📚 NEXT STEPS');
  
  if (results.failed > 0) {
    console.log('1. Fix failed tests above');
    console.log('2. Re-run this diagnostic: node scripts/test-notifications.js');
  } else {
    console.log('1. ✅ Test push notifications in browser:');
    console.log('   - Visit your site');
    console.log('   - Allow notification permissions');
    console.log('   - Check browser console for subscription');
    console.log('');
    console.log('2. ✅ Test admin broadcast:');
    console.log('   - Go to Admin Panel → Notifications tab');
    console.log('   - Send a test broadcast');
    console.log('');
    console.log('3. ✅ Test order notifications:');
    console.log('   - Create a test order');
    console.log('   - Update status to "ready"');
    console.log('   - Check if notification appears');
  }

  console.log('');
  header('🔗 USEFUL LINKS');
  console.log('📖 Web Push API Docs: https://developer.mozilla.org/en-US/docs/Web/API/Push_API');
  console.log('📖 VAPID Spec: https://tools.ietf.org/html/rfc8292');
  console.log('📖 Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API');
  console.log('');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the diagnostic
testNotificationSystem().catch(err => {
  error('Diagnostic script failed: ' + err.message);
  console.error(err);
  process.exit(1);
});
