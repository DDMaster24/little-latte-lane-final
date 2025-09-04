# 🎨 LOGO & FAVICON UPDATE GUIDE
## Little Latte Lane - Complete Logo Update Process

### 📁 **STEP 1: SAVE YOUR LOGO FILE**

1. **Save your new logo** in this directory:
   ```
   public/images/your-new-logo.png
   ```

2. **Recommended specifications:**
   - **Format**: PNG with transparent background (preferred) or JPG
   - **Size**: At least 256x256 pixels (square format works best)
   - **Resolution**: High quality for crisp display
   - **File name**: Use descriptive name like `little-latte-lane-logo.png`

### 🚀 **STEP 2: AUTOMATED UPDATE (RECOMMENDED)**

Run the automated script:
```bash
node update-logo-favicon.js your-logo-filename.png
```

**Example:**
```bash
node update-logo-favicon.js little-latte-lane-logo.png
```

This will automatically:
- ✅ Update the header logo in the database
- ✅ Update the default logo file
- ✅ Provide PWA icon recommendations

### 🔧 **STEP 3: MANUAL UPDATE (ALTERNATIVE)**

If you prefer manual control:

#### Update Header Logo:
1. Go to **Admin Dashboard** → **Page Editor** → **Header**
2. Upload your new logo using the image editor
3. Save changes

#### Update Default Logo:
1. Replace `public/images/new-logo.png` with your new logo
2. Keep the filename as `new-logo.png` or update references

#### Update Favicon & PWA Icons:
1. Create these optimized versions of your logo:
   - `public/icon-192x192.png` (192x192 pixels)
   - `public/icon-512x512.png` (512x512 pixels)
   - `public/favicon.ico` (32x32 pixels, ICO format)

### 📱 **STEP 4: PWA OPTIMIZATION**

For the best app experience, create these specific sizes:

```
public/
├── icon-192x192.png     # 192x192 pixels
├── icon-512x512.png     # 512x512 pixels  
├── favicon.ico          # 32x32 pixels
└── images/
    └── your-logo.png    # Original high-res
```

### 🎯 **WHAT GETS UPDATED:**

1. **Header Logo** (top-left of website)
2. **Favicon** (browser tab icon)
3. **PWA Icons** (app icons when installed)
4. **Apple Touch Icons** (iOS home screen)

### ✅ **VERIFICATION STEPS:**

After updating:
1. **Refresh the website** - new logo should appear in header
2. **Check browser tab** - favicon should be updated
3. **Test PWA install** - app icon should use new logo
4. **Mobile devices** - check home screen icon

### 🚀 **DEPLOYMENT:**

After updating locally:
```bash
git add public/images/your-new-logo.png
git add public/icon-*.png  # if you created PWA icons
git commit -m "Update logo and favicon"
git push origin main
```

The changes will automatically deploy to your live site!

### 🛠️ **TROUBLESHOOTING:**

**Logo not showing?**
- Clear browser cache
- Check file path in `public/images/`
- Verify file permissions

**Favicon not updating?**
- Clear browser cache completely
- Check multiple browsers
- Wait for deployment to complete

**PWA icon not updating?**
- Uninstall and reinstall the PWA
- Clear browser data
- Check manifest.json references

### 💡 **PRO TIPS:**

1. **Use PNG format** for best quality and transparency
2. **Square logos work best** for all icon sizes
3. **Test on multiple devices** before final deployment
4. **Keep backups** of your original logo files
5. **Optimize file sizes** for faster loading

---

Need help? The automated script will guide you through the process step by step!
