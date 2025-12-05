.PHONY: help build docker-build docker-push docker-run deploy clean

# Biến cấu hình
SERVER_IP = 103.56.162.100
SERVER_PORT = 24700
SERVER_USER = root
SERVER_PASS = _GHKpxi#Gmp4E8elT34o
DOCKER_REGISTRY = your-registry  # Thay đổi nếu sử dụng registry khác
IMAGE_NAME = dictionary-mrvu
IMAGE_TAG = latest
CONTAINER_NAME = dictionary-mrvu-app
APP_PORT = 3000
EXPOSED_PORT = 80  # Port exposed to outside world (80 for HTTP, 3000 for development)
SERVER_PORT_APP = 80  # Change to 3000 if you prefer port 3000

# Màu cho output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

help:
	@echo "$(GREEN)📋 Dictionary MRVU - Makefile Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Build Commands:$(NC)"
	@echo "  make build              - Build Next.js app"
	@echo "  make clean              - Xóa build files"
	@echo ""
	@echo "$(YELLOW)Docker Commands:$(NC)"
	@echo "  make docker-build       - Build Docker image"
	@echo "  make docker-run         - Chạy container locally"
	@echo "  make docker-stop        - Dừng container"
	@echo "  make docker-logs        - Xem logs container"
	@echo ""
	@echo "$(YELLOW)Deployment Commands:$(NC)"
	@echo "  make deploy             - Build, push, và deploy lên server"
	@echo "  make deploy-prod        - Deploy to production"
	@echo ""
	@echo "$(YELLOW)Server Commands:$(NC)"
	@echo "  make ssh                - SSH vào server"
	@echo "  make server-pull        - Pull image mới từ server"
	@echo "  make server-restart     - Restart app trên server"

# ============= BUILD COMMANDS =============
build:
	@echo "$(GREEN)🔨 Building Next.js app...$(NC)"
	npm run build

clean:
	@echo "$(YELLOW)🗑️  Cleaning up...$(NC)"
	rm -rf .next
	rm -rf dist
	rm -rf build
	@echo "$(GREEN)✅ Clean complete$(NC)"

# ============= DOCKER COMMANDS =============
docker-build: clean
	@echo "$(GREEN)🐳 Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):latest
	@echo "$(GREEN)✅ Docker image built successfully$(NC)"

docker-run: docker-build
	@echo "$(GREEN)🚀 Running Docker container...$(NC)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(APP_PORT):3000 \
		--restart unless-stopped \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)✅ Container is running on http://localhost:$(APP_PORT)$(NC)"

docker-stop:
	@echo "$(YELLOW)⏹️  Stopping Docker container...$(NC)"
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	@echo "$(GREEN)✅ Container stopped$(NC)"

docker-logs:
	@echo "$(YELLOW)📋 Docker container logs:$(NC)"
	docker logs -f $(CONTAINER_NAME)

# ============= DEPLOYMENT COMMANDS =============
deploy: docker-build
	@echo "$(GREEN)📦 Preparing deployment...$(NC)"
	@echo "$(YELLOW)Server: $(SERVER_IP):$(SERVER_PORT)$(NC)"
	@echo "$(YELLOW)User: $(SERVER_USER)$(NC)"
	
	@echo "$(GREEN)📤 Uploading Dockerfile and scripts...$(NC)"
	scp -P $(SERVER_PORT) Dockerfile $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/
	scp -P $(SERVER_PORT) docker-compose.yml $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/ || echo "docker-compose.yml not found, skipping..."
	
	@echo "$(GREEN)🐳 Building image on server...$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"cd /root/dictionary-mrvu && \
		docker build -t $(IMAGE_NAME):$(IMAGE_TAG) . && \
		echo '$(GREEN)✅ Image built on server$(NC)'"
	
	@echo "$(GREEN)🚀 Stopping old container and starting new one...$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"docker stop $(CONTAINER_NAME) || true; \
		docker rm $(CONTAINER_NAME) || true; \
		docker run -d \
			--name $(CONTAINER_NAME) \
			-p $(SERVER_PORT_APP):3000 \
			--restart unless-stopped \
			$(IMAGE_NAME):$(IMAGE_TAG)"
	
	@echo "$(GREEN)✅ Deployment complete!$(NC)"
	@echo "$(GREEN)🌐 App running on http://$(SERVER_IP):$(SERVER_PORT_APP)$(NC)"

deploy-prod: docker-build
	@echo "$(RED)⚠️  PRODUCTION DEPLOYMENT$(NC)"
	@read -p "Bạn chắc chắn không? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(MAKE) deploy; \
	else \
		echo "$(YELLOW)Deployment cancelled$(NC)"; \
	fi

# ============= SERVER COMMANDS =============
ssh:
	@echo "$(GREEN)🔗 Connecting to server...$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP)

server-pull:
	@echo "$(GREEN)📥 Pulling latest image on server...$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"cd /root/dictionary-mrvu && \
		docker pull $(IMAGE_NAME):$(IMAGE_TAG) || echo 'Using local image'"

server-restart:
	@echo "$(YELLOW)♻️  Restarting app on server...$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"docker restart $(CONTAINER_NAME)"
	@echo "$(GREEN)✅ App restarted$(NC)"

server-logs:
	@echo "$(YELLOW)📋 Server logs:$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"docker logs -f $(CONTAINER_NAME)"

server-status:
	@echo "$(YELLOW)📊 Server status:$(NC)"
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP) \
		"docker ps | grep $(IMAGE_NAME) || echo 'Container not running'"

# ============= LOCAL TESTING =============
test-build: build
	@echo "$(GREEN)✅ Build test passed$(NC)"

test-docker: docker-build
	@echo "$(GREEN)✅ Docker build test passed$(NC)"

# ============= CLEANUP =============
purge: docker-stop clean
	@echo "$(GREEN)🧹 Full cleanup complete$(NC)"
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true
	docker rmi $(IMAGE_NAME):latest || true

.DEFAULT_GOAL := help
