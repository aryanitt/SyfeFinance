$baseUrl = "https://syfe-finance-backend.onrender.com/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$username = "aryanguptaofficial98@gmail.com"
$password = "1234567"

# 1. Register User (Ignore error if already exists)
Write-Host "Attempting to register user $username..."
$registerBody = @{
    username = $username
    password = $password
    fullName = "Aryan Gupta"
    phoneNumber = "+1234567890"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -WebSession $session -ErrorAction Stop
    Write-Host "User successfully registered!"
} catch {
    Write-Host "Registration skipped (user may already exist)."
}

# 2. Login
Write-Host "Logging in..."
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session -ErrorAction Stop
    Write-Host "Login successful!"
} catch {
    Write-Host "Error: Login failed! Please check your credentials or if the backend service is up."
    exit 1
}

# 3. Create Custom Category for Freelance (Ignore if already exists)
Write-Host "Creating Freelance category..."
$categoryBody = @{
    name = "Freelance"
    type = "INCOME"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $categoryBody -ContentType "application/json" -WebSession $session -ErrorAction Stop
    Write-Host "Freelance category created."
} catch {
    Write-Host "Freelance category already exists or could not be created."
}

# 4. Insert Transactions for January 2024
$date = "2024-01-15"
Write-Host "Inserting January 2024 transactions..."

$transactions = @(
    @{ amount = 3000.00; date = $date; categoryName = "Salary"; description = "Salary Income" },
    @{ amount = 500.00; date = $date; categoryName = "Freelance"; description = "Freelance Income" },
    @{ amount = 400.00; date = $date; categoryName = "Food"; description = "Food Expenses" },
    @{ amount = 1200.00; date = $date; categoryName = "Rent"; description = "Monthly Rent" },
    @{ amount = 200.00; date = $date; categoryName = "Transportation"; description = "Travel Expenses" }
)

foreach ($tx in $transactions) {
    $body = $tx | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Post -Body $body -ContentType "application/json" -WebSession $session -ErrorAction Stop
        Write-Host "Successfully added $($tx.categoryName) transaction of ₹$($tx.amount)."
    } catch {
        Write-Host "Failed to add $($tx.categoryName) transaction: $_"
    }
}

Write-Host "Seeding production data completed successfully!"
