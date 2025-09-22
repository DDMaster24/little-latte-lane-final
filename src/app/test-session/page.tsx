/**
 * Simple Session Test Page
 * Tests if session data is properly stored and retrieved
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { sessionManager } from '@/lib/enhanced-session-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SessionTestPage() {
  const { user, session } = useAuth();
  const [testResults, setTestResults] = useState<{
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
    supabaseKeys: string[];
    customKeys: string[];
    sessionManagerInfo: Record<string, unknown>;
  } | null>(null);

  const runSessionTest = () => {
    if (typeof window === 'undefined') return;

    const results = {
      localStorage: {} as Record<string, string>,
      sessionStorage: {} as Record<string, string>,
      supabaseKeys: [] as string[],
      customKeys: [] as string[],
      sessionManagerInfo: {} as Record<string, unknown>,
    };

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        results.localStorage[key] = value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'null';
        
        if (key.includes('supabase') || key.includes('sb-')) {
          results.supabaseKeys.push(key);
        }
        if (key.includes('lll-')) {
          results.customKeys.push(key);
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        results.sessionStorage[key] = value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'null';
      }
    }

    // Get session manager info
    try {
      results.sessionManagerInfo = sessionManager.getSessionInfo();
    } catch (error) {
      results.sessionManagerInfo = { error: String(error) };
    }

    setTestResults(results);
  };

  const forceSaveSession = async () => {
    try {
      const result = await sessionManager.forceSaveSession();
      alert(`Force save result: ${result.message}`);
      runSessionTest(); // Refresh test results
    } catch (error) {
      alert(`Force save error: ${error}`);
    }
  };

  const clearAllStorage = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.clear();
    sessionStorage.clear();
    alert('All storage cleared');
    runSessionTest();
  };

  useEffect(() => {
    runSessionTest();
  }, [user, session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Session Storage Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Auth State */}
            <div className="space-y-2">
              <h3 className="text-lg text-white">Current Auth State</h3>
              <div className="text-sm text-gray-300">
                <div>User: {user?.email || 'Not logged in'}</div>
                <div>Session exists: {session ? 'Yes' : 'No'}</div>
                <div>Session expires: {session ? new Date((session.expires_at || 0) * 1000).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={runSessionTest}>Refresh Test</Button>
              <Button onClick={forceSaveSession}>Force Save Session</Button>
              <Button onClick={clearAllStorage} variant="destructive">Clear All Storage</Button>
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg text-white mb-2">Supabase Keys Found ({testResults.supabaseKeys.length})</h3>
                  <div className="text-sm text-gray-300">
                    {testResults.supabaseKeys.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {testResults.supabaseKeys.map(key => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-red-400">❌ No Supabase keys found in localStorage</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-white mb-2">Custom Keys Found ({testResults.customKeys.length})</h3>
                  <div className="text-sm text-gray-300">
                    {testResults.customKeys.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {testResults.customKeys.map(key => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-red-400">❌ No custom session keys found</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-white mb-2">Session Manager Info</h3>
                  <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded max-h-64 overflow-auto">
                    {JSON.stringify(testResults.sessionManagerInfo, null, 2)}
                  </pre>
                </div>

                <details>
                  <summary className="text-white cursor-pointer">All localStorage Keys</summary>
                  <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded max-h-64 overflow-auto mt-2">
                    {JSON.stringify(testResults.localStorage, null, 2)}
                  </pre>
                </details>

                <details>
                  <summary className="text-white cursor-pointer">All sessionStorage Keys</summary>
                  <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded max-h-64 overflow-auto mt-2">
                    {JSON.stringify(testResults.sessionStorage, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}