$baseUrl = "http://localhost:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login
$loginBody = @{
    username = "user@example.com"
    password = "password123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session

# 2. Clear existing transactions to match exactly what is requested
$transactions = Invoke-RestMethod -Uri "$baseUrl/transactions?startDate=1900-01-01&endDate=2100-01-01" -Method Get -WebSession $session
foreach ($tx in $transactions) {
    Invoke-RestMethod -Uri "$baseUrl/transactions/$($tx.id)" -Method Delete -WebSession $session
}

# 3. Create Custom Category for Freelance (if it doesn't exist)
$categoryBody = @{
    name = "Freelance"
    type = "INCOME"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $categoryBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# 4. Insert exact transactions to produce the 2024 Yearly Report
$tx1 = @{ amount = 36000.00; date = "2024-06-01"; categoryName = "Salary"; description = "2024 Salary" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx1 -ContentType "application/json" -WebSession $session

$tx2 = @{ amount = 6000.00; date = "2024-06-01"; categoryName = "Freelance"; description = "2024 Freelance" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx2 -ContentType "application/json" -WebSession $session

$tx3 = @{ amount = 4800.00; date = "2024-06-01"; categoryName = "Food"; description = "2024 Food" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx3 -ContentType "application/json" -WebSession $session

$tx4 = @{ amount = 14400.00; date = "2024-06-01"; categoryName = "Rent"; description = "2024 Rent" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx4 -ContentType "application/json" -WebSession $session

$tx5 = @{ amount = 2400.00; date = "2024-06-01"; categoryName = "Transportation"; description = "2024 Transportation" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $tx5 -ContentType "application/json" -WebSession $session

# 5. Fix the Savings Goal that failed earlier (removed startDate)
$goalBody = @{
    goalName = "Emergency Fund"
    targetAmount = 5000.00
    targetDate = "2026-01-01"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/goals" -Method Post -Body $goalBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

Write-Host "Database populated with the exact report data!"
