# On-demand opportunity scraper for Salone Opportunity Hub
# Run this anytime to fetch and store new opportunities

param(
    [string]$ApiUrl = "http://localhost:3001/api/scrape"
)

Write-Host "🔄 Calling scrape API: $ApiUrl" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $ApiUrl `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body "{}" `
        -ErrorAction Stop

    $statusCode = $response.StatusCode
    $body = $response.Content

    if ($statusCode -eq 200) {
        Write-Host "✅ Success (HTTP $statusCode)" -ForegroundColor Green
        Write-Host "Response:"

        # Try to parse and display inserted count
        if ($body -match '"inserted"\s*:\s*(\d+)') {
            Write-Host "   Inserted: $($matches[1]) opportunities" -ForegroundColor Green
        } else {
            Write-Host $body
        }
    } else {
        Write-Host "❌ Failed (HTTP $statusCode)" -ForegroundColor Red
        Write-Host "Response: $($body.Substring(0, [Math]::Min(200, $body.Length)))"
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
