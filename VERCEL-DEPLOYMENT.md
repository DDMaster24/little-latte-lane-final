# 🚀 Vercel Deployment Guide

This guide covers deploying Little Latte Lane to Vercel production environment.

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables Setup**
Configure these in your Vercel dashboard under `Settings > Environment Variables`:

#### Required Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://awytuszmunxvthuizyur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

#### PayFast Configuration (Production):
```bash
NEXT_PUBLIC_PAYFAST_SANDBOX=false
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key  
PAYFAST_PASSPHRASE=your_passphrase
```

#### Optional Variables:
```bash
NEXT_PUBLIC_SUPABASE_PROJECT_ID=awytuszmunxvthuizyur
NODE_ENV=production
```

### 2. **Domain Configuration**
- Set up your custom domain in Vercel dashboard
- Update Supabase Auth settings with your production domain
- Update PayFast merchant settings with production URLs

### 3. **Database Configuration**
- Ensure RLS policies are properly set up
- Verify menu data is populated
- Test database connections from production

## 🔧 Deployment Steps

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `DDMaster24/little-latte-lane`
4. Configure build settings (auto-detected)

### Step 2: Configure Environment Variables
1. In Vercel dashboard, go to `Settings > Environment Variables`
2. Add all required environment variables
3. Set appropriate environments (Production, Preview, Development)

### Step 3: Deploy
1. Trigger deployment from main branch
2. Monitor build logs for any issues
3. Test deployment at provided URL

### Step 4: Custom Domain (Optional)
1. Add your custom domain in Vercel dashboard
2. Update DNS records as instructed
3. Update Supabase auth settings with new domain

## 🔍 Post-Deployment Verification

### Health Check
Visit: `https://your-domain.vercel.app/health`
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "payments": "configured"
  }
}
```

### Functionality Tests
- [ ] Home page loads correctly
- [ ] Menu categories display
- [ ] User authentication works
- [ ] Order placement functions
- [ ] Admin panel accessible (for admin users)
- [ ] Payment flow completes

### Performance Tests
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] PWA installation works
- [ ] Service Worker caching active

## 🛠️ Troubleshooting

### Common Issues:

**Build Failures:**
- Check environment variables are set correctly
- Verify TypeScript compilation passes locally
- Review build logs for specific errors

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check RLS policies allow access
- Test connection with direct queries

**Authentication Problems:**
- Update Supabase Auth settings with production domain
- Verify JWT secret configuration
- Check CORS settings

**Payment Issues:**
- Verify PayFast merchant settings
- Check production vs sandbox configuration
- Test with small amounts first

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance and usage
- Set up alerts for errors

### Supabase Monitoring
- Monitor database performance
- Track authentication metrics
- Review error logs

### Health Checks
- Automated health checks via `/api/health`
- Monitor uptime and response times
- Set up notifications for downtime

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`):
- Runs on push to main branch
- Performs linting and type checking
- Builds and tests the application
- Automatically deploys to Vercel

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase dashboard for database issues
3. Test locally with production environment variables
4. Contact support if issues persist

---

**Important:** Always test thoroughly in preview deployments before promoting to production!
