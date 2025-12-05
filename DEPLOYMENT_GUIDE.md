# 🚀 Hướng Dẫn Deployment với Makefile và Docker

## 📋 Thông Tin Server

```
Server IP: 103.56.162.100
Server Port: 24700
User: root
Password: _GHKpxi#Gmp4E8elT34o
```

## 🛠️ Setup Lần Đầu

### Bước 1: Chuẩn Bị Trên Local

```bash
# Kiểm tra Makefile
make help

# Build test locally
make docker-build

# Test chạy locally (tuỳ chọn)
make docker-run
# Truy cập: http://localhost:3000
make docker-logs
make docker-stop
```

### Bước 2: Setup Server (SSH vào server)

```bash
# SSH vào server
ssh -p 24700 root@103.56.162.100

# Tạo thư mục
mkdir -p /root/dictionary-mrvu
cd /root/dictionary-mrvu

# Kiểm tra Docker đã cài chưa
docker --version
docker-compose --version

# Nếu chưa, cài Docker
curl -sSL https://get.docker.com | sh
curl -sSL https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## 📤 Deployment

### Cách 1: Deployment Tự Động (Recommended)

```bash
# Từ máy local
make deploy

# Hoặc deployment production (yêu cầu confirm)
make deploy-prod
```

**Quy trình tự động:**

1. Build Docker image locally
2. Upload Dockerfile lên server
3. Build image trên server
4. Stop container cũ
5. Start container mới

### Cách 2: Deployment Thủ Công

```bash
# Bước 1: Build image locally
make docker-build

# Bước 2: Copy files lên server
scp -P 24700 Dockerfile root@103.56.162.100:/root/dictionary-mrvu/
scp -P 24700 docker-compose.yml root@103.56.162.100:/root/dictionary-mrvu/
scp -P 24700 .dockerignore root@103.56.162.100:/root/dictionary-mrvu/ 2>/dev/null || true

# Bước 3: Chạy lệnh trên server
ssh -p 24700 root@103.56.162.100 << 'EOF'
cd /root/dictionary-mrvu
docker build -t dictionary-mrvu:latest .
docker stop dictionary-mrvu-app || true
docker rm dictionary-mrvu-app || true
docker run -d \
  --name dictionary-mrvu-app \
  -p 3000:3000 \
  --restart unless-stopped \
  dictionary-mrvu:latest
EOF
```

## 📊 Các Lệnh Quản Lý

### Build & Local Testing

```bash
make build              # Build Next.js app
make docker-build       # Build Docker image
make docker-run         # Chạy container locally
make docker-logs        # Xem logs
make docker-stop        # Dừng container
make clean              # Xóa build files
```

### Server Management

```bash
make ssh                # SSH vào server
make server-status      # Kiểm tra status app
make server-logs        # Xem logs từ server
make server-restart     # Restart app
make server-pull        # Pull image mới (nếu có registry)
```

### Deployment

```bash
make deploy             # Deploy lên server
make deploy-prod        # Deploy production (require confirm)
```

## 🔍 Kiểm Tra Trạng Thái

### Từ Local

```bash
# Kiểm tra container đang chạy
docker ps | grep dictionary

# Xem logs
docker logs -f dictionary-mrvu-app
```

### Từ Server (SSH vào)

```bash
# Kiểm tra container
docker ps | grep dictionary

# Xem logs
docker logs -f dictionary-mrvu-app

# Kiểm tra port
lsof -i :3000
# hoặc
netstat -tlnp | grep 3000

# Test health check
curl http://localhost:3000
```

## 🐛 Troubleshooting

### Container không start

```bash
# Xem chi tiết lỗi
docker logs dictionary-mrvu-app

# Kiểm tra port đã bị chiếm chưa
lsof -i :3000

# Xóa và rebuild
docker rm dictionary-mrvu-app
docker rmi dictionary-mrvu:latest
make docker-build
make docker-run
```

### Build timeout

```bash
# Increase timeout (trên server)
docker build --progress=plain -t dictionary-mrvu:latest .
```

### SSH timeout

```bash
# Tăng timeout trong ~/.ssh/config
Host 103.56.162.100
    ServerAliveInterval 60
    ServerAliveCountMax 10
```

## 📝 File Configuration

| File                 | Mục đích                  |
| -------------------- | ------------------------- |
| `Dockerfile`         | Build Docker image        |
| `docker-compose.yml` | Manage containers         |
| `Makefile`           | Automation scripts        |
| `init-server.sh`     | Setup server lần đầu      |
| `deploy-server.sh`   | Deploy script trên server |

## ✅ Checklist Deployment

- [ ] Build locally thành công: `make docker-build`
- [ ] Test locally: `make docker-run` → http://localhost:3000
- [ ] SSH vào server OK
- [ ] Docker cài đặt OK
- [ ] Chạy deployment: `make deploy`
- [ ] Kiểm tra app chạy: http://103.56.162.100:3000
- [ ] Kiểm tra logs: `make server-logs`

## 🚨 Emergency

### Stop app ngay lập tức

```bash
# Từ local
make docker-stop

# Hoặc từ server
ssh -p 24700 root@103.56.162.100 'docker stop dictionary-mrvu-app'
```

### Rollback (nếu build mới bị lỗi)

```bash
# Trên server
docker stop dictionary-mrvu-app
docker run -d \
  --name dictionary-mrvu-app \
  -p 3000:3000 \
  --restart unless-stopped \
  dictionary-mrvu:old  # Nếu lưu old image
```

## 🎯 Tips

1. **Luôn test locally trước**: `make docker-build && make docker-run`
2. **Backup image cũ trước deploy**: `docker tag dictionary-mrvu:latest dictionary-mrvu:backup`
3. **Theo dõi logs**: `make server-logs` (Ctrl+C để thoát)
4. **Regular cleanup**: `make purge` (xóa tất cả containers/images)

## 📞 Support Commands

```bash
# Xem tất cả Docker images
docker images

# Xem tất cả containers
docker ps -a

# Xem chi tiết container
docker inspect dictionary-mrvu-app

# Remove image
docker rmi dictionary-mrvu:latest

# Prune unused resources
docker system prune -a
```

---

**Last Updated**: 2025-12-05
