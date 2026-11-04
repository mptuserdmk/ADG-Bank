# ADG-Bank Microservices Shutdown Script
# Gracefully stops all processes listening on bank ports

Write-Host "Stopping ADG-Bank Microservices..." -ForegroundColor Yellow

$ports = @(8888, 8761, 8080, 8081, 8082, 8083, 8084, 8085)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pids) {
            if ($pidToKill -gt 0) {
                Write-Host "Killing process $pidToKill on port $port..." -ForegroundColor Gray
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "All ADG-Bank microservice ports are now free." -ForegroundColor Green

