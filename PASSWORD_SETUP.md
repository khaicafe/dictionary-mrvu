# 🔐 Password Authentication Guide

## Thông Tin Server

```
🌐 IP: 103.56.162.100
🔌 Port: 24700
👤 User: root
🔑 Password: _GHKpxi#Gmp4E8elT34o
```

## 📝 Password Đã Được Set Trong Files

Các files sau đã được cập nhật với password:

```bash
✅ Makefile                    # SERVER_PASS variable
✅ quick-deploy.sh             # SERVER_PASS variable
✅ deploy-with-password.sh     # Password authentication
```

## 🚀 Deploy Methods

### Method 1: Với SSH Key (Recommended - Nếu có SSH key)

```bash
# Thêm SSH key vào server (lần đầu)
ssh-copy-id -p 24700 root@103.56.162.100

# Sau đó deploy bình thường
make deploy
```

### Method 2: Dùng sshpass (Dùng Password)

```bash
# Install sshpass nếu chưa có
bash check-sshpass.sh

# Deploy với password
bash deploy-with-password.sh
```

### Method 3: Input Password Khi Chạy

```bash
# SSH sẽ yêu cầu password khi chạy
make deploy
# Nhập password: _GHKpxi#Gmp4E8elT34o
```

## 🛠️ Setup SSH Key (Optional - Secure Hơn)

Nếu muốn tránh nhập password mỗi lần:

```bash
# Tạo SSH key (nếu chưa có)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Copy key lên server
ssh-copy-id -p 24700 root@103.56.162.100
# Nhập password: _GHKpxi#Gmp4E8elT34o

# Sau đó deploy không cần password
make deploy
```

## 📋 Các Lệnh Deploy

```bash
# 1. Deploy with sshpass (Password)
bash deploy-with-password.sh

# 2. Deploy with Makefile (Prompt password)
make deploy

# 3. Quick deploy (Original script)
bash quick-deploy.sh

# 4. Manual deploy
make docker-build                           # Build locally
sshpass -p "_GHKpxi#Gmp4E8elT34o" \
  scp -P 24700 Dockerfile root@103.56.162.100:/root/dictionary-mrvu/
make deploy
```

## ⚠️ Security Tips

1. **Không commit password** - Password trong file không nên commit lên Git
2. **Dùng SSH Key** - Aman hơn dùng password
3. **Restrict file permissions**:
   ```bash
   chmod 600 deploy-with-password.sh
   chmod 600 quick-deploy.sh
   ```

## 🔒 Secure Setup (Recommended)

```bash
# 1. Add to .gitignore
echo "*.local" >> .gitignore
echo ".env.local" >> .gitignore

# 2. Create local config
cp quick-deploy.sh quick-deploy.local.sh
# Edit quick-deploy.local.sh with your password

# 3. Add to .gitignore
echo "quick-deploy.local.sh" >> .gitignore
echo "deploy-with-password.sh" >> .gitignore

# 4. Use SSH Key instead (preferred)
ssh-copy-id -p 24700 root@103.56.162.100
```

## 🧪 Test Connection

```bash
# Test với sshpass
sshpass -p "_GHKpxi#Gmp4E8elT34o" \
  ssh -p 24700 root@103.56.162.100 "echo 'Connection OK!'"

# Test với SSH key
ssh -p 24700 root@103.56.162.100 "echo 'Connection OK!'"
```

## 📞 Troubleshooting

### sshpass: command not found

```bash
# Install sshpass
bash check-sshpass.sh

# Hoặc manual
# macOS
brew install sshpass

# Linux
sudo apt-get install sshpass
```

### Permission denied

```bash
# Check password
sshpass -p "_GHKpxi#Gmp4E8elT34o" ssh -p 24700 root@103.56.162.100 "whoami"

# Check SSH key permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
```

### Slow SSH Connection

```bash
# Add to ~/.ssh/config
Host 103.56.162.100
    Port 24700
    User root
    ServerAliveInterval 60
    ServerAliveCountMax 10
    ConnectTimeout 10
```

---

**Password Status**: ✅ Set trong Makefile & Scripts
**Recommend**: 🔒 Setup SSH Key for security
