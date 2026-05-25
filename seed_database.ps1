$baseUrl = "http://localhost:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Register User
$registerBody = @{
    username = "user@example.com"
    password = "password123"
    fullName = "John Doe"
    phoneNumber = "+1234567890"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# 2. Login
$loginBody = @{
    username = "user@example.com"
    password = "password123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session

# 3. Create Custom Category
$categoryBody = @{
    name = "SideBusinessIncome"
    type = "INCOME"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $categoryBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# 4. Create Transaction
$transactionBody = @{
    amount = 50000.00
    date = "2024-01-15"
    categoryName = "Salary"
    description = "January Salary"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $transactionBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

# 5. Create Savings Goal
$goalBody = @{
    goalName = "Emergency Fund"
    targetAmount = 5000.00
    targetDate = "2026-01-01"
    startDate = "2025-01-01"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/goals" -Method Post -Body $goalBody -ContentType "application/json" -WebSession $session -ErrorAction SilentlyContinue

Write-Host "Database successfully seeded with the example data!"
