#!/bin/bash

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════╗
║ 🔧 DEPLOYMENT TROUBLESHOOTING ║
╚════════════════════════════════════════════════════════════════════════╝

🎯 PROBLEM: http://103.56.162.100:3000 không vào được

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHAT WAS DONE:

1. ✅ Makefile created with password config
2. ✅ Docker image built locally (tested: OK)
3. ✅ Docker installed on server
4. ✅ Dockerfile & docker-compose.yml uploaded
5. ⏳ Docker image building on server (in progress)
6. ⏳ Container starting (in progress)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 HOW TO CHECK PROGRESS:

SSH to server:
ssh -p 24700 root@103.56.162.100
Password: \_GHKpxi#Gmp4E8elT34o

Then check:

1. Docker running?
   docker --version

2. Container created?
   docker ps -a

3. Container logs:
   docker logs dictionary-mrvu-app

4. Port listening?
   netstat -tlnp | grep 3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TYPICAL ISSUES & FIXES:

❌ Issue: "docker: command not found"
✅ Fix: Docker still installing, wait 1-2 minutes

❌ Issue: Container not running
✅ Fix: docker ps -a (check status)
docker logs dictionary-mrvu-app (see error)
docker restart dictionary-mrvu-app (restart it)

❌ Issue: Port 3000 not listening
✅ Fix: docker logs dictionary-mrvu-app (check why app didn't start)
Check logs for Next.js errors

❌ Issue: App crashes on startup
✅ Possible causes:

- Missing dependencies
- Port already in use
- Database connection issue
- Memory issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 IF DEPLOYMENT FAILED:

Manual fix (SSH to server):

cd /root/dictionary-mrvu

# Clean up

docker stop dictionary-mrvu-app 2>/dev/null || true
docker rm dictionary-mrvu-app 2>/dev/null || true
docker rmi dictionary-mrvu:latest 2>/dev/null || true

# Rebuild

docker build -t dictionary-mrvu:latest .

# Run

docker run -d \
 --name dictionary-mrvu-app \
 -p 3000:3000 \
 --restart unless-stopped \
 dictionary-mrvu:latest

# Check

docker ps
docker logs -f dictionary-mrvu-app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ EXPECTED TIMELINE:

1st time deployment:

- Docker install: 1-2 minutes
- Docker build: 3-5 minutes (depends on server speed)
- Container start: 30-60 seconds
- App ready: 2-3 seconds after container starts

Total: ~5-10 minutes first time

Next deployments: ~2-3 minutes (Docker already installed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHEN READY:

Go to: http://103.56.162.100:3000

You should see the Dictionary app!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 NEXT STEPS:

1. Wait 5-10 minutes for deployment
2. SSH to server and check docker logs
3. If not working, run manual fix above
4. Test: http://103.56.162.100:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Check these files:

- TROUBLESHOOT.md
- DOCKER_FIX_GUIDE.md
- DEPLOYMENT_GUIDE.md

EOF
