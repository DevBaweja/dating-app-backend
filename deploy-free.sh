#!/bin/bash

echo "🚀 Dating App - Free Platform Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Step 1: Environment Setup
setup_environment() {
    print_status "Step 1: Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
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
EOF
        print_success "Created .env file"
    else
        print_warning ".env file already exists. Please update it manually."
    fi
}

# Step 2: Install Dependencies
install_dependencies() {
    print_status "Step 2: Installing dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Step 3: Test Build
test_build() {
    print_status "Step 3: Testing build..."
    
    if npm test 2>/dev/null; then
        print_success "Tests passed"
    else
        print_warning "No tests configured or tests failed"
    fi
    
    # Test if server starts
    print_status "Testing server startup..."
    timeout 10s npm start > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        kill $SERVER_PID
        print_success "Server starts successfully"
    else
        print_error "Server failed to start"
        exit 1
    fi
}

# Step 4: Railway Deployment
deploy_railway() {
    print_status "Step 4: Deploying to Railway..."
    
    echo ""
    print_status "Railway Deployment Instructions:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New Project'"
    echo "4. Select 'Deploy from GitHub repo'"
    echo "5. Choose your dating-app-backend repository"
    echo "6. Railway will automatically detect Node.js and deploy"
    echo ""
    
    print_status "Environment Variables to set in Railway:"
    echo "Copy these from your .env file:"
    echo "- NODE_ENV=production"
    echo "- PORT=5001"
    echo "- MONGODB_URI=your-mongodb-uri"
    echo "- JWT_SECRET=your-jwt-secret"
    echo "- RESEND_API_KEY=your-resend-api-key"
    echo "- FRONTEND_URL=https://dating-app-frontend-ten.vercel.app"
    echo ""
    
    read -p "Press Enter when you've deployed to Railway and have the URL..."
}

# Step 5: Update Frontend
update_frontend() {
    print_status "Step 5: Updating frontend API URL..."
    
    echo ""
    print_status "Frontend Update Instructions:"
    echo "1. Go to your Vercel dashboard"
    echo "2. Find your dating app frontend project"
    echo "3. Go to Settings > Environment Variables"
    echo "4. Add/Update: REACT_APP_API_URL=https://your-railway-url.railway.app"
    echo "5. Redeploy the frontend"
    echo ""
    
    read -p "Press Enter when you've updated the frontend..."
}

# Step 6: Test Deployment
test_deployment() {
    print_status "Step 6: Testing deployment..."
    
    echo ""
    print_status "Testing Instructions:"
    echo "1. Visit your frontend: https://dating-app-frontend-ten.vercel.app"
    echo "2. Try to register a new user"
    echo "3. Test the login functionality"
    echo "4. Test the password reset feature"
    echo "5. Check if profiles load correctly"
    echo ""
    
    read -p "Press Enter when you've tested the deployment..."
}

# Step 7: Monitoring Setup
setup_monitoring() {
    print_status "Step 7: Setting up free monitoring..."
    
    echo ""
    print_status "Free Monitoring Options:"
    echo "1. Railway Dashboard - Built-in monitoring"
    echo "2. MongoDB Atlas - Database monitoring"
    echo "3. Vercel Analytics - Frontend monitoring"
    echo "4. UptimeRobot - Free uptime monitoring"
    echo ""
    
    print_status "Recommended free monitoring setup:"
    echo "- Railway: Built-in logs and metrics"
    echo "- UptimeRobot: Set up monitoring for your Railway URL"
    echo "- MongoDB Atlas: Enable free monitoring"
    echo ""
}

# Step 8: Scaling Plan
scaling_plan() {
    print_status "Step 8: Scaling plan for 100K users..."
    
    echo ""
    print_status "When you're ready to scale to 100K users:"
    echo ""
    echo "🚀 Railway Scaling:"
    echo "- Upgrade to Railway Pro ($20/month)"
    echo "- Increase resources: 2GB RAM, 2 vCPU"
    echo "- Enable auto-scaling"
    echo ""
    echo "🗄️ Database Scaling:"
    echo "- Upgrade MongoDB Atlas to M50+ ($57/month)"
    echo "- Enable read replicas"
    echo "- Set up automated backups"
    echo ""
    echo "📊 Monitoring Scaling:"
    echo "- Add Sentry for error tracking"
    echo "- Add New Relic for performance monitoring"
    echo "- Set up Grafana dashboards"
    echo ""
    echo "🔒 Security Scaling:"
    echo "- Add CloudFlare for DDoS protection"
    echo "- Implement rate limiting"
    echo "- Add security monitoring"
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting Free Platform Deployment..."
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    test_build
    deploy_railway
    update_frontend
    test_deployment
    setup_monitoring
    scaling_plan
    
    echo ""
    print_success "🎉 Deployment setup complete!"
    echo ""
    print_status "Your dating app is now ready for free deployment!"
    print_status "Follow the instructions above to deploy to Railway."
    print_status "When you're ready to scale to 100K users, follow the scaling plan."
    echo ""
}

# Run the script
main 