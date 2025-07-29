# 🚀 Free Platform Deployment Guide

## 📋 **Quick Start (5 minutes)**

### **Step 1: Set Up Environment Variables**

Create a `.env` file in your backend directory with these settings:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001

# MongoDB Atlas (Free Tier)
MONGODB_URI=mongodb+srv://devbaweja576:cVnRyyo9oONo6Xn5@bumble.wiowvrq.mongodb.net/dating-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-123456789
JWT_EXPIRE=7d

# Email Configuration (Resend - Free Tier)
RESEND_API_KEY=re_your-resend-api-key-here
FRONTEND_URL=https://dating-app-frontend-ten.vercel.app

# Rate Limiting (Conservative for free tier)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
SLOW_DOWN_DELAY_AFTER=25
SLOW_DOWN_DELAY_MS=1000

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://dating-app-frontend-ten.vercel.app

# Monitoring (Free tier)
LOG_LEVEL=info

# Feature Flags (Free tier limitations)
ENABLE_PREMIUM_FEATURES=false
ENABLE_VERIFICATION=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true

# Database Optimization (Free tier)
MONGODB_MAX_POOL_SIZE=5
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000

# Cache Configuration (Free tier)
CACHE_TTL=1800
CACHE_MAX_SIZE=500

# File Upload Limits (Free tier)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Matching Algorithm (Free tier)
MATCH_BATCH_SIZE=10
COMPATIBILITY_THRESHOLD=50
LOCATION_RADIUS_KM=25

# Premium Features (Disabled for free tier)
PREMIUM_PRICE_MONTHLY=0
PREMIUM_PRICE_YEARLY=0
SUPER_LIKE_LIMIT=1
BOOST_DURATION_HOURS=0

# Analytics (Free tier)
ANALYTICS_ENABLED=true
ANALYTICS_SAMPLE_RATE=0.05

# Backup Configuration (Free tier)
BACKUP_ENABLED=false
BACKUP_FREQUENCY=weekly
BACKUP_RETENTION_DAYS=7
```

### **Step 2: Deploy to Railway (Free)**

1. **Go to Railway**: https://railway.app
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `devbaweja/dating-app-backend`
6. **Railway will auto-detect Node.js and deploy**

### **Step 3: Set Environment Variables in Railway**

In your Railway project dashboard:

1. **Go to Variables tab**
2. **Add these environment variables** (copy from your .env file):
   - `NODE_ENV=production`
   - `PORT=5001`
   - `MONGODB_URI=your-mongodb-uri`
   - `JWT_SECRET=your-jwt-secret`
   - `RESEND_API_KEY=your-resend-api-key`
   - `FRONTEND_URL=https://dating-app-frontend-ten.vercel.app`

### **Step 4: Get Your Railway URL**

1. **Go to your Railway project**
2. **Click on your service**
3. **Copy the generated URL** (e.g., `https://web-production-xxxx.up.railway.app`)

### **Step 5: Update Frontend**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your dating app frontend project**
3. **Go to Settings > Environment Variables**
4. **Add/Update**: `REACT_APP_API_URL=https://your-railway-url.railway.app`
5. **Redeploy the frontend**

### **Step 6: Test Your App**

1. **Visit your frontend**: https://dating-app-frontend-ten.vercel.app
2. **Register a new user**
3. **Test login functionality**
4. **Test password reset**
5. **Check if profiles load**

## 🎯 **Free Tier Limitations & Solutions**

### **Current Free Tier Limits:**
- **Railway**: 500 hours/month, 512MB RAM, 0.5 vCPU
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Resend**: 3,000 emails/month
- **Vercel**: 100GB bandwidth/month

### **Optimizations for Free Tier:**
- ✅ **Reduced rate limits** (50 requests/15min)
- ✅ **Smaller batch sizes** (10 profiles at a time)
- ✅ **Conservative caching** (30 minutes)
- ✅ **Disabled premium features**
- ✅ **Optimized database queries**

## 🚀 **Scaling Plan for 100K Users**

### **When Ready to Scale:**

#### **Railway Scaling ($20/month):**
- Upgrade to Railway Pro
- 2GB RAM, 2 vCPU
- Auto-scaling enabled
- Custom domains

#### **Database Scaling ($57/month):**
- MongoDB Atlas M50+
- 10GB storage
- Read replicas
- Automated backups

#### **Monitoring Scaling:**
- Sentry for error tracking
- New Relic for performance
- Grafana dashboards

#### **Security Scaling:**
- CloudFlare for DDoS protection
- Advanced rate limiting
- Security monitoring

## 📊 **Free Monitoring Setup**

### **Built-in Monitoring:**
1. **Railway Dashboard**: Logs, metrics, uptime
2. **MongoDB Atlas**: Database performance
3. **Vercel Analytics**: Frontend metrics

### **Free External Monitoring:**
1. **UptimeRobot**: Set up monitoring for your Railway URL
2. **Google Analytics**: Track user behavior
3. **LogRocket**: Session replay (free tier)

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Railway Deployment Fails:**
```bash
# Check logs in Railway dashboard
# Ensure all environment variables are set
# Verify MongoDB connection
```

#### **Frontend Can't Connect to Backend:**
```bash
# Check CORS settings
# Verify Railway URL is correct
# Test API endpoints directly
```

#### **Database Connection Issues:**
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string
# Test connection locally
```

### **Performance Issues:**
- **Slow responses**: Check Railway logs
- **Database timeouts**: Optimize queries
- **Memory issues**: Reduce batch sizes

## 🎉 **Success Checklist**

- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend updated with new API URL
- [ ] User registration works
- [ ] Login functionality works
- [ ] Password reset works
- [ ] Profile loading works
- [ ] Basic monitoring set up

## 💰 **Cost Breakdown**

### **Free Tier (Current):**
- **Railway**: $0/month
- **MongoDB Atlas**: $0/month
- **Resend**: $0/month (3K emails)
- **Vercel**: $0/month
- **Total**: $0/month

### **100K Users Scaling:**
- **Railway Pro**: $20/month
- **MongoDB Atlas M50+**: $57/month
- **Resend Pro**: $20/month
- **Monitoring**: $50/month
- **Total**: ~$147/month

## 🚀 **Next Steps**

1. **Deploy using the guide above**
2. **Test all functionality**
3. **Set up basic monitoring**
4. **Start with a small user base**
5. **Monitor performance and costs**
6. **Scale gradually as you grow**

---

**Your dating app is now ready for free deployment and can scale to 100K users when you're ready! 🎉** 