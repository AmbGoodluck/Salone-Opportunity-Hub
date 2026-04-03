# Auto-scraper loop — runs every 15 minutes until terminal is closed
# Run with: .\scrape-loop.ps1

$ApiUrl = "http://localhost:3001/api/scrape"
$Headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer 7bcda469efcfb6dde7830db5796f5a10"
}

Write-Host "🚀 Auto-scraper started. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "API: $ApiUrl"
Write-Host ""

$iteration = 1

while ($true) {
    $time = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$time] Iteration $iteration — Calling scrape API..." -ForegroundColor Cyan

    try {
        $response = Invoke-WebRequest -Uri $ApiUrl -Method POST -Headers $Headers -Body "{}"
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Inserted: $($data.totalInserted)  Skipped: $($data.totalSkipped)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    $next = (Get-Date).AddSeconds(900).ToString("HH:mm:ss")
    Write-Host "⏳ Next run at $next (15 min)..."
    Write-Host ""

    $iteration++
    Start-Sleep -Seconds 900
}
