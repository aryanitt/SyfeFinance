$baseUrl = "http://localhost:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login
$loginBody = @{
    username = "user@example.com"
    password = "password123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# Clear existing transactions for user@example.com
$transactions = Invoke-RestMethod -Uri "$baseUrl/transactions?startDate=1900-01-01&endDate=2100-01-01" -Method Get -WebSession $session
foreach ($tx in $transactions) {
    Invoke-RestMethod -Uri "$baseUrl/transactions/$($tx.id)" -Method Delete -WebSession $session
}

# Create Custom Category for Freelance (if it doesn't exist)
$categoryBody = @{
    name = "Freelance"
    type = "INCOME"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $categoryBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# Get today's date in YYYY-MM-DD format
$today = (Get-Date).ToString("yyyy-MM-dd")

# Insert exact transactions to produce the requested numbers for the CURRENT month
$tx1 = @{ amount = 36000.00; date = $today; categoryName = "Salary"; description = "Requested Salary" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx1 -ContentType "application/json" -WebSession $session

$tx2 = @{ amount = 6000.00; date = $today; categoryName = "Freelance"; description = "Requested Freelance" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx2 -ContentType "application/json" -WebSession $session

$tx3 = @{ amount = 4800.00; date = $today; categoryName = "Food"; description = "Requested Food" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx3 -ContentType "application/json" -WebSession $session

$tx4 = @{ amount = 14400.00; date = $today; categoryName = "Rent"; description = "Requested Rent" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx4 -ContentType "application/json" -WebSession $session

$tx5 = @{ amount = 2400.00; date = $today; categoryName = "Transportation"; description = "Requested Transportation" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx5 -ContentType "application/json" -WebSession $session

Write-Host "Database populated for the CURRENT month!"
