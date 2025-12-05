#!/bin/bash

# ⏳ Wait for Deployment to Complete

SERVER_IP="103.56.162.100"
SERVER_PORT="24700"
MAX_WAIT=300  # 5 minutes
INTERVAL=10   # Check every 10 seconds

echo "⏳ Waiting for deployment to complete..."
echo "   Max wait time: $MAX_WAIT seconds"
echo "   Server: $SERVER_IP:3000"
echo ""

elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
    
    if curl -s -m 3 "http://$SERVER_IP:3000" > /dev/null 2>&1; then
        echo ""
        echo "╔════════════════════════════════════════════╗"
        echo "║     ✅ APP IS NOW LIVE!                   ║"
        echo "╚════════════════════════════════════════════╝"
        echo ""
        echo "🌐 Access at: http://$SERVER_IP:3000"
        echo ""
        
        # Get app info
        sshpass -p "_GHKpxi#Gmp4E8elT34o" ssh -o StrictHostKeyChecking=no -p $SERVER_PORT root@$SERVER_IP << 'EOF' 2>/dev/null || true
docker ps | grep dictionary-mrvu-app
docker logs --tail 10 dictionary-mrvu-app
EOF
        
        exit 0
    fi
    
    # Print progress
    percent=$((elapsed * 100 / MAX_WAIT))
    echo "⏳ Waiting... ${percent}% (${elapsed}s / ${MAX_WAIT}s)"
    
    sleep $INTERVAL
    elapsed=$((elapsed + INTERVAL))
done

echo ""
echo "❌ Timeout! Deployment may have failed"
echo ""
echo "🔧 Troubleshooting:"
echo "1. SSH to server: ssh -p 24700 root@103.56.162.100"
echo "2. Check containers: docker ps -a"
echo "3. View logs: docker logs -f dictionary-mrvu-app"
echo "4. Check Docker status: systemctl status docker"
echo ""
