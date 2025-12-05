# 🚀 HƯỚNG DẪN DEPLOY - TIẾNG VIỆT

## 📝 Thông Tin Server

```
IP: 103.56.162.100
Port: 24700
User: root
```

## 🎯 Deploy Nhanh (1 lệnh)

```bash
make deploy
```

**Xong!** App sẽ chạy tại: http://103.56.162.100:3000

---

## 📖 Chi Tiết Từng Bước

### Bước 1: Build Locally (Test)

```bash
make docker-build
```

- Tạo Docker image trên máy local
- Mất khoảng 2-5 phút (lần đầu lâu hơn)

### Bước 2: Test Chạy Local (Tuỳ chọn)

```bash
make docker-run
```

- Chạy container locally
- Truy cập: http://localhost:3000
- Xem logs: `make docker-logs`
- Stop: `make docker-stop`

### Bước 3: Deploy Lên Server

```bash
make deploy
```

- Tự động upload và build trên server
- Tự động restart app

### Bước 4: Kiểm Tra

```bash
make server-logs
```

- Xem logs từ server
- Hoặc truy cập: http://103.56.162.100:3000

---

## 🛠️ Các Lệnh Khác

```bash
# Xem tất cả lệnh
make help

# SSH vào server
make ssh

# Kiểm tra trạng thái
make server-status

# Restart app
make server-restart

# Xóa tất cả (cleanup)
make purge
```

---

## ⚠️ Troubleshooting

### ❌ SSH connection refused

```bash
ssh -p 24700 root@103.56.162.100
```

- Kiểm tra IP, port, username, password
- Nếu lỗi credentials, đảm bảo sử dụng đúng password

### ❌ Docker not found on server

```bash
# SSH vào server rồi cài Docker
ssh -p 24700 root@103.56.162.100
curl -sSL https://get.docker.com | sh
```

### ❌ Container start failed

```bash
make server-logs
# Xem error message
```

### ❌ Port 3000 đã bị chiếm

```bash
ssh -p 24700 root@103.56.162.100
lsof -i :3000
# Kill process cũ nếu cần
```

---

## 📊 Files Quan Trọng

| File                 | Mục đích            |
| -------------------- | ------------------- |
| `Dockerfile`         | Cách build image    |
| `Makefile`           | Các lệnh automation |
| `docker-compose.yml` | Container config    |
| `quick-deploy.sh`    | Deploy script       |

---

## 🔄 Deploy Lại (Update)

```bash
# Khi có code mới
make deploy
```

Lệnh này tự động:

1. Build image mới
2. Stop container cũ
3. Start container mới

---

## 💡 Tips

✅ Test locally trước khi deploy  
✅ Luôn xem logs sau khi deploy  
✅ Keep container running 24/7  
✅ Backup old image trước deploy

---

## 📞 Cần Giúp?

Xem file: `DEPLOYMENT_GUIDE.md` (chi tiết)
