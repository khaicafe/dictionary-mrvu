.PHONY: help build docker-build docker-run deploy clean

# Configuration
SERVER_IP = 103.56.162.100
SERVER_PORT = 24700
SERVER_USER = root
SERVER_PASS = '_GHKpxi#Gmp4E8elT34o'
IMAGE_NAME = dictionary-mrvu
IMAGE_TAG = latest
CONTAINER_NAME = dictionary-mrvu-app
APP_PORT = 3000
SERVER_PORT_APP = 80

# SSH with password (using sshpass)
SSH_CMD = sshpass -p $(SERVER_PASS) ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_IP)
RSYNC_CMD = sshpass -p $(SERVER_PASS) rsync -avz -e "ssh -p $(SERVER_PORT)"

# Colors
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m

help:
	@echo "$(GREEN)Dictionary MRVU - Makefile Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Build Commands:$(NC)"
	@echo "  make build              - Build Next.js app"
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
	@echo "$(GREEN)Building Next.js app...$(NC)"
	npm run build

clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	rm -rf .next dist build
	@echo "$(GREEN)Clean complete$(NC)"

docker-build: clean
	@echo "$(GREEN)Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):latest
	@echo "$(GREEN)Docker image built$(NC)"

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

deploy: docker-build
	@echo "$(GREEN)Starting deployment...$(NC)"
	@echo "$(YELLOW)Server: $(SERVER_IP):$(SERVER_PORT)$(NC)"
	@echo "$(YELLOW)User: $(SERVER_USER)$(NC)"
	
	@echo "$(GREEN)Creating app directory...$(NC)"
	$(SSH_CMD) "mkdir -p /root/dictionary-mrvu"
	
	@echo "$(GREEN)Uploading source code...$(NC)"
	$(RSYNC_CMD) \
		--exclude='.git' \
		--exclude='node_modules' \
		--exclude='.next' \
		--exclude='dist' \
		--exclude='build' \
		--exclude='.env.local' \
		--exclude='data/dictionary.db*' \
		--exclude='*.log' \
		./ $(SERVER_USER)@$(SERVER_IP):/root/dictionary-mrvu/
	
	@echo "$(GREEN)Building Docker image on server...$(NC)"
	$(SSH_CMD) "cd /root/dictionary-mrvu && docker build -t $(IMAGE_NAME):$(IMAGE_TAG) ."
	
	@echo "$(GREEN)Stopping old container...$(NC)"
	$(SSH_CMD) "docker stop $(CONTAINER_NAME) || true; docker rm $(CONTAINER_NAME) || true"
	
	@echo "$(GREEN)Starting new container...$(NC)"
	$(SSH_CMD) "docker run -d --name $(CONTAINER_NAME) -p $(SERVER_PORT_APP):3000 -v /root/dictionary-mrvu/data:/app/data -e ADMIN_PASSWORD=admin123 --restart unless-stopped $(IMAGE_NAME):$(IMAGE_TAG)"
	
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
