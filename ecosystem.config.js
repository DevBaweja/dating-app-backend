module.exports = {
  apps: [
    {
      name: 'dating-app-backend',
      script: 'server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      // Performance settings
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Restart settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Environment variables
      env_file: '.env',
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Metrics
      merge_logs: true,
      
      // Auto restart on file changes (development only)
      watch: process.env.NODE_ENV === 'development' ? ['server.js', 'routes/', 'models/', 'middleware/'] : false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Cluster settings
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      
      // Memory and CPU limits
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024 --optimize-for-size',
      
      // Error handling
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Performance monitoring
      pmx: true,
      
      // Environment-specific settings
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        LOG_LEVEL: 'info'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001,
        LOG_LEVEL: 'info'
      }
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/DevBaweja/dating-app-backend.git',
      path: '/var/www/dating-app-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'ubuntu',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'https://github.com/DevBaweja/dating-app-backend.git',
      path: '/var/www/dating-app-backend-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
}; 