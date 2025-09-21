#!/bin/bash

echo "🏦 Starting Banking Microservices Demo..."

# Build and start all services
docker-compose up --build

echo "✅ All services are running!"
echo ""
echo "🌐 Access the application at: http://localhost:8080"
echo ""
echo "📡 Individual service endpoints:"
echo "   • User Service: http://localhost:3001"
echo "   • Account Service: http://localhost:3002" 
echo "   • Transaction Service: http://localhost:3003"
