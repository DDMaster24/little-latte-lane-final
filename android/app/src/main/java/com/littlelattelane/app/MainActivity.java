package co.za.littlelattelane.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * Little Latte Lane - Capacitor Android App
 * 
 * Capacitor handles all WebView configuration, plugins, and native bridge.
 * Payment URLs are handled by the Browser plugin (configured in capacitor.config.ts).
 * 
 * See: https://capacitorjs.com/docs/android
 */
public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register plugins here if needed
        // registerPlugin(CustomPlugin.class);
        
        super.onCreate(savedInstanceState);
    }
}
