# Supabase migration push for project bhdykiqnczktmntxgbbl
# Usage:
#   $env:SUPABASE_DB_PASSWORD = "your-database-password"
#   .\scripts\supabase-migrate.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SupabaseExe = Join-Path $ProjectRoot ".supabase-cli\supabase.exe"
$ProjectRef = "bhdykiqnczktmntxgbbl"

if (-not (Test-Path $SupabaseExe)) {
    Write-Error "Supabase CLI not found at $SupabaseExe"
}

if (-not $env:SUPABASE_DB_PASSWORD) {
    Write-Host ""
    Write-Host "ERROR: Database password required." -ForegroundColor Red
    Write-Host "Get it from: Supabase Dashboard -> Project Settings -> Database -> Database password"
    Write-Host ""
    Write-Host "Then run:"
    Write-Host '  $env:SUPABASE_DB_PASSWORD = "YOUR_PASSWORD"'
    Write-Host "  .\scripts\supabase-migrate.ps1"
    exit 1
}

Set-Location $ProjectRoot

$DbUrl = "postgresql://postgres:$($env:SUPABASE_DB_PASSWORD)@db.$ProjectRef.supabase.co:5432/postgres"

Write-Host "Pushing migrations to Supabase project $ProjectRef..." -ForegroundColor Cyan
& $SupabaseExe db push --db-url $DbUrl --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: All migrations applied!" -ForegroundColor Green
    Write-Host "Next: create admin at https://raohamza-seven.vercel.app/auth"
} else {
    Write-Host ""
    Write-Host "Migration failed. Check password or run SQL manually from supabase/setup-new-project.sql" -ForegroundColor Red
    exit $LASTEXITCODE
}
