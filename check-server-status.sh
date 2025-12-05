#!/bin/bash

# 🔍 Troubleshooting Script - Kiểm tra Server Status

SERVER_IP="103.56.162.100"
SERVER_PORT="24700"
SERVER_USER="root"
SERVER_PASS="_GHKpxi#Gmp4E8elT34o"

echo "🔍 Troubleshooting Server: $SERVER_IP:$SERVER_PORT"
echo ""

# Check 1: SSH Connection
echo "1️⃣  Checking SSH connection..."
if sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "echo 'SSH OK'" &>/dev/null; then
    echo "✅ SSH connection: OK"
else
    echo "❌ SSH connection: FAILED"
    exit 1
fi

echo ""

# Check 2: Docker running
echo "2️⃣  Checking Docker..."
DOCKER_STATUS=$(sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "docker ps" 2>&1)
if echo "$DOCKER_STATUS" | grep -q "dictionary-mrvu-app"; then
    echo "✅ Docker container: RUNNING"
else
    echo "⚠️  Docker container: NOT RUNNING"
    echo ""
    echo "📋 All containers:"
    sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "docker ps -a"
fi

echo ""

# Check 3: Port 3000
echo "3️⃣  Checking port 3000..."
PORT_CHECK=$(sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "netstat -tlnp 2>/dev/null | grep 3000 || lsof -i :3000 2>/dev/null || echo 'Port check inconclusive'")
if echo "$PORT_CHECK" | grep -q "3000"; then
    echo "✅ Port 3000: LISTENING"
else
    echo "⚠️  Port 3000: May not be listening"
fi

echo ""

# Check 4: Container logs
echo "4️⃣  Container logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "docker logs --tail 30 dictionary-mrvu-app 2>&1 || echo 'Container not found'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""

# Check 5: Network connectivity
echo "5️⃣  Testing HTTP connectivity..."
curl -s -m 5 "http://$SERVER_IP:3000" &>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ HTTP: RESPONDING"
else
    echo "❌ HTTP: NOT RESPONDING"
    echo "   Trying with curl verbose..."
    curl -v "http://$SERVER_IP:3000" 2>&1 | head -20
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Recommended Actions:"
echo ""
echo "If container not running:"
echo "  sshpass -p '$SERVER_PASS' ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'docker start dictionary-mrvu-app'"
echo ""
echo "If need to rebuild:"
echo "  bash deploy-with-password.sh"
echo ""
echo "View live logs:"
echo "  sshpass -p '$SERVER_PASS' ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'docker logs -f dictionary-mrvu-app'"
echo ""
