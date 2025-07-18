#!/bin/bash

echo "🔄 Installing MongoDB directly on Ubuntu/Debian..."

# Check if running on Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    echo "❌ This script is for Ubuntu/Debian systems only."
    echo "   Please visit: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

# Import MongoDB public GPG Key
echo "📥 Adding MongoDB GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create list file for MongoDB
echo "📝 Adding MongoDB repository..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database
echo "🔄 Updating package list..."
sudo apt-get update

# Install MongoDB packages
echo "📦 Installing MongoDB..."
sudo apt-get install -y mongodb-org

# Start MongoDB
echo "🚀 Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Test MongoDB
echo "⏳ Testing MongoDB connection..."
sleep 3

if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running successfully!"
    echo "📊 MongoDB is available at: mongodb://localhost:27017/studio_app"
    echo "🔧 You can now start your Next.js application with: npm run dev"
    echo ""
    echo "💡 MongoDB service commands:"
    echo "   Start:   sudo systemctl start mongod"
    echo "   Stop:    sudo systemctl stop mongod"
    echo "   Status:  sudo systemctl status mongod"
    echo "   Logs:    sudo journalctl -u mongod"
else
    echo "❌ Failed to connect to MongoDB."
    echo "   Check the status: sudo systemctl status mongod"
    echo "   Check the logs: sudo journalctl -u mongod"
fi
