#!/bin/bash
set -euo pipefail

# ============================================================
# Janjez.social EC2 Deployment Script
# Target: Amazon Linux 2 / Ubuntu with Node.js 18+
# ============================================================

APP_NAME="janjez-socio"
APP_DIR="/opt/${APP_NAME}"
USER="ec2-user"
GROUP="ec2-user"

echo "🚀 Starting deployment of ${APP_NAME}..."

# 1. Install system dependencies
echo "📦 Installing system dependencies..."
if command -v yum &> /dev/null; then
  sudo yum update -y
  sudo yum install -y nginx curl git
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install -y nodejs
else
  sudo apt update -y
  sudo apt install -y nginx curl git
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
  sudo apt install -y nodejs
fi

# 2. Install PM2
echo "⚙️  Installing PM2..."
sudo npm install -g pm2

# 3. Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p "${APP_DIR}"
sudo chown -R ${USER}:${GROUP} "${APP_DIR}"

# 4. Copy application files
echo "📋 Copying application files..."
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env.local' \
  ./ "${APP_DIR}/"

# 5. Install dependencies
echo "📥 Installing npm dependencies..."
cd "${APP_DIR}"
npm ci --production=false

# 6. Build
echo "🔨 Building application..."
NEXT_DISABLE_TURBOPACK=1 npm run build

# 7. Environment file
echo "🔐 Setting up environment..."
if [ ! -f "${APP_DIR}/.env.local" ]; then
  sudo tee "${APP_DIR}/.env.local" > /dev/null << 'ENVEOF'
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://janjez.social

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://snkgkcdnmhqaejpqftxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9O06_TeEL6LQSFkUhQkBCA_FW1JdW0t
SUPABASE_SERVICE_ROLE_KEY=

# Brevo (Transactional Email) Configuration
# Get your API key from https://app.brevo.com/settings/keys/api
BREVO_API_KEY=
BREVO_FROM_EMAIL=

# M-Pesa Configuration
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_ENV=production

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
ENVEOF
  sudo chown ${USER}:${GROUP} "${APP_DIR}/.env.local"
  sudo chmod 600 "${APP_DIR}/.env.local"
fi

# 8. PM2 ecosystem
sudo tee "${APP_DIR}/ecosystem.config.js" > /dev/null << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'janjez-socio',
      script: 'npm',
      args: 'start',
      cwd: '/opt/janjez-socio',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/janjez-socio/error.log',
      out_file: '/var/log/janjez-socio/out.log',
      log_file: '/var/log/janjez-socio/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10
    }
  ]
};
PM2EOF

# 9. Log directory
sudo mkdir -p /var/log/janjez-socio
sudo chown -R ${USER}:${GROUP} /var/log/janjez-socio

# 10. Start app
echo "▶️  Starting application..."
cd "${APP_DIR}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash

# 11. Nginx reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << 'NGINXEOF'
upstream janjez_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name janjez.social www.janjez.social;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript image/svg+xml;

    client_max_body_size 50M;

    location / {
        proxy_pass http://janjez_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static/ {
        proxy_pass http://janjez_app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /fonts/ {
        proxy_pass http://janjez_app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

if [ -d "/etc/nginx/sites-enabled" ]; then
  sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
  sudo rm -f /etc/nginx/sites-enabled/default
else
  sudo cp /etc/nginx/sites-available/${APP_NAME} /etc/nginx/conf.d/${APP_NAME}.conf
fi

sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

# 12. Firewall
echo "🔒 Configuring firewall..."
if command -v ufw &> /dev/null; then
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  echo "y" | sudo ufw enable
elif command -v firewall-cmd &> /dev/null; then
  sudo firewall-cmd --permanent --add-service=ssh
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
fi

# 13. Health check
echo "🏥 Performing health check..."
sleep 5
if curl -sf http://localhost:3000 > /dev/null; then
  echo "✅ Application is running on port 3000"
else
  echo "⚠️  Application may still be starting..."
fi

echo ""
echo "============================================================"
echo "✅ Deployment complete!"
echo "============================================================"
echo "📊 Application URL: http://$(curl -s ifconfig.me)"
echo "📁 App directory: ${APP_DIR}"
echo "📝 Logs: /var/log/janjez-socio/"
echo "🔧 PM2: pm2 status | pm2 logs janjez-socio"
echo "🔐 Nginx: sudo systemctl status nginx"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Point your domain DNS to this server"
echo "   2. Set up SSL with: sudo certbot --nginx -d janjez.social -d www.janjez.social"
echo "   3. Add SUPABASE_SERVICE_ROLE_KEY and other env vars to .env.local"
echo "============================================================"
