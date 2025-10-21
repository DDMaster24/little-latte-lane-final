# Building AAB File for Google Play - Step-by-Step Guide

## ✅ Configuration Complete - Ready to Build

All configuration issues have been fixed:
- Capacitor properly configured for live backend
- Android network security configured
- AndroidManifest updated with security settings
- Capacitor synced successfully

---

## 🔨 Building the AAB File in Android Studio

### Step 1: Wait for Android Studio to Open
Android Studio should be opening now. Wait for it to fully load and index the project.

### Step 2: Build Signed Bundle
Once Android Studio is open:

1. Click **Build** menu → **Generate Signed Bundle / APK**
2. Select **Android App Bundle** → Click **Next**
3. **Key store path:** Navigate to your keystore file:
   ```
   C:\DDM Technology\Clients\Peet Erasmus - LL\little-latte-lane\android\little-latte-lane.keystore
   ```
4. Enter your keystore password
5. Enter your key alias (usually: `upload` or `key0`)
6. Enter your key password
7. Click **Next**

### Step 3: Build Configuration
1. Select destination folder: `C:\DDM Technology\Clients\Peet Erasmus - LL\little-latte-lane\android\app\release`
2. Select build variant: **release**
3. ✅ Check **V1 (Jar Signature)**
4. ✅ Check **V2 (Full APK Signature)**
5. Click **Finish**

### Step 4: Wait for Build
Android Studio will build the AAB file. This takes 2-5 minutes.
- You'll see progress in the bottom status bar
- Wait for "Build Successful" message

### Step 5: Locate the AAB File
Once complete:
```
C:\DDM Technology\Clients\Peet Erasmus - LL\little-latte-lane\android\app\release\app-release.aab
```

---

## 📤 Upload to Google Play Console

### Step 1: Open Google Play Console
1. Go to: https://play.google.com/console
2. Navigate to your app: **Little Latte Lane**

### Step 2: Navigate to Internal Testing
1. Click **Testing** → **Internal testing**
2. Click **Create new release**

### Step 3: Upload New AAB
1. Click **Upload** button
2. Select: `app-release.aab` from the release folder
3. Wait for upload to complete
4. Google Play will process the file (2-3 minutes)

### Step 4: Release Notes
Add release notes:
```
Version 1.0.1 - Configuration Fixes

Fixed Issues:
- Resolved app crash on startup
- Fixed network security configuration
- Improved HTTPS connectivity
- Enhanced stability

Please test on your devices and provide feedback!
```

### Step 5: Review and Rollout
1. Click **Review release**
2. Verify everything looks correct
3. Click **Start rollout to Internal testing**
4. Confirm rollout

---

## 📱 Testing the New Build

### Step 1: Wait for Rollout
Google Play takes 10-30 minutes to make the new version available to testers.

### Step 2: Update App on Devices
On each test device:
1. Open Google Play Store app
2. Search for "Little Latte Lane" or check "My apps & games"
3. Click **Update**
4. Wait for download to complete

### Step 3: Test Launch
1. Open the app
2. **Expected behavior:** 
   - App should show loading screen briefly
   - Then load Little Latte Lane website content
   - No crash!
3. Test navigation through the app
4. Test cart and menu functionality

---

## 🐛 If Issues Occur

### Check Google Play Console Pre-Launch Report
1. Go to **Release** → **Production** → **Pre-launch report**
2. Review any crashes or warnings
3. Check device compatibility issues

### Check Crash Logs
1. Go to **Quality** → **Vitals** → **Crashes & ANRs**
2. Look for crash stack traces
3. Share with developer if crashes persist

### Test Locally First (Optional)
Before uploading to Google Play, test locally:
```powershell
# Build debug APK
cd android
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Success Criteria

The new build is successful when:
- ✅ App launches without crashing
- ✅ Website content loads properly
- ✅ Navigation works smoothly
- ✅ Cart and checkout functional
- ✅ All 3 test devices work correctly

---

## 📊 What Changed in This Build

**Previous Build Issues:**
- `cleartext: true` in Capacitor config (security violation)
- Missing network security configuration
- Improper HTTP/HTTPS handling

**Current Build Fixes:**
- HTTPS-only configuration
- Network security config whitelists trusted domains
- Proper AndroidManifest security settings
- Clean redirect from www folder to live site

---

## 🎯 Next Steps After Successful Testing

Once all 3 devices confirm the app works:
1. Promote to **Production** track in Google Play Console
2. Submit for review
3. Wait for Google Play review (1-3 days)
4. App goes live on Google Play Store!

---

**Last Updated:** October 21, 2025
**Ready to build:** ✅ YES
