#!/bin/bash
echo "Cleaning old containers..."

docker-compose --profile=headed down 

echo "Launching Headed Container for Playwright tests"

# Clean up previous reports
rm -rf ./blob-report ./playwright-report
mkdir -p ./blob-report
chmod -R 777 ./blob-report

PROJECT_NAME=$(basename $(pwd))

docker-compose --profile=headed up -d

echo "Container launched. Logs incoming..."

docker-compose --profile=headed logs -f &
LOGS_PID=$!

docker wait "${PROJECT_NAME}-pw_headed-1"

kill $LOGS_PID 2>/dev/null

echo "Tests completed! Generating report..."

echo "Found the following reports to merge:"
ls -la ./blob-report/

# Merge blob reports into an HTML report
npx playwright merge-reports --reporter html ./blob-report


