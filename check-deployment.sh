#!/bin/bash

# 📋 Deployment Status Checker

SERVER_IP="103.56.162.100"
SERVER_PORT="24700"

echo "╔═════════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT STATUS CHECK                   ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""
echo "Server: $SERVER_IP:$SERVER_PORT"
echo ""

echo "🔍 Checking if server is responding..."
if curl -s -m 5 "http://$SERVER_IP:3000" > /dev/null 2>&1; then
    echo "✅ Server is responding!"
    echo ""
    echo "🌐 App is available at:"
    echo "   http://$SERVER_IP:3000"
    echo ""
    echo "🎉 SUCCESS!"
    exit 0
else
    echo "❌ Server not responding yet"
    echo ""
    echo "⏱️  Docker is still installing..."
    echo "   This may take 2-5 minutes"
    echo ""
    echo "📋 In the meantime, SSH to server to monitor:"
    echo "   ssh -p 24700 root@$SERVER_IP"
    echo ""
    echo "   Once connected, run:"
    echo "   docker ps"
    echo "   docker logs -f dictionary-mrvu-app"
    echo ""
    exit 1
fi
