'use client';

import { useEffect } from 'react';

export default function TestHomepageEditor() {
  useEffect(() => {
    console.log('🟢 TEST COMPONENT LOADED SUCCESSFULLY!');
    
    // Simple element detection test
    const elements = document.querySelectorAll('[data-editable]');
    console.log('🔍 Found editable elements:', elements.length);
    
    // Log all elements found
    elements.forEach((el, index) => {
      console.log(`Element ${index + 1}:`, el.getAttribute('data-editable'), el.tagName);
    });
    
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px' }}>
      <h1>🧪 TEST COMPONENT IS LOADING</h1>
      <p>If you see this, the component system is working.</p>
      <p>Check console for element detection results.</p>
      <button onClick={() => {
        const elements = document.querySelectorAll('[data-editable]');
        console.log('🔍 Manual test - found elements:', elements.length);
        elements.forEach(el => console.log(el.getAttribute('data-editable')));
      }}>
        Test Element Detection
      </button>
    </div>
  );
}
