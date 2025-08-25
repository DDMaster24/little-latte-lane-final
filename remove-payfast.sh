#!/bin/bash
# PayFast Complete Removal Script
# Run this to remove all PayFast traces from the codebase

echo "🗑️ Starting PayFast Complete Removal..."

# Step 1: Remove PayFast API routes and directories
echo "📁 Removing PayFast API routes..."
rm -rf "src/app/api/payfast"
rm -rf "src/app/api/payfast-signature-verification"

# Step 2: Remove PayFast service and component files
echo "🔧 Removing PayFast service and component files..."
rm -f "src/lib/payfast.ts"
rm -f "src/components/PayFastPayment.tsx"

# Step 3: List files that need manual editing (PayFast references)
echo "📝 Files that need manual PayFast reference removal:"
echo "  - src/middleware.ts (remove PayFast CORS handling)"
echo "  - src/lib/env.ts (remove PayFast environment variables)"
echo "  - src/components/CartSidebar.tsx (update payment import)"
echo "  - README.md (remove PayFast documentation)"

echo "✅ PayFast file removal complete!"
echo "⚠️  Remember to:"
echo "   1. Remove PayFast environment variables from .env.local"
echo "   2. Remove PayFast environment variables from Vercel dashboard"
echo "   3. Manually edit the files listed above"

# Display current project structure after removal
echo "📊 Current API structure:"
ls -la src/app/api/
