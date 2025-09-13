# React Bricks Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### 🔧 **Local Development Verified**
- [x] React Bricks admin accessible at `/admin-rb`
- [x] All 4 homepage bricks created and functional
- [x] Page Editor tab added to admin dashboard
- [x] No TypeScript compilation errors
- [x] Environment variables configured in `.env.local`

### 🚀 **Vercel Configuration Required**

#### **Step 1: Add Environment Variables to Vercel**
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these three variables:

1. **REACT_BRICKS_API_KEY**
   - Value: `5b424a63-3b61-4be4-9a11-949ee485ace6`
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_REACT_BRICKS_APP_ID**  
   - Value: `f66e8afc-ebaf-4609-9b14-1b00b0454228`
   - Environment: Production, Preview, Development

3. **NEXT_PUBLIC_REACT_BRICKS_ENVIRONMENT**
   - Value: `main`
   - Environment: Production, Preview, Development

#### **Step 2: Deploy**
```bash
git add -A
git commit -m "feat: Add React Bricks content management system with homepage bricks"
git push origin main
```

#### **Step 3: Verify Deployment**
After deployment completes:

1. **Visit your live admin**: `https://your-domain.vercel.app/admin`
2. **Click "Page Editor" tab** - should show 6 cards with React Bricks tools
3. **Test each link**:
   - Editor Dashboard → `https://your-domain.vercel.app/admin-rb`
   - Visual Editor → `https://your-domain.vercel.app/admin-rb/editor`
   - Media Library → `https://your-domain.vercel.app/admin-rb/media`
   - Playground → `https://your-domain.vercel.app/admin-rb/playground`
   - App Settings → `https://your-domain.vercel.app/admin-rb/app-settings`

## 🎯 **Testing Your React Bricks Setup**

### **Test 1: Admin Navigation**
1. Go to `https://your-domain.vercel.app/admin`
2. Log in with admin credentials
3. Click "Page Editor" tab
4. Verify all 6 React Bricks tools are accessible

### **Test 2: Create Homepage with Bricks**
1. Open "Editor Dashboard" from Page Editor tab
2. Log in with React Bricks credentials
3. Click "Create New Page"
4. Select "Homepage" page type
5. Add bricks in order:
   - Welcoming Section
   - Categories Section  
   - Events & Specials Section
   - Bookings Section
6. Test visual editing of each brick
7. Preview and publish

### **Test 3: Visual Editing**
1. In each brick, test:
   - Click-to-edit text fields
   - Sidebar style controls
   - Drag-and-drop reordering
   - Preview functionality

## 🔍 **Troubleshooting**

### **If React Bricks doesn't load:**
- Check environment variables are saved in Vercel
- Verify no typos in variable names/values
- Check browser console for API errors
- Ensure you're logged into React Bricks dashboard

### **If bricks don't appear:**
- Check TypeScript compilation succeeded
- Verify all brick imports in `react-bricks/bricks/index.ts`
- Check page type configuration in `react-bricks/pageTypes.ts`

### **If styling looks wrong:**
- Verify Tailwind classes are building correctly
- Check neon color variables are defined
- Test responsive breakpoints

## 📋 **Post-Deployment Tasks**

- [ ] Test admin authentication integration
- [ ] Verify all original functionality preserved
- [ ] Test responsive design on mobile devices
- [ ] Create content editing guidelines for staff
- [ ] Set up backup/restore procedures for React Bricks content

---

**Ready for live testing!** 🚀