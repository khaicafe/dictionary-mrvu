#!/bin/bash

# 🔧 SSH Connect & Diagnose

echo "🔗 Connecting to server and checking status..."
echo ""

ssh -p 24700 root@103.56.162.100 << 'EOF'

echo "╔════════════════════════════════════════════════════════╗"
echo "║             SERVER STATUS REPORT                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣  Docker Version:"
docker --version

echo ""
echo "2️⃣  Running Containers:"
docker ps

echo ""
echo "3️⃣  All Containers (including stopped):"
docker ps -a

echo ""
echo "4️⃣  Port 3000 Status:"
netstat -tlnp 2>/dev/null | grep 3000 || echo "Port 3000 not in use"

echo ""
echo "5️⃣  Container Logs (last 50 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs --tail 50 dictionary-mrvu-app 2>&1 || echo "No logs found"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "6️⃣  Local HTTP Test:"
curl -s -m 2 http://localhost:3000 | head -20 || echo "Cannot connect to localhost:3000"

echo ""
echo "7️⃣  Disk Usage:"
df -h /root/dictionary-mrvu 2>/dev/null || df -h / | tail -1

echo ""
echo "8️⃣  Running Processes with 'docker':"
ps aux | grep docker | grep -v grep

echo ""
EOF
