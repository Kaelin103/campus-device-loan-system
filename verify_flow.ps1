
$ErrorActionPreference = "Stop"

function Wait-For-Service {
    param($Url, $Name)
    $maxRetries = 20
    $retryCount = 0
    
    Write-Host "Checking $Name ($Url)..."
    while ($retryCount -lt $maxRetries) {
        try {
            $res = Invoke-WebRequest `
                -UseBasicParsing `
                -Method Get `
                -Uri $Url `
                -ErrorAction Stop
            
            if ($res.StatusCode -eq 200) {
                Write-Host "$Name is UP."
                return
            }
        } catch {
            Write-Host "Waiting for $Name... ($retryCount/$maxRetries)"
            Start-Sleep -Seconds 3
            $retryCount++
        }
    }
    Write-Error "$Name failed to start."
    exit 1
}

# 1. Health Checks
Wait-For-Service "http://localhost:32111/api/devices" "Device Service"
Wait-For-Service "http://localhost:32112/api/loans" "Loan Service"

# 2. Seed
Write-Host "`nStep 2: Seeding devices..."
try {
    $res = Invoke-WebRequest `
        -UseBasicParsing `
        -Method POST `
        -Uri "http://localhost:32111/api/devices/seed" `
        -ErrorAction Stop
        
    Write-Host "Seed response: $($res.StatusCode) $($res.StatusDescription)"
} catch {
    Write-Host "Seed might have failed (maybe already exists): $_"
}

# 3. Reserve
Write-Host "`nStep 3: Reserving device..."
$body = @{
    userId = "cli"
    userName = "CLI"
    deviceId = "ipad-air-1"
    deviceName = "iPad Air"
} | ConvertTo-Json -Compress

try {
    $res = Invoke-WebRequest `
        -UseBasicParsing `
        -Method POST `
        -Uri "http://localhost:32112/api/loans" `
        -ContentType "application/json" `
        -Body $body
        
    $loan = $res.Content | ConvertFrom-Json
    $loanId = $loan.id
    Write-Host "Reserved successfully. Loan ID: $loanId"
    Write-Host "Loan Status: $($loan.status)"
} catch {
    Write-Error "Reserve failed: $_"
    exit 1
}

# 4. Collect
if ($loanId) {
    Write-Host "`nStep 4: Collecting Loan $loanId..."
    try {
        $res = Invoke-WebRequest `
            -UseBasicParsing `
            -Method POST `
            -Uri "http://localhost:32112/api/loans/$loanId/collect"
            
        $collectedLoan = $res.Content | ConvertFrom-Json
        Write-Host "Collected successfully. Status: $($collectedLoan.status)"
    } catch {
        Write-Error "Collect failed: $_"
    }
}

# 5. Return
if ($loanId) {
    Write-Host "`nStep 5: Returning Loan $loanId..."
    try {
        $res = Invoke-WebRequest `
            -UseBasicParsing `
            -Method POST `
            -Uri "http://localhost:32112/api/loans/$loanId/return"
            
        $returnedLoan = $res.Content | ConvertFrom-Json
        Write-Host "Returned successfully. Status: $($returnedLoan.status)"
    } catch {
        Write-Error "Return failed: $_"
    }
}
