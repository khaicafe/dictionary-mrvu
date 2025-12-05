#!/bin/bash

# 🔧 Complete Server Setup & Deploy Script

set -e

SERVER_IP="103.56.162.100"
SERVER_PORT="24700"
SERVER_USER="root"
SERVER_PASS="_GHKpxi#Gmp4E8elT34o"

echo "╔════════════════════════════════════════════════════════╗"
echo "║           🔧 COMPLETE SERVER SETUP & DEPLOY            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Function to run SSH command
run_ssh() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -p $SERVER_PORT $SERVER_USER@$SERVER_IP "$@"
}

echo "📦 Step 1: Installing Docker & Docker Compose..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_ssh << 'DOCKER_INSTALL'

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -sSL https://get.docker.com | sh
    
    # Start Docker
    systemctl start docker || service docker start || true
    systemctl enable docker 2>/dev/null || true
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -sSL https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

docker --version
docker-compose --version

DOCKER_INSTALL

echo ""
echo "✅ Docker installed"
echo ""

echo "📁 Step 2: Creating directories..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_ssh "mkdir -p /root/dictionary-mrvu /data/dictionary-mrvu"
echo "✅ Directories created"
echo ""

echo "📤 Step 3: Uploading Dockerfile..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -P $SERVER_PORT \
    ./Dockerfile \
    $SERVER_USER@$SERVER_IP:/root/dictionary-mrvu/
echo "✅ Dockerfile uploaded"
echo ""

echo "📤 Step 4: Uploading docker-compose.yml..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -P $SERVER_PORT \
    ./docker-compose.yml \
    $SERVER_USER@$SERVER_IP:/root/dictionary-mrvu/ 2>/dev/null || echo "docker-compose.yml - skipped"
echo "✅ Files uploaded"
echo ""

echo "🐳 Step 5: Building Docker image on server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_ssh << 'BUILD'
cd /root/dictionary-mrvu
echo "Building image..."
docker build -t dictionary-mrvu:latest .
echo "✅ Image built"
BUILD

echo ""
echo "🚀 Step 6: Starting container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_ssh << 'START'
echo "Stopping old container..."
docker stop dictionary-mrvu-app 2>/dev/null || true
docker rm dictionary-mrvu-app 2>/dev/null || true

echo "Starting new container..."
docker run -d \
  --name dictionary-mrvu-app \
  -p 3000:3000 \
  --restart unless-stopped \
  dictionary-mrvu:latest

echo "✅ Container started"
docker ps | grep dictionary-mrvu-app

START

echo ""
echo "✅ Step 7: Verifying..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_ssh << 'VERIFY'
sleep 3
echo "Container status:"
docker ps | grep dictionary-mrvu-app || echo "⚠️  Container not found in ps"

echo ""
echo "Container logs (last 20 lines):"
docker logs --tail 20 dictionary-mrvu-app

echo ""
echo "Port 3000 check:"
netstat -tlnp 2>/dev/null | grep 3000 || echo "Checking with lsof..."
lsof -i :3000 2>/dev/null || echo "Port info not available"

VERIFY

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                 ✅ DEPLOYMENT COMPLETE                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 App URL: http://$SERVER_IP:3000"
echo ""
echo "⏱️  Wait 10-15 seconds for app to be fully ready..."
echo ""
echo "📞 If still not accessible:"
echo "   1. Wait a bit longer"
echo "   2. Check logs: sshpass -p '$SERVER_PASS' ssh -p $SERVER_PORT root@$SERVER_IP 'docker logs -f dictionary-mrvu-app'"
echo "   3. Check health: curl -v http://$SERVER_IP:3000"
echo ""
