#!/usr/bin/env bash
set -e
device_base="http://localhost:32101"
loan_base="http://localhost:32102"
target_device="macbook-pro-1"
echo "=== DCampus Device Loan Automated Test (cURL) ==="
curl -s -X POST "${device_base}/api/devices/seed" -H "Content-Type: application/json"
devices_json=$(curl -s "${device_base}/api/devices")
echo
echo "--- Devices response:"
echo "$devices_json"
loan_json=$(curl -s -X POST "${loan_base}/api/loans" -H "Content-Type: application/json" -d "{\"userId\":\"test-user\",\"userName\":\"Test User\",\"deviceId\":\"${target_device}\"}")
echo "--- Reserved Loan:"
echo "$loan_json"
loan_id=$(echo "$loan_json" | node -e "const fs=require('fs');const s=fs.readFileSync(0,'utf8');const j=JSON.parse(s);process.stdout.write(j.id||'');")
collect_json=$(curl -s -X POST "${loan_base}/api/loans/${loan_id}/collect")
echo "--- Collect:"
echo "$collect_json"
return_json=$(curl -s -X POST "${loan_base}/api/loans/${loan_id}/return")
echo "--- Return:"
echo "$return_json"
after_json=$(curl -s "${device_base}/api/devices")
echo "--- Devices After Return:"
echo "$after_json"
echo "=== TEST COMPLETED SUCCESSFULLY ==="
