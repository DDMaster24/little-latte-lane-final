'use client'

import { useEffect, useState } from 'react'
import { Admin } from 'react-bricks'

export default function TestReactBricksPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any[] = []
      
      // Test 1: Environment Variables
      results.push({
        test: 'Environment Variables',
        status: 'info',
        details: {
          API_KEY: process.env.NEXT_PUBLIC_API_KEY ? '✓ Present' : '❌ Missing',
          APP_ID: process.env.NEXT_PUBLIC_APP_ID ? '✓ Present' : '❌ Missing',
          ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'Not set'
        }
      })

      // Test 2: React Bricks Import
      try {
        const reactBricks = await import('react-bricks')
        results.push({
          test: 'React Bricks Import',
          status: 'success',
          details: 'Successfully imported React Bricks package'
        })
      } catch (error) {
        results.push({
          test: 'React Bricks Import',
          status: 'error',
          details: `Failed to import: ${error}`
        })
      }

      // Test 3: Direct API Test
      try {
        const response = await fetch('/api/test-react-bricks-connection')
        const data = await response.json()
        results.push({
          test: 'API Connection Test',
          status: response.ok ? 'success' : 'error',
          details: data
        })
      } catch (error) {
        results.push({
          test: 'API Connection Test',
          status: 'error',
          details: `Connection failed: ${error}`
        })
      }

      // Test 4: Admin Component Loading
      try {
        results.push({
          test: 'Admin Component',
          status: 'info',
          details: 'Admin component available for testing below'
        })
      } catch (error) {
        results.push({
          test: 'Admin Component',
          status: 'error',
          details: `Admin component failed: ${error}`
        })
      }

      setTestResults(results)
      setIsLoading(false)
    }

    runDiagnostics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">React Bricks Diagnostics</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-gray-300">Running diagnostics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-darkBg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">React Bricks Diagnostics</h1>
        
        {/* Test Results */}
        <div className="space-y-6 mb-8">
          {testResults.map((result, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  result.status === 'success' ? 'bg-green-500' :
                  result.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <h3 className="text-xl font-semibold text-white">{result.test}</h3>
              </div>
              <div className="text-gray-300">
                {typeof result.details === 'object' ? (
                  <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                ) : (
                  <p>{result.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live React Bricks Admin Test */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Live React Bricks Admin Test</h3>
          <p className="text-gray-300 mb-4">
            This should load the React Bricks admin interface. If you see errors here, 
            it confirms the connection issue:
          </p>
          
          <div className="border border-gray-600 rounded-lg p-4 min-h-[400px]">
            <Admin />
          </div>
        </div>

        {/* Browser Console Instructions */}
        <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-yellow-200 mb-3">📋 Check Browser Console</h3>
          <p className="text-yellow-100 mb-2">
            Open your browser's developer tools (F12) and check the Console tab for any errors.
          </p>
          <p className="text-yellow-100">
            Look specifically for errors related to "react-bricks", "admin", or "session".
          </p>
        </div>
      </div>
    </div>
  )
}