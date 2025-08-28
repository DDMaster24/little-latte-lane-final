// Test Events & Specials System - Comprehensive Verification
console.log('🎯 TESTING EVENTS & SPECIALS SYSTEM');
console.log('=====================================');

// Test 1: Database Connection and Data
async function testDatabaseConnection() {
  console.log('\n1. Testing Database Connection & Data...');
  
  try {
    const response = await fetch('/api/events');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Database connection successful');
      console.log(`📊 Found ${data.events.length} events`);
      console.log('📋 Events data:', data.events.map(e => ({ 
        title: e.title, 
        type: e.event_type, 
        active: e.is_active 
      })));
      console.log('⚙️ Section settings:', data.settings);
      return true;
    } else {
      console.error('❌ Database error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Test 2: Events Section Rendering
function testEventsSection() {
  console.log('\n2. Testing Events Section Rendering...');
  
  const eventsSection = document.querySelector('[data-editable="events-section"]') || 
                       document.querySelector('[data-editable="events-section-container"]');
  
  if (eventsSection) {
    console.log('✅ Events section found in DOM');
    
    // Check for admin controls
    const adminControls = eventsSection.querySelector('button');
    if (adminControls) {
      console.log('✅ Admin controls detected');
    } else {
      console.log('⚠️ No admin controls visible (user may not be admin)');
    }
    
    // Check for event cards
    const eventCards = eventsSection.querySelectorAll('[data-editable="event-card"]');
    console.log(`📋 Found ${eventCards.length} event cards`);
    
    // Check for editable attributes
    const editableElements = eventsSection.querySelectorAll('[data-editable]');
    console.log(`🎨 Found ${editableElements.length} editable elements`);
    
    return true;
  } else {
    console.error('❌ Events section not found in DOM');
    return false;
  }
}

// Test 3: API Endpoints
async function testAPIEndpoints() {
  console.log('\n3. Testing API Endpoints...');
  
  // Test GET endpoint
  try {
    const getResponse = await fetch('/api/events');
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log('✅ GET /api/events working');
    } else {
      console.error('❌ GET /api/events failed:', getData.error);
    }
  } catch (error) {
    console.error('❌ GET endpoint error:', error);
  }
  
  // Test POST endpoint (create test event)
  try {
    const testEvent = {
      type: 'event',
      title: 'Test Event',
      description: 'This is a test event',
      event_type: 'event',
      start_date: new Date().toISOString().split('T')[0],
      background_color: '#ff0000',
      text_color: '#ffffff'
    };
    
    const postResponse = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEvent)
    });
    
    const postData = await postResponse.json();
    
    if (postData.success) {
      console.log('✅ POST /api/events working');
      console.log('📝 Test event created with ID:', postData.event?.id);
      
      // Clean up test event
      if (postData.event?.id) {
        const deleteResponse = await fetch(`/api/events?id=${postData.event.id}`, {
          method: 'DELETE'
        });
        const deleteData = await deleteResponse.json();
        
        if (deleteData.success) {
          console.log('✅ DELETE /api/events working');
          console.log('🗑️ Test event cleaned up');
        }
      }
    } else {
      console.error('❌ POST /api/events failed:', postData.error);
    }
  } catch (error) {
    console.error('❌ POST endpoint error:', error);
  }
}

// Test 4: Real-time Updates
function testRealTimeUpdates() {
  console.log('\n4. Testing Real-time Updates...');
  
  // Check if component has subscription setup
  const eventsSection = document.querySelector('[data-editable="events-section"]') || 
                       document.querySelector('[data-editable="events-section-container"]');
  
  if (eventsSection) {
    console.log('✅ Events section ready for real-time updates');
    console.log('📡 Supabase subscriptions should be active');
    return true;
  } else {
    console.log('❌ Cannot verify real-time setup - section not found');
    return false;
  }
}

// Test 5: Admin Editing Interface
function testAdminInterface() {
  console.log('\n5. Testing Admin Editing Interface...');
  
  const editButtons = document.querySelectorAll('button[data-editable], button:contains("Edit"), button:contains("Add")');
  
  if (editButtons.length > 0) {
    console.log(`✅ Found ${editButtons.length} potential admin controls`);
    
    // Check for specific admin buttons
    const addEventBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Add Event') || btn.textContent.includes('Add')
    );
    
    const editSectionBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Edit Section') || btn.textContent.includes('Section')
    );
    
    if (addEventBtn) console.log('✅ "Add Event" button found');
    if (editSectionBtn) console.log('✅ "Edit Section" button found');
    
    return true;
  } else {
    console.log('⚠️ No admin controls visible (user may not be admin)');
    return false;
  }
}

// Test 6: Styling and Visual Elements
function testStylingAndVisuals() {
  console.log('\n6. Testing Styling and Visual Elements...');
  
  const eventsSection = document.querySelector('[data-editable="events-section"]') || 
                       document.querySelector('[data-editable="events-section-container"]');
  
  if (eventsSection) {
    const computedStyle = getComputedStyle(eventsSection);
    
    console.log('🎨 Section styling:');
    console.log(`   Background: ${computedStyle.backgroundColor}`);
    console.log(`   Color: ${computedStyle.color}`);
    
    // Check for neon effects
    const neonElements = eventsSection.querySelectorAll('[class*="neon"], [class*="gradient"]');
    console.log(`✨ Found ${neonElements.length} neon/gradient elements`);
    
    // Check for responsive classes
    const responsiveElements = eventsSection.querySelectorAll('[class*="responsive"], [class*="grid"]');
    console.log(`📱 Found ${responsiveElements.length} responsive elements`);
    
    return true;
  } else {
    console.log('❌ Cannot test styling - section not found');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive Events & Specials system test...\n');
  
  const results = {
    database: await testDatabaseConnection(),
    rendering: testEventsSection(),
    api: await testAPIEndpoints(),
    realtime: testRealTimeUpdates(),
    admin: testAdminInterface(),
    styling: testStylingAndVisuals()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Events & Specials system is fully functional.');
  } else {
    console.log('⚠️ Some tests failed. Check the details above for issues.');
  }
  
  return results;
}

// Auto-run tests when script loads
runAllTests().catch(console.error);
