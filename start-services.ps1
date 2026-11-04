# ADG-Bank Microservices Startup Script
# Starts each microservice in its own PowerShell window

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "         STARTING ADG-BANK MICROSERVICES        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 0. Clean up any existing instances on bank ports
Write-Host "Checking for stale processes on bank ports..." -ForegroundColor DarkGray
& "$root\stop-services.ps1"
Start-Sleep -Seconds 2

# 1. Config Server
Write-Host "`n1. Starting Config Server (Port 8888)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl config-server spring-boot:run"
Write-Host "Waiting 12 seconds for Config Server..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# 2. Eureka Discovery Server
Write-Host "`n2. Starting Eureka Discovery Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl eureka-server spring-boot:run"
Write-Host "Waiting 12 seconds for Eureka Server..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# 3. PQC Vault Service
Write-Host "`n3. Starting PQC Vault Service (Port 8084)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl pqc-vault-service spring-boot:run"

# 4. Market Rate Service
Write-Host "`n4. Starting Market Rate Service (Port 8085)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl market-rate-service spring-boot:run"

# 5. User Service
Write-Host "`n5. Starting User Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl user-service spring-boot:run"

# 6. Account Service
Write-Host "`n6. Starting Account Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl account-service spring-boot:run"

# 7. Transaction Service
Write-Host "`n7. Starting Transaction Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl transaction-service spring-boot:run"
Write-Host "Waiting 10 seconds for business services to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 10

# 8. API Gateway
Write-Host "`n8. Starting API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\mvnw.cmd -pl api-gateway spring-boot:run"

Write-Host "`n=================================================" -ForegroundColor Green
Write-Host " All ADG-Bank microservices dispatched!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "API Gateway:       http://localhost:8080" -ForegroundColor Cyan
Write-Host "Swagger UI:        http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
