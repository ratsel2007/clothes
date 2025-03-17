@echo off

:: Start Docker Compose
cd backend
start cmd /k "docker-compose up"

:: Wait for Docker to initialize
timeout /t 10

:: Start Backend
start cmd /k "cd backend && npm run start:dev"

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

echo All services are starting...