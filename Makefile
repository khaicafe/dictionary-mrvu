# Deploy tất cả các bước: build, save, upload, deploy
deploy-all: docker-save docker-upload deploy
	@echo "$(GREEN)Deploy toàn bộ quy trình thành công!$(NC)"
docker-upload: docker-save
	@echo "$(GREEN)Uploading Docker image to VPS...$(NC)"
	$(RSYNC_CMD) $(IMAGE_NAME).tar $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/
	@echo "$(GREEN)Image uploaded to VPS$(NC)"
	@echo "$(GREEN)Uploading environment files...$(NC)"
	$(RSYNC_CMD) .env.local $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/
	$(RSYNC_CMD) .env.production.local $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/
	@echo "$(GREEN)Environment files uploaded$(NC)"
.PHONY: help build docker-build docker-run deploy clean

# Configuration
SERVER_IP = 103.56.162.100
SERVER_PORT = 24700
SERVER_USER = root
SERVER_PASS = _GHKpxi\#Gmp4E8elT34o
IMAGE_NAME = dictionary-mrvu
IMAGE_TAG = latest
CONTAINER_NAME = dictionary-mrvu-app
APP_PORT = 3000
SERVER_PORT_APP = 80

# Docker Hub config
DOCKERHUB_USER = minhkhai.vng@gmail.com
DOCKERHUB_REPO = dictionary-mrvu-app
DOCKERHUB_IMAGE = $(DOCKERHUB_USER)/$(DOCKERHUB_REPO):$(IMAGE_TAG)

# SSH with password (using sshpass)
SSH_CMD = sshpass -p "_GHKpxi\#Gmp4E8elT34o" ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP)
RSYNC_CMD = sshpass -p "_GHKpxi\#Gmp4E8elT34o" rsync -avz -e "ssh -p $(SERVER_PORT)"

# Colors
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m

help:
	@echo "$(GREEN)Dictionary MRVU - Makefile Commands (Yarn)$(NC)"
	@echo ""
	@echo "$(YELLOW)Build Commands:$(NC)"
	@echo "  make build              - Build Next.js app with yarn"
	@echo "  make clean              - Clean build files"
	@echo ""
	@echo "$(YELLOW)Docker Commands:$(NC)"
	@echo "  make docker-build       - Build Docker image"
	@echo "  make docker-run         - Run container locally"
	@echo "  make docker-stop        - Stop container"
	@echo ""
	@echo "$(YELLOW)Deployment Commands:$(NC)"
	@echo "  make deploy             - Deploy to server"
	@echo ""
	@echo "$(YELLOW)Server Commands:$(NC)"
	@echo "  make ssh                - SSH to server"
	@echo "  make server-logs        - View server logs"
	@echo "  make server-restart     - Restart app"

build:
	@echo "$(GREEN)Building Next.js app with yarn...$(NC)"
	yarn build

clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	rm -rf .next dist build .yarn/cache
	@echo "$(GREEN)Clean complete$(NC)"

docker-build: clean
	@echo "$(GREEN)Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):latest
	@echo "$(GREEN)Docker image built$(NC)"

docker-save: docker-build
	@echo "$(GREEN)Saving Docker image to file: $(IMAGE_NAME).tar$(NC)"
	docker save -o $(IMAGE_NAME).tar $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)Image saved as $(IMAGE_NAME).tar$(NC)"

docker-push: docker-build
	@echo "$(GREEN)Pushing Docker image to Docker Hub: $(DOCKERHUB_IMAGE)$(NC)"
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKERHUB_IMAGE)
	docker push $(DOCKERHUB_IMAGE)
	@echo "$(GREEN)Image pushed to Docker Hub$(NC)"

docker-run: docker-build
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(APP_PORT):3000 \
		--restart unless-stopped \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)Container running on http://localhost:$(APP_PORT)$(NC)"

docker-stop:
	@echo "$(YELLOW)Stopping Docker container...$(NC)"
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	@echo "$(GREEN)Container stopped$(NC)"

deploy:
	@echo "$(GREEN)Deploying image from local to VPS...$(NC)"
	@echo "$(YELLOW)Loading Docker image...$(NC)"
	$(SSH_CMD) "docker load -i /root/dictionary-mrvu/$(IMAGE_NAME).tar"
	@echo "$(GREEN)Image loaded successfully$(NC)"
	@echo "$(YELLOW)Stopping old container if exists...$(NC)"
	$(SSH_CMD) "docker stop $(CONTAINER_NAME) || true && docker rm $(CONTAINER_NAME) || true"
	@echo "$(YELLOW)Starting new container...$(NC)"
	$(SSH_CMD) "docker run -d --name $(CONTAINER_NAME) -p $(SERVER_PORT_APP):3000 -v /root/dictionary-mrvu/data:/app/data -v /root/dictionary-mrvu/.env.production.local:/app/.env.production.local -e ADMIN_PASSWORD=admin123 -e NODE_ENV=production --restart unless-stopped $(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "$(GREEN)Deployment complete!$(NC)"
	@echo "$(GREEN)App running on http://$(SERVER_IP):$(SERVER_PORT_APP)$(NC)"

ssh:
	@echo "$(GREEN)Connecting to server...$(NC)"
	$(SSH_CMD)

server-logs:
	@echo "$(YELLOW)Server logs:$(NC)"
	$(SSH_CMD) "docker logs -f $(CONTAINER_NAME)"

server-restart:
	@echo "$(YELLOW)Restarting app...$(NC)"
	$(SSH_CMD) "docker restart $(CONTAINER_NAME)"
	@echo "$(GREEN)App restarted$(NC)"

.DEFAULT_GOAL := help
