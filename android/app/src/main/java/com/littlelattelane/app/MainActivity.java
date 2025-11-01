package co.za.littlelattelane.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Little Latte Lane - Capacitor Android App
 * 
 * Native deep link handler for payment redirects.
 * This persists even when app loses focus (e.g., when user switches to banking app).
 * 
 * Payment flow:
 * 1. User clicks Pay Now → Browser opens
 * 2. User switches to banking app to approve → MainActivity stays in background
 * 3. Payment completes → Yoco redirects to littlelattelane.co.za
 * 4. Android launches MainActivity via deep link
 * 5. onNewIntent() detects payment redirect → closes browser
 * 
 * See: https://capacitorjs.com/docs/android
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "LittleLatteLane";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "✅ MainActivity created - native deep link handler active");
        
        // Handle intent if app was launched via deep link
        handleDeepLink(getIntent());
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        // CRITICAL: Set the intent so getIntent() returns the new one
        setIntent(intent);
        
        Log.d(TAG, "🔗 onNewIntent called - checking for payment redirect");
        
        // Handle deep link when app is already running
        handleDeepLink(intent);
    }
    
    /**
     * Handle deep link URIs (payment redirects from Yoco)
     */
    private void handleDeepLink(Intent intent) {
        if (intent == null) {
            return;
        }
        
        Uri data = intent.getData();
        if (data == null) {
            Log.d(TAG, "ℹ️ No URI data in intent");
            return;
        }
        
        String url = data.toString();
        Log.d(TAG, "🔗 Deep link received: " + url);
        
        // Check if this is a payment callback redirect
        boolean hasPaymentStatus = url.contains("payment=success") || 
                                   url.contains("payment=cancelled") || 
                                   url.contains("payment=failed");
        
        if (hasPaymentStatus) {
            Log.d(TAG, "💳 Payment redirect detected - closing browser");
            
            // Close the Capacitor Browser plugin - TRY MULTIPLE APPROACHES
            try {
                // Method 1: Direct WebView eval (synchronous on UI thread)
                runOnUiThread(() -> {
                    try {
                        // Close browser via Capacitor plugin
                        String jsCode = 
                            "(async function() {" +
                            "  console.log('🔴 Native: Attempting to close browser');" +
                            "  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {" +
                            "    await window.Capacitor.Plugins.Browser.close();" +
                            "    console.log('✅ Native: Browser closed successfully');" +
                            "    return true;" +
                            "  } else {" +
                            "    console.error('❌ Native: Capacitor Browser plugin not available');" +
                            "    return false;" +
                            "  }" +
                            "})();";
                        
                        getBridge().getWebView().evaluateJavascript(jsCode, result -> {
                            Log.d(TAG, "✅ JavaScript eval result: " + result);
                        });
                        
                    } catch (Exception e) {
                        Log.e(TAG, "❌ Method 1 failed: " + e.getMessage());
                    }
                });
                
                // Method 2: Post delayed command (in case WebView needs time to initialize)
                getBridge().getWebView().postDelayed(() -> {
                    try {
                        String jsCode = "window.Capacitor?.Plugins?.Browser?.close();";
                        getBridge().getWebView().evaluateJavascript(jsCode, null);
                        Log.d(TAG, "✅ Delayed browser close command sent");
                    } catch (Exception e) {
                        Log.e(TAG, "❌ Method 2 failed: " + e.getMessage());
                    }
                }, 500); // 500ms delay
                
            } catch (Exception e) {
                Log.e(TAG, "❌ Error closing browser: " + e.getMessage());
            }
        } else {
            Log.d(TAG, "ℹ️ Not a payment redirect, ignoring");
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "📱 MainActivity resumed - ready to handle deep links");
    }
}
