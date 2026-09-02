# Janjez.social EC2 Deployment Guide

## Prerequisites
- EC2 instance running Amazon Linux 2 or Ubuntu 22.04+
- Node.js 18+ and npm
- Domain `janjez.social` pointing to your EC2 public IP
- Security group allowing ports 22, 80, 443

## Quick Deploy (3 options)

### Option A: Docker Compose (Recommended for containers)
1. Transfer `janjez-ec2-deploy.tar.gz` to EC2
2. Extract and run:
   ```bash
   tar -xzf janjez-ec2-deploy.tar.gz
   cd ec2-deploy
   cp .env.example .env.local
   # Edit .env.local with real values
   docker compose up -d --build
   ```

### Option B: Systemd + Nginx (Traditional server)
1. Extract and copy files:
   ```bash
   tar -xzf janjez-ec2-deploy.tar.gz
   sudo cp -r ec2-deploy/* /opt/janjez-socio/
   sudo cp ec2-deploy/janjez-socio.service /etc/systemd/system/
   sudo cp ec2-deploy/nginx-janjez.conf /etc/nginx/conf.d/
   ```

2. Configure environment:
   ```bash
   sudo nano /opt/janjez-socio/.env.local
   # Add your real SUPABASE_SERVICE_ROLE_KEY and other secrets
   ```

3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now janjez-socio nginx
   ```

### Option C: PM2 (Zero-downtime reloads)
```bash
cd /opt/janjez-socio
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## SSL Setup (Required for production)
```bash
sudo certbot --nginx -d janjez.social -d www.janjez.social
```

## Post-Deploy Checklist
- [ ] DNS points to EC2 IP
- [ ] `.env.local` has real `SUPABASE_SERVICE_ROLE_KEY`
- [ ] SSL certificates installed via Certbot
- [ ] `pm2 status` or `systemctl status janjez-socio` shows running
- [ ] `sudo systemctl status nginx` shows active
- [ ] Health check: `curl https://janjez.social`

## Environment Variables (Minimum for EC2)
```env
NEXT_PUBLIC_SITE_URL=https://janjez.social
NEXT_PUBLIC_SUPABASE_URL=https://snkgkcdnmhqaejpqftxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9O06_TeEL6LQSFkUhQkBCA_FW1JdW0t
SUPABASE_SERVICE_ROLE_KEY=<your-real-key>
BREVO_API_KEY=
BREVO_FROM_EMAIL=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
```

## Security Notes
- `.env.local` is gitignored — never commit secrets
- Service role key has admin access — never expose to client
- Use `sudo nano /opt/janjez-socio/.env.local` to edit
- File permissions: `chmod 600 .env.local`

## Troubleshooting
```bash
# View logs
pm2 logs janjez-socio          # PM2
journalctl -u janjez-socio -f  # Systemd
sudo tail -f /var/log/nginx/error.log  # Nginx

# Restart
pm2 restart janjez-socio
sudo systemctl restart janjez-socio
```
