/**
 * Test script to verify booking section element detection
 * Run this in browser console on the homepage editor page
 */

console.log('🔍 TESTING BOOKING SECTION ELEMENT DETECTION');
console.log('=' .repeat(50));

// Test 1: Check if booking elements exist in DOM
const bookingElements = document.querySelectorAll('[data-editable*="bookings"]');
console.log('📋 Found booking elements:', bookingElements.length);
bookingElements.forEach((el, index) => {
  console.log(`${index + 1}. ${el.getAttribute('data-editable')} - ${el.tagName}`);
});

// Test 2: Check if they have proper event listeners
console.log('\n🎯 Testing click event registration:');
bookingElements.forEach((el) => {
  const elementId = el.getAttribute('data-editable');
  console.log(`Testing: ${elementId}`);
  
  // Check if element has click handler
  const hasClickHandler = el.onclick !== null;
  console.log(`  - Has click handler: ${hasClickHandler}`);
  
  // Check computed styles that might block clicks
  const style = window.getComputedStyle(el);
  console.log(`  - Pointer events: ${style.pointerEvents}`);
  console.log(`  - Z-index: ${style.zIndex}`);
  console.log(`  - Position: ${style.position}`);
});

// Test 3: Manual click test
console.log('\n⚡ Manual click test on booking title:');
const bookingTitle = document.querySelector('[data-editable="bookings-title"]');
if (bookingTitle) {
  console.log('Found booking title element');
  bookingTitle.style.border = '3px solid red';
  console.log('Added red border for visual verification');
  
  // Try to trigger click event manually
  try {
    bookingTitle.click();
    console.log('✅ Manual click triggered successfully');
  } catch (error) {
    console.log('❌ Manual click failed:', error);
  }
} else {
  console.log('❌ Booking title element not found');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Check if elements are visible on page');
console.log('2. Verify orange hover effect works');
console.log('3. Test click selection and red border');
console.log('4. Check if right panel updates when clicked');
