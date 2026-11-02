# ADG-Bank Frontend Startup Script
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "         STARTING ADG-BANK REVOLUT FRONTEND     " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir

Write-Host "Starting Vite Dev Server on http://localhost:5173..." -ForegroundColor Green
npm run dev

