# 🎨 LOGO SPECIFICATIONS FOR DESIGNER

## 📋 **DESIGNER BRIEF - Little Latte Lane Logo**

### **🎯 BRAND IDENTITY**
- **Business Name:** Little Latte Lane
- **Tagline:** Café and Deli
- **Industry:** Restaurant/Café with neon aesthetic
- **Style:** Modern neon sign effect, vibrant, welcoming

### **🌈 COLOR SCHEME**
- **Primary:** Cyan/Turquoise (#00FFFF or #1dd3b0)
- **Secondary:** Magenta/Pink (#FF00FF or #ff0080)
- **Alternative:** Electric blue (#0066ff)
- **Background:** Works on dark backgrounds (website has dark theme)

### **📐 TECHNICAL SPECIFICATIONS**

#### **🔍 REQUIRED FORMATS & SIZES:**

**1. PRIMARY LOGO (SVG Format - MOST IMPORTANT)**
- Format: SVG vector file
- Purpose: Infinite scalability, crisp at any size
- Text: "LITTLE LATTE LANE" + "Café and Deli" subtitle
- Style: Neon tube effect with glow

**2. HIGH-RESOLUTION PNG VERSIONS:**
- **Ultra HD:** 2048x2048px (for future-proofing)
- **Standard HD:** 1024x1024px (main web use)
- **Medium:** 512x512px (mobile/thumbnails)
- **Small:** 256x256px (favicons/icons)
- **Transparency:** All PNG versions need transparent backgrounds
- **Quality:** Maximum quality, no compression artifacts

**3. FAVICON PACKAGE:**
- **16x16px** (browser tab icon)
- **32x32px** (desktop shortcut)
- **48x48px** (Windows icon)
- **ICO format** for favicon.ico

**4. PWA/MOBILE ICONS:**
- **192x192px** (Android home screen)
- **512x512px** (Android splash screen)
- **180x180px** (Apple touch icon)

### **🎨 DESIGN REQUIREMENTS**

#### **Typography Guidelines:**
- **Font Style:** Bold, thick, sans-serif (like Arial Black, Impact, or custom)
- **Main Text:** "LITTLE LATTE LANE" - dominant, large
- **Subtitle:** "Café and Deli" - smaller, complementary
- **Readability:** Text must be clearly readable at small sizes (80px width)

#### **Neon Effect Specifications:**
- **Glow Effect:** Multiple layers of outer glow
- **Inner Glow:** Bright core color
- **Outer Glow:** Softer, larger radius (20-30px blur)
- **Shadow:** Subtle drop shadow for depth
- **Animation Ready:** Design should work for potential CSS animations

#### **Layout Options:**
1. **Horizontal Layout:** Main text with subtitle below
2. **Stacked Layout:** Centered, subtitle underneath
3. **Compact Version:** For mobile/small spaces

### **📱 USAGE CONTEXTS**

**Where the logo will be used:**
- Website header (80px to 144px height)
- Mobile app icons
- QR code backgrounds
- Print materials
- Social media profiles
- Business cards
- Signage

### **⚡ CURRENT WEBSITE IMPLEMENTATION**

**Current logo display sizes:**
```css
/* Desktop */
width: 144px, height: auto

/* Tablet */  
width: 120px, height: auto

/* Mobile */
width: 80px, height: auto
```

**CSS Integration Ready:**
- The website can use SVG directly
- PNG fallbacks for older browsers
- Responsive sizing already implemented

### **🔧 DELIVERY REQUIREMENTS**

#### **File Naming Convention:**
```
little-latte-lane-logo.svg          (main SVG)
little-latte-lane-logo-2048.png     (ultra HD)
little-latte-lane-logo-1024.png     (standard HD)
little-latte-lane-logo-512.png      (medium)
little-latte-lane-logo-256.png      (small)
little-latte-lane-logo-192.png      (PWA icon)
little-latte-lane-logo-180.png      (Apple icon)
little-latte-lane-logo-48.png       (Windows icon)
little-latte-lane-logo-32.png       (desktop icon)
little-latte-lane-logo-16.png       (favicon)
favicon.ico                          (browser icon)
```

#### **Technical Notes for Designer:**
- **SVG Export:** Ensure text is converted to paths/outlines
- **PNG Quality:** Use maximum quality, no compression
- **Transparency:** All backgrounds must be transparent
- **Color Profile:** RGB color space
- **Glow Effects:** Must be rasterized in PNG versions

### **🎯 DESIGN INSPIRATION**

**Reference Style:** 
- Las Vegas neon signs
- Modern café branding
- Electric/cyberpunk aesthetics
- Clean, readable typography
- Vibrant, welcoming colors

**Avoid:**
- Overly complex designs
- Hard-to-read fonts
- Dull colors
- Elements that don't scale well

### **📋 DESIGNER CHECKLIST**

- [ ] SVG version with scalable text
- [ ] All 10 PNG sizes exported
- [ ] Transparent backgrounds on all files
- [ ] Neon glow effects applied
- [ ] Text clearly readable at smallest size
- [ ] Files properly named
- [ ] ICO favicon created
- [ ] Colors match brand palette
- [ ] Design works on dark backgrounds

### **🚀 QUICK IMPLEMENTATION**

Once you receive the files:
1. **SVG goes in:** `public/images/`
2. **PNGs go in:** `public/images/`
3. **Favicon goes in:** `public/`
4. **One line of code change** in Header.tsx
5. **Instant deployment** via git push

---

**TOTAL FILES NEEDED: 11 files (1 SVG + 9 PNGs + 1 ICO)**

This specification ensures your logo will look perfect everywhere - from business cards to billboards! 🌟
