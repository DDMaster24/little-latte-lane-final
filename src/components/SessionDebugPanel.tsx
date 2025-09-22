/**
 * Session Debug Panel
 * Temporary component for testing session persistence
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SessionDebugPanel() {
  const { user, session, loading } = useAuth();
  const { 
    isSessionStored, 
    lastSaveTime, 
    forceSaveSession, 
    clearAllSessions, 
    getSessionInfo 
  } = useSessionPersistence();
  
  const [sessionInfo, setSessionInfo] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateInfo = () => {
      setSessionInfo(getSessionInfo());
    };
    
    updateInfo();
    const interval = setInterval(updateInfo, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [getSessionInfo]);

  const handleForceSave = async () => {
    const result = await forceSaveSession();
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearAll = () => {
    const result = clearAllSessions();
    setMessage(result.message);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 bg-gray-800 text-white border-gray-600">
        <CardHeader>
          <CardTitle className="text-sm">Session Debug - Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gray-800 text-white border-gray-600 z-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Session Debug Panel
          <Badge variant={user ? "default" : "destructive"}>
            {user ? "Logged In" : "Logged Out"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* User Info */}
        <div className="text-xs">
          <strong>User:</strong> {user?.email || 'Not logged in'}
        </div>
        
        {/* Session Status */}
        <div className="text-xs">
          <strong>Session Stored:</strong>{' '}
          <Badge variant={isSessionStored ? "default" : "destructive"}>
            {isSessionStored ? 'Yes' : 'No'}
          </Badge>
        </div>

        {/* Last Save Time */}
        {lastSaveTime && (
          <div className="text-xs">
            <strong>Last Save:</strong> {lastSaveTime.toLocaleTimeString()}
          </div>
        )}

        {/* Session Info */}
        {sessionInfo && 'storageInfo' in sessionInfo && (
          <div className="text-xs space-y-1">
            <div><strong>Storage Status:</strong></div>
            <div className="ml-2 space-y-1">
              <div>Session Data: {Boolean((sessionInfo.storageInfo as Record<string, unknown>)?.sessionData) ? '✅' : '❌'}</div>
              <div>Refresh Token: {Boolean((sessionInfo.storageInfo as Record<string, unknown>)?.refreshToken) ? '✅' : '❌'}</div>
              <div>Access Token: {Boolean((sessionInfo.storageInfo as Record<string, unknown>)?.accessToken) ? '✅' : '❌'}</div>
              <div>Supabase Auth: {Boolean((sessionInfo.storageInfo as Record<string, unknown>)?.supabaseAuth) ? '✅' : '❌'}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleForceSave}
            disabled={!user}
            className="flex-1"
          >
            Save Session
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleClearAll}
            className="flex-1"
          >
            Clear All
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className="text-xs p-2 bg-gray-700 rounded border">
            {message}
          </div>
        )}

        {/* Session Expiry */}
        {session && (
          <div className="text-xs">
            <strong>Expires:</strong> {new Date((session.expires_at || 0) * 1000).toLocaleString()}
          </div>
        )}

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}