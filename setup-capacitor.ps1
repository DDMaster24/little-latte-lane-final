# Little Latte Lane - Capacitor Setup Script
# This script installs Capacitor and configures native app support

Write-Host "🚀 Setting up Capacitor for Little Latte Lane..." -ForegroundColor Cyan

# Install Capacitor core
Write-Host "📦 Installing Capacitor core..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli --save

# Install platform-specific packages
Write-Host "📱 Installing Android and iOS support..." -ForegroundColor Yellow
npm install @capacitor/android @capacitor/ios --save

# Install push notification plugin
Write-Host "🔔 Installing push notification plugin..." -ForegroundColor Yellow
npm install @capacitor/push-notifications --save

# Install Firebase Admin SDK for server-side
Write-Host "🔥 Installing Firebase Admin SDK..." -ForegroundColor Yellow
npm install firebase-admin --save

# Install APNS for iOS push
Write-Host "🍎 Installing APNS for iOS..." -ForegroundColor Yellow
npm install apns2 --save

Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npx cap init" -ForegroundColor White
Write-Host "   - App name: Little Latte Lane" -ForegroundColor Gray
Write-Host "   - App ID: com.littlelattelane.app" -ForegroundColor Gray
Write-Host "   - Web directory: out" -ForegroundColor Gray
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Run: npm run export" -ForegroundColor White
Write-Host "4. Run: npx cap add android" -ForegroundColor White
Write-Host "5. Run: npx cap add ios" -ForegroundColor White

