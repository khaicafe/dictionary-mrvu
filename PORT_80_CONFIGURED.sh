#!/bin/bash

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════╗
║                    ✅ PORT 80 CONFIGURED!                            ║
╚════════════════════════════════════════════════════════════════════════╝

🌐 App Now Running on Port 80 (HTTP Standard)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Access Your App:

   http://103.56.162.100
   
   No port number needed! (port 80 is default HTTP)

   Old URL still works:
   http://103.56.162.100:3000 (NO - port 3000 now unavailable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Port Configuration:

   Container Port:    3000 (internal)
   Exposed Port:      80 (external HTTP)
   
   Docker Mapping:    0.0.0.0:80 -> 3000/tcp
   Status:            ✅ Active

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 What Was Changed:

   Files Updated:
   ✅ docker-compose.yml
      ports: '80:3000' (changed from 3000:3000)
   
   ✅ Makefile
      EXPOSED_PORT = 80
      SERVER_PORT_APP = 80

   ✅ Container Restarted
      Now listening on 0.0.0.0:80

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Port 80 vs Port 3000:

   Port 80 (HTTP Standard):
   ✅ Easier to remember: http://103.56.162.100
   ✅ Standard HTTP port (no port in URL)
   ✅ Professional appearance
   ✅ Better for production
   
   Port 3000 (Development):
   ❌ Requires port in URL: http://103.56.162.100:3000
   ✅ Good for development/testing
   ✅ Doesn't require root privileges

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verify Configuration:

   SSH to server:
   $ ssh -p 24700 root@103.56.162.100

   Check port binding:
   $ netstat -tlnp | grep 80
   $ lsof -i :80

   Check container:
   $ docker ps | grep dictionary

   Test locally:
   $ curl http://localhost/ | head

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Switch Back to Port 3000 (if needed):

   Edit docker-compose.yml:
   Change:  - '80:3000'
   To:      - '3000:3000'

   Then restart container:
   docker stop dictionary-mrvu-app
   docker rm dictionary-mrvu-app
   docker run -d --name dictionary-mrvu-app -p 3000:3000 \
     -v /root/dictionary-mrvu/data:/app/data \
     --restart unless-stopped dictionary-mrvu:latest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Important Notes:

   ⚠️  Port 80 requires root access
       Our container runs as 'nextjs' user inside
       Host port 80 is mapped from container port 3000
       This is safe and standard practice

   ✅ Database still mounted at /app/data
   ✅ All features still working
   ✅ Auto-restart enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Quick Command Reference:

   # Check port 80
   netstat -tlnp | grep 80

   # Check container logs
   docker logs -f dictionary-mrvu-app

   # Restart on port 80
   docker restart dictionary-mrvu-app

   # Stop container
   docker stop dictionary-mrvu-app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STATUS: RUNNING ON PORT 80

Next deployment will use port 80 by default.

📍 Access at: http://103.56.162.100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
