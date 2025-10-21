package co.za.littlelattelane.app;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.net.Uri;
import android.content.Intent;
import android.view.KeyEvent;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.splashscreen.SplashScreen;

/**
 * Little Latte Lane - Native Android WebView App
 * Loads production website in optimized WebView container
 */
public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String WEBSITE_URL = "https://www.littlelattelane.co.za";
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1;
    
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install splash screen (Android 12+ API)
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        
        super.onCreate(savedInstanceState);
        
        // Create and configure WebView
        webView = new WebView(this);
        setContentView(webView);
        
        setupWebView();
        
        // Load production website
        webView.loadUrl(WEBSITE_URL);
    }
    
    /**
     * Configure WebView with optimal settings for web app
     */
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        
        // JavaScript (required for Next.js/React)
        settings.setJavaScriptEnabled(true);
        
        // Storage (authentication, cart, local data)
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Viewport and layout
        settings.setBuiltInZoomControls(false);
        settings.setSupportZoom(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        // Security settings
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        
        // Performance optimizations
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setEnableSmoothTransition(true);
        
        // Media settings
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // User agent (identify as app)
        String userAgent = settings.getUserAgentString();
        settings.setUserAgentString(userAgent + " LittleLatteLaneApp/1.0");
        
        // Enable cookies (for authentication)
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);
        
        // WebViewClient (handle navigation)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Keep all navigation within app
                view.loadUrl(url);
                return true;
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                // Could show custom error page here if needed
            }
        });
        
        // WebChromeClient (JavaScript alerts, file upload, etc.)
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                // Handle file uploads (camera, gallery)
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;
                
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });
    }
    
    /**
     * Handle back button - navigate back in WebView history
     */
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    /**
     * Handle file upload results
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return;
            
            Uri[] results = null;
            if (resultCode == RESULT_OK && intent != null) {
                String dataString = intent.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }
    
    /**
     * Handle key events (for hardware back button)
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    
    /**
     * Cleanup on destroy
     */
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
