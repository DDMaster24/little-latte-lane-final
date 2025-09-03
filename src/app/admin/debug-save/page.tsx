'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Database, Save } from 'lucide-react';

interface TestResult {
  success: boolean;
  message?: string;
  details?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export default function DebugSavePage() {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [saveTestResult, setSaveTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      const { testDatabaseConnection } = await import('@/app/admin/actions');
      const result = await testDatabaseConnection();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      });
    } finally {
      setLoading(false);
    }
  };

  const testSaveOperation = async () => {
    setLoading(true);
    setSaveTestResult(null);
    
    try {
      const { saveThemeSetting } = await import('@/app/admin/actions');
      const result = await saveThemeSetting({
        setting_key: 'debug_save_test',
        setting_value: 'Test value ' + new Date().toISOString(),
        category: 'page_editor',
        page_scope: 'homepage'
      });
      setSaveTestResult(result);
    } catch (error) {
      setSaveTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Database Save Debug</h1>
        <p className="text-gray-400">Test database connection and save functionality</p>
      </div>

      {/* Database Connection Test */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Database Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDatabaseConnection}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </Button>
          
          {testResults && (
            <div className={`p-4 rounded-lg border ${
              testResults.success 
                ? 'bg-green-900/20 border-green-500 text-green-400' 
                : 'bg-red-900/20 border-red-500 text-red-400'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResults.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {testResults.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <p className="mb-2">{testResults.message}</p>
              {testResults.details && (
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
                  {JSON.stringify(testResults.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Operation Test */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Save className="w-5 h-5" />
            Save Operation Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testSaveOperation}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Testing...' : 'Test Save Operation'}
          </Button>
          
          {saveTestResult && (
            <div className={`p-4 rounded-lg border ${
              saveTestResult.success 
                ? 'bg-green-900/20 border-green-500 text-green-400' 
                : 'bg-red-900/20 border-red-500 text-red-400'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {saveTestResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {saveTestResult.success ? 'Save Successful' : 'Save Failed'}
                </span>
              </div>
              <p className="mb-2">{saveTestResult.message}</p>
              {saveTestResult.data && (
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
                  {JSON.stringify(saveTestResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p>1. First run the Database Connection Test to verify basic connectivity</p>
          <p>2. Then run the Save Operation Test to verify save functionality</p>
          <p>3. Check browser console (F12) for detailed debug logs</p>
          <p>4. If tests fail, the error details will help identify the issue</p>
        </CardContent>
      </Card>
    </div>
  );
}
