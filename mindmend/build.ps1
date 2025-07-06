# Build script for MindMend project
# This script handles permission issues and provides better error reporting
# Save this file with UTF-8 encoding (without BOM) for best compatibility

Write-Host '🧹 Cleaning previous build artifacts...' -ForegroundColor Yellow
if (Test-Path '.next') {
    Remove-Item -Recurse -Force '.next' -ErrorAction SilentlyContinue
}

Write-Host '📦 Installing dependencies...' -ForegroundColor Yellow
npm install

Write-Host '🔍 Running TypeScript check...' -ForegroundColor Yellow
npx tsc --noEmit

Write-Host '🔨 Building project...' -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host '✅ Build completed successfully!' -ForegroundColor Green
} else {
    Write-Host 'Build failed with exit code: $LASTEXITCODE'
    Write-Host 'Check the error messages above for details.'
} 