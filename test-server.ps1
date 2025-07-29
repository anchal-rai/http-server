Write-Host "🚀 Testing Custom HTTP Server on http://localhost:4221" -ForegroundColor Cyan

# Function to test and show result
function Test-Request {
    param (
        [string]$description,
        [string]$command,
        [string]$expected
    )

    Write-Host "`n🧪 $description" -ForegroundColor Yellow
    try {
        $output = Invoke-Expression $command
        Write-Host "$output"
        if ($expected -and $output -like "*$expected*") {
            Write-Host "✅ Passed" -ForegroundColor Green
        }
        elseif ($expected) {
            Write-Host "❌ Failed (Expected to contain: '$expected')" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running command: $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds 1
}

# 1. Root path
Test-Request "GET /" 'curl.exe -s http://localhost:4221/' "200 OK"

# 2. Echo string
Test-Request "GET /echo/hello" 'curl.exe -s http://localhost:4221/echo/hello' "hello"

# 3. GZIP Echo
Test-Request "GET /echo/hello with gzip (check file)" 'curl.exe -s -H "Accept-Encoding: gzip" http://localhost:4221/echo/hello --output hello.gz' ""
if (Test-Path "hello.gz") {
    Write-Host "✅ GZIP file 'hello.gz' created" -ForegroundColor Green
} else {
    Write-Host "❌ GZIP file not created" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# 4. User-Agent
Test-Request "GET /user-agent" 'curl.exe -s http://localhost:4221/user-agent' "curl"

# 5. POST file
Test-Request "POST /files/test.txt" 'curl.exe -s -X POST http://localhost:4221/files/test.txt --data "This is sample content."' "201 Created"

# 6. GET file
Test-Request "GET /files/test.txt" 'curl.exe -s http://localhost:4221/files/test.txt' "This is sample content."

Write-Host "`n✅ All tests finished. Check output above." -ForegroundColor Cyan
