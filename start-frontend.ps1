# Start the Vite dev server (proxies /api to http://localhost:8080)
Set-Location $PSScriptRoot\frontend
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..."
    npm install
}
Write-Host "Starting frontend on http://localhost:5173 ..."
npm run dev
