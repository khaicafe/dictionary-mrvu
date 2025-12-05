#!/bin/bash

# 🚀 Quick Deploy Script with Password
# Usage: ./deploy-with-password.sh

set -e

SERVER_IP="103.56.162.100"
SERVER_PORT="24700"
SERVER_USER="root"
SERVER_PASS="_GHKpxi#Gmp4E8elT34o"
IMAGE_NAME="dictionary-mrvu"
CONTAINER_NAME="dictionary-mrvu-app"

echo "🔐 Checking sshpass..."
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  Installing sshpass..."
    bash check-sshpass.sh
fi

echo ""
echo "🚀 Starting Quick Deploy with Password Authentication..."
echo "Server: $SERVER_IP:$SERVER_PORT"
echo "User: $SERVER_USER"
echo ""

# Step 1: Build image locally
echo "📦 Step 1: Building Docker image locally..."
make docker-build

# Step 2: Upload files using sshpass
echo ""
echo "📤 Step 2: Uploading to server using sshpass..."
sshpass -p "$SERVER_PASS" scp -P $SERVER_PORT Dockerfile $SERVER_USER@$SERVER_IP:/root/dictionary-mrvu/
sshpass -p "$SERVER_PASS" scp -P $SERVER_PORT docker-compose.yml $SERVER_USER@$SERVER_IP:/root/dictionary-mrvu/ 2>/dev/null || true

# Step 3: Build and run on server using sshpass
echo ""
echo "🐳 Step 3: Building on server and starting container..."
sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOFSERVER'
cd /root/dictionary-mrvu
echo "Building image..."
docker build -t dictionary-mrvu:latest .

echo ""
echo "Stopping old container..."
docker stop dictionary-mrvu-app || true
docker rm dictionary-mrvu-app || true

echo ""
echo "Starting new container..."
docker run -d \
  --name dictionary-mrvu-app \
  -p 3000:3000 \
  --restart unless-stopped \
  dictionary-mrvu:latest

echo ""
echo "✅ Container started!"
docker ps | grep dictionary-mrvu-app
EOFSERVER

echo ""
echo "✅ Deployment complete!"
echo "🌐 App available at: http://$SERVER_IP:3000"
echo ""
echo "📋 View logs:"
echo "   sshpass -p '$SERVER_PASS' ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'docker logs -f $CONTAINER_NAME'"
