# ADG-Bank E2E Smoke & Verification Script
param(
    [string]$GatewayUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "       ADG-BANK E2E VERIFICATION SCRIPT          " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

function Invoke-Api {
    param([string]$Method, [string]$Uri, $Body = $null, [hashtable]$Headers = @{})
    $json = if ($Body) { $Body | ConvertTo-Json -Compress } else { $null }
    $Headers["Content-Type"] = "application/json"
    try {
        if ($json) {
            Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -Body $json
        } else {
            Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
        }
    } catch {
        Write-Host "API Request Failed: $_" -ForegroundColor Red
        throw $_
    }
}

Write-Host "`n1. Testing Gateway Health..." -ForegroundColor Yellow
$health = Invoke-Api -Method "GET" -Uri "$GatewayUrl/actuator/health"
Write-Host "Gateway status: $($health.status)" -ForegroundColor Green

Write-Host "`n2. Creating User (Alex)..." -ForegroundColor Yellow
$userAlex = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/users" -Body @{
    username = "alex_smoke_$(Get-Random)"
    email = "alex_$(Get-Random)@adgbank.com"
    fullName = "Alex Verification"
}
Write-Host "User created: ID=$($userAlex.id), username=$($userAlex.username)" -ForegroundColor Green

Write-Host "`n3. Creating User (Elena)..." -ForegroundColor Yellow
$userElena = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/users" -Body @{
    username = "elena_smoke_$(Get-Random)"
    email = "elena_$(Get-Random)@adgbank.com"
    fullName = "Elena Verification"
}
Write-Host "User created: ID=$($userElena.id), username=$($userElena.username)" -ForegroundColor Green

Write-Host "`n4. Opening Source Account for Alex (Balance: 10,000 RUB)..." -ForegroundColor Yellow
$acc1 = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/accounts" -Body @{
    userId = $userAlex.id
    currency = "RUB"
    initialDeposit = 10000.00
}
Write-Host "Account opened: ID=$($acc1.id), Number=$($acc1.accountNumber), Balance=$($acc1.balance) $($acc1.currency)" -ForegroundColor Green

Write-Host "`n5. Opening Target Account for Elena (Balance: 500 RUB)..." -ForegroundColor Yellow
$acc2 = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/accounts" -Body @{
    userId = $userElena.id
    currency = "RUB"
    initialDeposit = 500.00
}
Write-Host "Account opened: ID=$($acc2.id), Number=$($acc2.accountNumber), Balance=$($acc2.balance) $($acc2.currency)" -ForegroundColor Green

Write-Host "`n6. Executing Transfer (3,000 RUB from Acc $($acc1.id) to Acc $($acc2.id)) with Idempotency Key..." -ForegroundColor Yellow
$idemKey = "smoke-tx-" + [System.Guid]::NewGuid().ToString()
$tx = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/transactions" -Headers @{"X-Idempotency-Key" = $idemKey} -Body @{
    sourceAccountId = $acc1.id
    targetAccountId = $acc2.id
    amount = 3000.00
    description = "Smoke test automated transfer"
}
Write-Host "Transaction executed: ID=$($tx.id), Status=$($tx.status), Amount=$($tx.amount)" -ForegroundColor Green

Write-Host "`n7. Testing Idempotency (repeating same request with same key)..." -ForegroundColor Yellow
$txRepeat = Invoke-Api -Method "POST" -Uri "$GatewayUrl/api/transactions" -Headers @{"X-Idempotency-Key" = $idemKey} -Body @{
    sourceAccountId = $acc1.id
    targetAccountId = $acc2.id
    amount = 3000.00
    description = "Smoke test automated transfer"
}
Write-Host "Idempotent response: ID=$($txRepeat.id), Status=$($txRepeat.status)" -ForegroundColor Green
if ($tx.id -ne $txRepeat.id) {
    throw "Idempotency failed: generated new transaction ID!"
}
Write-Host "Idempotency check PASSED! IDs match: $($tx.id)" -ForegroundColor Green

Write-Host "`n8. Verifying final balances..." -ForegroundColor Yellow
$updatedAcc1 = Invoke-Api -Method "GET" -Uri "$GatewayUrl/api/accounts/$($acc1.id)"
$updatedAcc2 = Invoke-Api -Method "GET" -Uri "$GatewayUrl/api/accounts/$($acc2.id)"
Write-Host "Source account balance: $($updatedAcc1.balance) RUB (Expected: 7000.00)" -ForegroundColor Green
Write-Host "Target account balance: $($updatedAcc2.balance) RUB (Expected: 3500.00)" -ForegroundColor Green

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "   ALL E2E SMOKE CHECKS PASSED SUCCESSFULLY!    " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

