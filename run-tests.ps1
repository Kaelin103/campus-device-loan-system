Write-Host "=== DCampus Device Loan Automated Test ==="
$deviceBase = "http://localhost:32101"
$loanBase = "http://localhost:32102"
$targetDevice = "macbook-pro-1"
function CallApi($method, $url, $body="") {
    if ($body -ne "") {
        return Invoke-WebRequest -UseBasicParsing -Method $method -Uri $url -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
    } else {
        return Invoke-WebRequest -UseBasicParsing -Method $method -Uri $url | Select-Object -ExpandProperty Content | ConvertFrom-Json
    }
}
Write-Host "--- Seeding devices..."
$seed = CallApi "POST" "$deviceBase/api/devices/seed"
Write-Host "Seed Response:" $seed.message
$devices = CallApi "GET" "$deviceBase/api/devices"
Write-Host "--- Devices count:" $devices.Length
$body = "{`"userId`":`"test-user`",`"userName`":`"Test User`",`"deviceId`":`"$targetDevice`"}"
$loan = CallApi "POST" "$loanBase/api/loans" $body
$loanId = $loan.id
Write-Host "--- Reserved Loan ID:" $loanId
$collect = CallApi "POST" "$loanBase/api/loans/$loanId/collect"
Write-Host "--- Collect Status:" $collect.status
$return = CallApi "POST" "$loanBase/api/loans/$loanId/return"
Write-Host "--- Return Status:" $return.status
$after = CallApi "GET" "$deviceBase/api/devices"
$mbp = $after | Where-Object { $_.id -eq $targetDevice }
Write-Host "--- Final Available Quantity:" $mbp.availableQuantity
Write-Host "=== TEST COMPLETED SUCCESSFULLY ==="
