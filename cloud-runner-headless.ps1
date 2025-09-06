# PowerShell script for Cloud-Runner running playwright tests in sharded containers, running in parallel.
# This will execute 4 docker containers that each run a shard of your test suite in parallel as seen in the docker-compose.yml file. 
# Run this by executing npm run cloud-runner
# After your tests run, the report will be merged from the containerized blob reports into a single HTML report on the host.

Write-Host "Launching 4 shards for Playwright tests using Docker Compose"

docker-compose down

Remove-Item -Path "./blob-report", "./playwright-report" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -Path "./blob-report" -ItemType Directory -Force

$PROJECT_NAME = (Get-Item -Path ".").Name

Write-Host "Using project name: $PROJECT_NAME"

docker-compose --profile headless up -d

Write-Host "All 4 shards launched. Logs Incoming..."

$logsJob = Start-Job { docker-compose --profile=headless logs -f }
$logJobRunning = $true

Start-Job -ScriptBlock {
    param($jobId)
    while ($true) {
        Receive-Job -Id $jobId
        Start-Sleep -Seconds 1
    }
} -ArgumentList $logsJob.Id | Out-Null

docker wait "${PROJECT_NAME}-pw_shard_1-1" "${PROJECT_NAME}-pw_shard_2-1" "${PROJECT_NAME}-pw_shard_3-1" "${PROJECT_NAME}-pw_shard_4-1"

Write-Host "All shards completed! Generating combined report..."

Write-Host "Found the following reports to merge:"
Get-ChildItem -Path "./blob-report" -Force

npx playwright merge-reports --reporter html ./blob-report

Write-Host "Report generated to ./playwright-report/index.html"
Stop-Job -Job $logsJob
Remove-Job -Job $logsJob

docker-compose down
