# ADG-Bank Microservices Startup Script
# Starts each microservice in its own PowerShell window

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "         STARTING ADG-BANK MICROSERVICES        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Config Server
Write-Host "1. Starting Config Server (Port 8888)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl config-server spring-boot:run"
Write-Host "Waiting 12 seconds for Config Server..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# 2. Eureka Server
Write-Host "2. Starting Eureka Discovery Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl eureka-server spring-boot:run"
Write-Host "Waiting 12 seconds for Eureka Server..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# 3. User Service
Write-Host "3. Starting User Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl user-service spring-boot:run"

# 4. Account Service
Write-Host "4. Starting Account Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl account-service spring-boot:run"

# 5. Transaction Service
Write-Host "5. Starting Transaction Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl transaction-service spring-boot:run"
Write-Host "Waiting 10 seconds for business services..." -ForegroundColor DarkGray
Start-Sleep -Seconds 10

# 6. API Gateway
Write-Host "6. Starting API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl api-gateway spring-boot:run"

Write-Host "`nAll microservice startup commands dispatched!" -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "API Gateway:       http://localhost:8080" -ForegroundColor Cyan
Write-Host "Swagger UI:        http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
