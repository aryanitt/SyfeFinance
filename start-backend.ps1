# Start the Spring Boot backend (requires JDK 17 and Maven on PATH)
Set-Location $PSScriptRoot\backend
Write-Host "Building and starting backend on http://localhost:8080 ..."
mvn spring-boot:run
