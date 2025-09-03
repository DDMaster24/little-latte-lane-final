# Editor Testing URLs

## Production Testing URLs (Live Site)
Replace `your-domain.com` with your actual Vercel domain:

- **Header Editor**: `https://your-domain.com/admin/page-editor/header`
- **Homepage Editor**: `https://your-domain.com/admin/page-editor/homepage`
- **Menu Editor**: `https://your-domain.com/admin/page-editor/menu`
- **Footer Editor**: `https://your-domain.com/admin/page-editor/footer`
- **Bookings Editor**: `https://your-domain.com/admin/page-editor/bookings`

## Local Testing URLs (Development)
- **Header Editor**: `http://localhost:3000/admin/page-editor/header`
- **Homepage Editor**: `http://localhost:3000/admin/page-editor/homepage`
- **Menu Editor**: `http://localhost:3000/admin/page-editor/menu`
- **Footer Editor**: `http://localhost:3000/admin/page-editor/footer`
- **Bookings Editor**: `http://localhost:3000/admin/page-editor/bookings`

## Testing Checklist Per Page
- [ ] Image upload (test with files under 10MB)
- [ ] Text content changes
- [ ] Color modifications
- [ ] Save functionality
- [ ] Load persistence (refresh page)
- [ ] Database storage verification
- [ ] Changes visible on actual website

## Critical Features to Test
1. **Image Upload System**:
   - File size validation (10MB limit)
   - Proper bucket routing (header-assets, page-editor, menu-images)
   - URL generation and database storage
   
2. **Database Operations**:
   - Save changes to theme_settings table
   - Load saved settings correctly
   - Proper error handling

3. **UI/UX**:
   - Responsive design
   - Loading states
   - Error messages
   - Success feedback
