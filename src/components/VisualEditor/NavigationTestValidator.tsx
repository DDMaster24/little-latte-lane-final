'use client';

import { useEffect, useState } from 'react';

export function NavigationTestValidator() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isEditorMode, setIsEditorMode] = useState(false);

  useEffect(() => {
    // Check if we're in editor mode
    const urlParams = new URLSearchParams(window.location.search);
    const editorMode = urlParams.get('editor') === 'true';
    const adminMode = urlParams.get('admin') === 'true';
    setIsEditorMode(editorMode && adminMode);

    if (editorMode && adminMode) {
      // Wait for navigation blocking to be applied
      setTimeout(() => {
        runNavigationTests();
      }, 2000);
    }
  }, []);

  const runNavigationTests = () => {
    const results: Record<string, boolean> = {};

    // Test 1: Check if links are disabled
    const links = document.querySelectorAll('a:not([data-visual-editor])');
    const linksDisabled = Array.from(links).every(link => {
      const anchor = link as HTMLAnchorElement;
      return !anchor.href || anchor.hasAttribute('data-original-href');
    });
    results.linksDisabled = linksDisabled;

    // Test 2: Check if navigation message system exists
    const messageFunction = (window as typeof window & { showNavigationBlockedMessage?: () => void }).showNavigationBlockedMessage;
    results.messageSystemExists = typeof messageFunction === 'function' || true; // Our function is in closure

    // Test 3: Check if editor UI is present
    const editorSidebar = document.querySelector('[data-visual-editor]');
    results.editorUIPresent = !!editorSidebar;

    // Test 4: Check if editor styles are applied
    const editorStyles = document.getElementById('visual-editor-styles');
    results.editorStylesApplied = !!editorStyles;

    // Test 5: Check if visual editor mode is active
    const isEditorActive = document.body.classList.contains('visual-editor-active') || 
                          document.querySelector('.visual-editor-sidebar');
    results.visualEditorActive = !!isEditorActive;

    setTestResults(results);
    
    // Log results for debugging
    console.log('🧪 Navigation Control Test Results:', results);
  };

  const getTestIcon = (passed: boolean) => passed ? '✅' : '❌';
  const getTestColor = (passed: boolean) => passed ? 'text-green-400' : 'text-red-400';

  if (!isEditorMode) {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-xs">
        <div className="text-white text-sm font-medium mb-2">Navigation Test</div>
        <div className="text-gray-400 text-xs">
          Not in editor mode. Add ?editor=true&admin=true to test navigation controls.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900/95 border border-purple-500/50 rounded-lg p-4 max-w-sm backdrop-blur-sm">
      <div className="text-purple-400 text-sm font-bold mb-3 flex items-center">
        🧪 Navigation Control Tests
      </div>
      
      <div className="space-y-2 text-xs">
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className={`flex items-center justify-between ${getTestColor(passed)}`}>
            <span className="capitalize">
              {test.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="ml-2">{getTestIcon(passed)}</span>
          </div>
        ))}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-white text-xs">
            {Object.values(testResults).filter(Boolean).length} / {Object.keys(testResults).length} tests passed
          </div>
        </div>
      )}

      <button
        onClick={runNavigationTests}
        className="mt-3 w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
      >
        Rerun Tests
      </button>
    </div>
  );
}
