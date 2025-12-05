#!/bin/bash

# Script để deploy bằng docker-compose trên server
# Chạy lệnh này trên server

set -e

cd /root/dictionary-mrvu

echo "🐳 Deploying with docker-compose..."

# Stop old containers
docker-compose down || true

# Pull latest images nếu có
# docker-compose pull

# Build và start
docker-compose up -d

echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
docker-compose ps

echo ""
echo "🌐 App available at: http://localhost:3000"
echo "📋 View logs: docker-compose logs -f"
