# 🖼️ IMAGE UPLOAD TESTING GUIDE - Header Editor

## ✅ COMPLETE IMAGE UPLOAD WORKFLOW

### **How the System Works:**

1. **Upload Flow**: File → Supabase Storage → Database → Preview → Save
2. **File Support**: PNG, JPEG, JPG, GIF, WebP (up to 5MB)
3. **Storage**: Supabase Storage bucket `menu-images`
4. **Database**: Saved to `page_settings` table with key `{element-id}_image`
5. **Preview System**: Shows changes immediately before database save

### **Step-by-Step Testing:**

#### **1. Access Header Editor**
- Go to: `http://localhost:3001/admin/page-editor/header`
- You should see the website header with editing toolbar

#### **2. Select Logo Image**
- Click on the **logo image** (Little Latte Lane logo)
- Status bar should show: "Selected: header-logo"
- Logo should get a cyan outline when selected

#### **3. Open Image Tool**
- Click **"Image"** button in toolbar (orange icon)
- Image panel should appear with "Upload Image" button

#### **4. Upload New Image**
- Click **"Upload Image"** button
- Modal should open with tabs: Upload, URL, Stock, Emoji
- In **Upload tab**: Click "Choose File"
- Select any PNG/JPEG file from your computer
- File should upload and show success toast
- Preview should appear in modal

#### **5. Apply and Preview**
- Click **"Apply"** button in modal
- Modal closes
- Logo should **immediately change** to your uploaded image
- Toast should say: "🖼️ Image Preview Applied"
- Top bar should show: "1 pending changes"

#### **6. Save to Database**
- Click **"Save Changes"** button (green)
- Toast should say: "✅ All Changes Saved!"
- Changes are now permanent in database

#### **7. Test Discard (Optional)**
- Upload another image following steps 4-5
- Click **"Discard"** button (red) instead of Save
- Logo should revert to previous state
- Toast should say: "🔄 Changes Discarded"

### **Alternative Upload Methods:**

#### **URL Method:**
- Select logo → Image tool → URL tab
- Paste any image URL (e.g., from Unsplash)
- Preview and Apply

#### **Stock Images:**
- Select logo → Image tool → Stock tab  
- Click any stock image thumbnail
- Apply immediately

#### **Emoji Icons:**
- Select logo → Image tool → Emoji tab
- Click any emoji
- Apply (useful for simple icons)

### **Expected Results:**

✅ **Upload Success**: Image uploads to Supabase Storage
✅ **Preview Works**: Logo changes immediately in editor
✅ **Database Save**: Setting saved with key `header-logo_image`
✅ **File Validation**: Only accepts image files under 5MB
✅ **Error Handling**: Shows clear error messages for failures
✅ **Revert Function**: Discard button restores original image

### **Troubleshooting:**

❌ **Upload Fails**: Check Supabase Storage bucket `menu-images` exists
❌ **Preview Not Showing**: Check browser console for JavaScript errors  
❌ **Save Fails**: Check Supabase service key permissions
❌ **Large Files**: Files over 5MB will be rejected

### **Technical Details:**

- **Storage Bucket**: `menu-images` (auto-created if missing)
- **File Path Format**: `images/{timestamp}-{random}.{ext}`
- **Database Table**: `page_settings`
- **Setting Key**: `header-logo_image`
- **Setting Value**: Full Supabase Storage URL

### **Next Steps:**

Once logo image upload works, the same system works for:
- Any element with `data-editable` attribute
- Background images for sections
- Icon replacements
- Menu item images (when menu editor is created)

The system is designed to be universal - any editable element can have its image changed using this same workflow.
