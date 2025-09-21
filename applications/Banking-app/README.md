# Simple Banking Microservices Demo

A simple but presentable banking application built with microservices architecture.

## Architecture

- **Frontend**: Static web interface with interactive demo
- **User Service**: Manages user accounts and authentication 
- **Account Service**: Handles account balances and operations
- **Transaction Service**: Processes financial transactions

## Quick Start

1. Make sure Docker and Docker Compose are installed
2. Run the application:
   ```bash
   ./start.sh
   ```
3. Open http://localhost:8080 in your browser
4. Try the interactive demo!

## Commands

- `./start.sh` - Build and start all services
- `./stop.sh` - Stop all services  
- `./logs.sh` - View logs from all services
- `docker-compose ps` - Check service status

## API Endpoints

### User Service (Port 3001)
- `GET /health` - Health check
- `POST /users` - Create user
- `GET /users/:username` - Get user info

### Account Service (Port 3002)  
- `GET /health` - Health check
- `GET /accounts/:username/balance` - Get balance
- `PUT /accounts/:username/balance` - Update balance

### Transaction Service (Port 3003)
- `GET /health` - Health check
- `POST /transactions` - Create transaction
- `GET /transactions/:username` - Get user transactions

## Demo Features

✅ Service health monitoring
✅ User creation
✅ Balance checking  
✅ Transaction processing
✅ Responsive web interface
✅ Real-time API communication
✅ Error handling

Perfect for Kubernetes deployment demos!
