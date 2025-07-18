#!/bin/bash

echo "🔄 Setting up MongoDB for Studio App..."

# Function to check if user is in docker group
check_docker_permissions() {
    if ! groups $USER | grep -q docker; then
        echo "⚠️  Your user is not in the 'docker' group."
        echo "   You can either:"
        echo "   1. Run with sudo: sudo ./setup-mongodb.sh"
        echo "   2. Add yourself to docker group: sudo usermod -aG docker $USER"
        echo "      (Then logout and login again)"
        echo "   3. Use the manual MongoDB installation option below"
        echo ""
        read -p "Do you want to run with sudo? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            USE_SUDO=true
        else
            echo "🔄 Showing manual installation options..."
            show_manual_installation
            exit 0
        fi
    else
        USE_SUDO=false
    fi
}

# Function to show manual installation options
show_manual_installation() {
    echo ""
    echo "📦 Manual MongoDB Installation Options:"
    echo ""
    echo "Option 1: Install MongoDB directly (Ubuntu/Debian):"
    echo "  wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -"
    echo "  echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y mongodb-org"
    echo "  sudo systemctl start mongod"
    echo "  sudo systemctl enable mongod"
    echo ""
    echo "Option 2: Use MongoDB in Cloud (MongoDB Atlas):"
    echo "  1. Go to https://www.mongodb.com/atlas"
    echo "  2. Create a free account and cluster"
    echo "  3. Get your connection string"
    echo "  4. Update .env.local with your Atlas connection string"
    echo ""
    echo "Option 3: Use Podman (Docker alternative):"
    echo "  sudo apt-get install podman"
    echo "  podman run -d --name studio_mongodb -p 27017:27017 mongo:7.0"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    show_manual_installation
    exit 1
fi

# Check Docker permissions
check_docker_permissions

# Set Docker command prefix
if [ "$USE_SUDO" = true ]; then
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo docker-compose"
    if ! command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="sudo docker compose"
    fi
else
    DOCKER_CMD="docker"
    DOCKER_COMPOSE_CMD="docker-compose"
    if ! command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    fi
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! $DOCKER_CMD compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    show_manual_installation
    exit 1
fi

# Start MongoDB using Docker Compose
echo "🚀 Starting MongoDB container..."
$DOCKER_COMPOSE_CMD up -d mongodb

# Check if MongoDB is running
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Test MongoDB connection
if $DOCKER_CMD exec studio_mongodb mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running successfully!"
    echo "📊 MongoDB is available at: mongodb://localhost:27017/studio_app"
    echo "🔧 You can now start your Next.js application with: npm run dev"
else
    echo "❌ Failed to connect to MongoDB. Checking container status..."
    echo "Container logs:"
    $DOCKER_CMD logs studio_mongodb 2>/dev/null || echo "Container not found or not running"
    echo ""
    echo "💡 Try these troubleshooting steps:"
    echo "   1. Check if container is running: $DOCKER_CMD ps"
    echo "   2. Check container logs: $DOCKER_CMD logs studio_mongodb"
    echo "   3. Try manual MongoDB installation (see above)"
fi
