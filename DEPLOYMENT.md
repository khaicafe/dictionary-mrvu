# 🚀 Deployment Guide - Dictionary MRVU

## ✅ Điều kiện tiên quyết

Đảm bảo server đã có:

- ✅ Docker cài đặt
- ✅ Docker daemon chạy
- ✅ Git cài đặt
- ✅ `/root/dictionary-mrvu` tồn tại
- ✅ Database file tại `/root/dictionary-mrvu/data/dictionary.db`

## 📝 Bước 1: SSH vào Server

```bash
ssh -p 24700 root@103.56.162.100
```

Password: `_GHKpxi#Gmp4E8elT34o`

## 🔄 Bước 2: Pull code và Deploy

### Option A: Sử dụng script (Recommended)

```bash
cd /root/dictionary-mrvu
chmod +x deploy.sh
./deploy.sh
```

### Option B: Manual steps

```bash
cd /root/dictionary-mrvu

# Pull latest code
git pull origin main

# Create environment file if needed
if [ ! -f .env.production ]; then
    cp .env.example .env.production
fi

# Edit ADMIN_PASSWORD
nano .env.production

# Build Docker image
docker build -t dictionary-mrvu:latest .

# Stop old container
docker stop dictionary-mrvu-app || true
docker rm dictionary-mrvu-app || true

# Start new container
docker run -d \
    --name dictionary-mrvu-app \
    -p 80:3000 \
    --restart unless-stopped \
    -v /root/dictionary-mrvu/data:/app/data \
    --env-file .env.production \
    dictionary-mrvu:latest
```

## 🔐 Bước 3: Cấu hình Admin Password

1. SSH vào server
2. Edit file environment:
   ```bash
   nano /root/dictionary-mrvu/.env.production
   ```
3. Tìm dòng `ADMIN_PASSWORD` và thay đổi:
   ```
   ADMIN_PASSWORD=your_strong_password_here
   ```
4. Lưu file (Ctrl+X, Y, Enter)
5. Restart container:
   ```bash
   docker restart dictionary-mrvu-app
   ```

## 🌐 Bước 4: Kiểm tra Deployment

### Kiểm tra container đang chạy:

```bash
docker ps | grep dictionary-mrvu-app
```

Kết quả phải hiển thị container đang chạy.

### Kiểm tra logs:

```bash
docker logs -f dictionary-mrvu-app
```

### Kiểm tra health check:

```bash
docker inspect --format='{{.State.Health.Status}}' dictionary-mrvu-app
```

Kết quả phải là `healthy`

## 📱 Truy cập Ứng Dụng

| Chức năng           | URL                                |
| ------------------- | ---------------------------------- |
| 🏠 Trang chủ        | http://103.56.162.100              |
| 🔍 Tìm kiếm từ điển | http://103.56.162.100              |
| 🔐 Đăng nhập Admin  | http://103.56.162.100/login        |
| 📚 Quản lý Từ điển  | http://103.56.162.100/admin/import |

## 🔧 Troubleshooting

### Container không start

```bash
# Kiểm tra logs
docker logs dictionary-mrvu-app

# Rebuild image
cd /root/dictionary-mrvu
docker build -t dictionary-mrvu:latest .

# Start lại
docker run -d \
    --name dictionary-mrvu-app \
    -p 80:3000 \
    --restart unless-stopped \
    -v /root/dictionary-mrvu/data:/app/data \
    --env-file .env.production \
    dictionary-mrvu:latest
```

### Port 80 đã bị chiếm

```bash
# Kiểm tra port 80
netstat -tulpn | grep 80

# Hoặc dùng port khác
docker run -d \
    --name dictionary-mrvu-app \
    -p 8080:3000 \
    --restart unless-stopped \
    -v /root/dictionary-mrvu/data:/app/data \
    --env-file .env.production \
    dictionary-mrvu:latest
```

### Login không thành công

- Kiểm tra `ADMIN_PASSWORD` trong `.env.production`
- Restart container: `docker restart dictionary-mrvu-app`
- Check logs: `docker logs dictionary-mrvu-app`

### Database không found

```bash
# Kiểm tra database tồn tại
ls -lah /root/dictionary-mrvu/data/

# Nếu thiếu, restore từ bản backup
# Hoặc upload file database
```

## 📊 Kiểm tra Statistics

```bash
# Truy cập API stats
curl http://103.56.162.100/api/dictionary/stats
```

Expected response:

```json
{
  "success": true,
  "data": {
    "totalWords": 53000,
    "lastUpdated": "2024-12-08T10:00:00Z"
  }
}
```

## 🔄 Update Ứng dụng

Khi có cập nhật code mới:

```bash
cd /root/dictionary-mrvu

# Pull latest code
git pull origin main

# Rebuild image
docker build -t dictionary-mrvu:latest .

# Restart container
docker restart dictionary-mrvu-app

# Check logs
docker logs -f dictionary-mrvu-app
```

## 💾 Backup Database

```bash
# Backup database
cp /root/dictionary-mrvu/data/dictionary.db \
   /root/dictionary-mrvu/data/dictionary.db.backup.$(date +%Y%m%d_%H%M%S)

# List backups
ls -lah /root/dictionary-mrvu/data/dictionary.db*
```

## 🗑️ Cleanup

```bash
# Stop container
docker stop dictionary-mrvu-app

# Remove container
docker rm dictionary-mrvu-app

# Remove image
docker rmi dictionary-mrvu:latest
```

---

**Ghi chú:** Để automation hoàn toàn (không nhập password), thiết lập SSH key authentication trên server.
