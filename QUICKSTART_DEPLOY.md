# 🚀 Quick Start - Deployment

## 📋 Server Info

```
IP: 103.56.162.100:24700
User: root
```

## ⚡ Quick Deployment (1 lệnh)

```bash
# Cách 1: Dùng Makefile
make deploy

# Cách 2: Dùng script
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## 📖 Chi Tiết

| Lệnh                 | Mục đích                      |
| -------------------- | ----------------------------- |
| `make help`          | Xem tất cả lệnh               |
| `make docker-build`  | Build image locally           |
| `make docker-run`    | Chạy container locally (test) |
| `make deploy`        | Deploy lên server             |
| `make server-logs`   | Xem logs trên server          |
| `make server-status` | Kiểm tra status               |
| `make ssh`           | SSH vào server                |

## 🔧 Files

- **Dockerfile** - Docker configuration
- **docker-compose.yml** - Container compose
- **Makefile** - Build & deployment automation
- **quick-deploy.sh** - One-command deployment
- **DEPLOYMENT_GUIDE.md** - Hướng dẫn chi tiết

## ✅ First Time Setup

```bash
# 1. Build locally
make docker-build

# 2. Test locally (optional)
make docker-run
# Go to http://localhost:3000

# 3. Deploy
make deploy

# 4. Check
make server-logs
```

## 🌐 Access

- Local: http://localhost:3000
- Server: http://103.56.162.100:3000

---

📖 Xem `DEPLOYMENT_GUIDE.md` để chi tiết
