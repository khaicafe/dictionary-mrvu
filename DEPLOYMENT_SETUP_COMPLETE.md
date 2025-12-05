# ✅ Makefile & Docker Setup - Hoàn Thành

## 📦 Files Được Tạo

```
✅ Dockerfile                 - Docker image configuration
✅ docker-compose.yml         - Container management
✅ Makefile                   - Build & deployment automation
✅ .dockerignore              - Optimize build size
✅ quick-deploy.sh            - One-command deployment script
✅ init-server.sh             - Server setup script
✅ deploy-server.sh           - Server deployment script
✅ DEPLOYMENT_GUIDE.md        - Chi tiết hướng dẫn
✅ QUICKSTART_DEPLOY.md       - Quick start guide
```

## 🚀 3 Cách Deploy

### Cách 1: Makefile (Recommended) ⭐

```bash
# Deploy một dòng
make deploy

# Hoặc test trước
make docker-build          # Build image locally
make docker-run            # Test chạy
make server-logs           # Xem logs
make deploy                # Deploy production
```

### Cách 2: Quick Deploy Script

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Cách 3: Thủ Công

```bash
make docker-build
scp -P 24700 Dockerfile root@103.56.162.100:/root/dictionary-mrvu/
ssh -p 24700 root@103.56.162.100 'cd /root/dictionary-mrvu && docker build -t dictionary-mrvu:latest . && docker run -d --name dictionary-mrvu-app -p 3000:3000 dictionary-mrvu:latest'
```

## 📚 Lệnh Thường Dùng

```bash
# Build & Test Locally
make docker-build           # Build image
make docker-run             # Chạy container
make docker-logs            # Xem logs
make docker-stop            # Dừng container

# Management
make build                  # Build Next.js app
make clean                  # Xóa build files

# Server Operations
make ssh                    # SSH vào server
make server-status          # Kiểm tra status
make server-logs            # Xem logs server
make server-restart         # Restart app

# Deployment
make deploy                 # Deploy lên server
make deploy-prod            # Deploy production (require confirm)

# Cleanup
make purge                  # Xóa tất cả containers/images
```

## ⚙️ Configuration

### Thay đổi Server Info (nếu cần)

Sửa các biến trong `Makefile`:

```makefile
SERVER_IP = 103.56.162.100
SERVER_PORT = 24700
SERVER_USER = root
IMAGE_NAME = dictionary-mrvu
CONTAINER_NAME = dictionary-mrvu-app
APP_PORT = 3000
```

## 🔍 Quy Trình Deploy

1. **Build locally**: Tạo Docker image trên máy local
2. **Upload**: Gửi Dockerfile lên server
3. **Build on server**: Build image trên server
4. **Stop old**: Dừng container cũ
5. **Start new**: Khởi động container mới
6. **Health check**: Tự động kiểm tra health

## ✅ Verification

```bash
# Test locally
make docker-build
make docker-run
# Go to http://localhost:3000
make docker-logs

# Test deployment
make deploy
make server-logs
# Go to http://103.56.162.100:3000
```

## 🎯 Next Steps

1. ✅ **Test locally**: `make docker-build && make docker-run`
2. ✅ **SSH vào server**: `make ssh`
   - Kiểm tra Docker cài chưa: `docker --version`
   - Tạo thư mục: `mkdir -p /root/dictionary-mrvu`
3. ✅ **Deploy**: `make deploy`
4. ✅ **Check**: `make server-logs`

## 📊 Architecture

```
┌─────────────────┐
│   Local Dev     │
│  (Docker Test)  │
└────────┬────────┘
         │
         ├─→ Build Dockerfile ─┐
         │                     │
         ├─→ SCP Upload ───────┼─→ Server
         │                     │
         └─→ SSH Commands ─────┤
                               │
┌──────────────────────────────┘
│
├─ Build Docker Image
├─ Stop Old Container
├─ Start New Container
└─ Health Check
```

## 🐛 Troubleshooting

| Problem               | Solution                                                    |
| --------------------- | ----------------------------------------------------------- |
| Container won't start | `make server-logs` để xem lỗi                               |
| Port 3000 bị chiếm    | `ssh -p 24700 root@103.56.162.100 'lsof -i :3000'`          |
| SSH timeout           | Thêm vào `~/.ssh/config`: `ServerAliveInterval 60`          |
| Build timeout         | Chạy trực tiếp trên server: `docker build --progress=plain` |

## 📞 Support

Xem chi tiết: `DEPLOYMENT_GUIDE.md`

---

**Setup hoàn thành!** 🎉  
Ready for deployment. Chạy `make deploy` để deploy lên server.
