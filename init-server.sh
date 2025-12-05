#!/bin/bash

# Script setup server Docker environment
# Run this once on the server before first deployment

set -e

echo "🔧 Setting up Docker environment on server..."

# Create app directory
mkdir -p /root/dictionary-mrvu
cd /root/dictionary-mrvu

# Create data directory for volumes
mkdir -p /data/dictionary-mrvu

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy Dockerfile, docker-compose.yml to /root/dictionary-mrvu/"
echo "2. Run: make deploy"
echo ""
echo "🌐 App will be available at: http://$(hostname -I | awk '{print $1}'):3000"
