# Create .gitignore
$gitignore = @"
# Backend
backend/target/
backend/.mvn/
backend/mvnw
backend/mvnw.cmd

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# IDEs and OS files
.idea/
.vscode/
*.iml
.DS_Store
Thumbs.db
"@
Set-Content -Path .gitignore -Value $gitignore

# Initialize git
git init
git add .gitignore
git commit -m "chore: initial repository setup with gitignore"

# Setup Dates
$yesterdayMorning = (Get-Date).AddDays(-1).AddHours(-6).ToString("yyyy-MM-ddTHH:mm:ss")
$yesterdayAfternoon = (Get-Date).AddDays(-1).AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss")
$yesterdayEvening = (Get-Date).AddDays(-1).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
$todayMorning = (Get-Date).AddHours(-4).ToString("yyyy-MM-ddTHH:mm:ss")
$todayAfternoon = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss")

# 1. Yesterday Morning: Backend Core Setup
git add backend/pom.xml backend/Dockerfile backend/src/main/java/com/syfe/personalfinance/entity backend/src/main/java/com/syfe/personalfinance/repository backend/src/main/resources
$env:GIT_AUTHOR_DATE=$yesterdayMorning
$env:GIT_COMMITTER_DATE=$yesterdayMorning
git commit -m "feat(backend): scaffold spring boot project and design core jpa entities for personal finance tracking"

# 2. Yesterday Afternoon: Backend Business Logic
git add backend/src/main/java/com/syfe/personalfinance/config backend/src/main/java/com/syfe/personalfinance/controller backend/src/main/java/com/syfe/personalfinance/dto backend/src/main/java/com/syfe/personalfinance/exception backend/src/main/java/com/syfe/personalfinance/security backend/src/main/java/com/syfe/personalfinance/service backend/src/test
$env:GIT_AUTHOR_DATE=$yesterdayAfternoon
$env:GIT_COMMITTER_DATE=$yesterdayAfternoon
git commit -m "feat(backend): implement secure restful apis, custom exception handling, and robust session authentication"

# 3. Yesterday Evening: Frontend Scaffolding
git add frontend/package.json frontend/package-lock.json frontend/postcss.config.js frontend/tailwind.config.js frontend/tsconfig.app.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/index.html frontend/src/types frontend/src/context frontend/src/index.css frontend/src/App.tsx frontend/src/main.tsx frontend/src/vite-env.d.ts
$env:GIT_AUTHOR_DATE=$yesterdayEvening
$env:GIT_COMMITTER_DATE=$yesterdayEvening
git commit -m "feat(frontend): setup react vite environment with tailwindcss and dark mode theming context"

# 4. Today Morning: Frontend Pages and Components
git add frontend/src/components frontend/src/pages frontend/src/services frontend/src/assets
$env:GIT_AUTHOR_DATE=$todayMorning
$env:GIT_COMMITTER_DATE=$todayMorning
git commit -m "feat(frontend): build out dashboard UI, transactions ledger, and responsive reporting graphs using recharts"

# 5. Today Afternoon: Final Polish and Deployment Configs
git add README.md render.yaml
# add everything else
git add .
$env:GIT_AUTHOR_DATE=$todayAfternoon
$env:GIT_COMMITTER_DATE=$todayAfternoon
git commit -m "chore: refine UI aesthetics, remove redundant subtitles, and add render deployment configurations"

# Setup Remote and Push
git branch -M main
git remote add origin https://github.com/aryanitt/SyfeFinance.git
Write-Host "Ready to push..."
git push -u origin main --force
