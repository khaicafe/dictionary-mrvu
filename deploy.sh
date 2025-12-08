#!/bin/bash

# Dictionary MRVU Deployment Script
# Run this manually on the server or use with SSH key authentication

set -e

echo "🚀 Starting Dictionary MRVU Deployment..."
cd /root/dictionary-mrvu

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "⚙️  Creating .env.production if needed..."
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    echo "⚠️  Created .env.production - PLEASE UPDATE ADMIN_PASSWORD!"
    echo "📝 Edit: nano .env.production"
fi

echo "🐳 Building Docker image..."
docker build -t dictionary-mrvu:latest .

echo "🛑 Stopping old container..."
docker stop dictionary-mrvu-app || true
docker rm dictionary-mrvu-app || true

echo "🚀 Starting new container..."
docker run -d \
    --name dictionary-mrvu-app \
    -p 80:3000 \
    --restart unless-stopped \
    -v /root/dictionary-mrvu/data:/app/data \
    --env-file .env.production \
    dictionary-mrvu:latest

echo ""
echo "✅ Deployment complete!"
echo "🌐 App running on http://103.56.162.100"
echo ""
echo "📝 To set admin password:"
echo "   1. SSH to server: ssh -p 24700 root@103.56.162.100"
echo "   2. Edit: nano .env.production"
echo "   3. Set: ADMIN_PASSWORD=your_strong_password"
echo "   4. Restart: docker restart dictionary-mrvu-app"
echo ""
echo "🔐 Then access admin at: http://103.56.162.100/admin/import"
