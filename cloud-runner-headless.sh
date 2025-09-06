#!/bin/bash

echo "Launching 4 shards for Playwright tests using Docker Compose"

# Clean up any pre-existing containers
docker-compose --profile=headless down

# Clean up previous reports
rm -rf ./blob-report ./playwright-report
mkdir -p ./blob-report
chmod -R 777 ./blob-report

PROJECT_NAME=$(basename $(pwd))

# Launch all containers in parallel
docker-compose --profile headless up -d

echo "All 4 shards launched. Logs incoming..."

docker-compose --profile=headless logs -f &
LOGS_PID=$!

docker wait "${PROJECT_NAME}-pw_shard_1-1" "${PROJECT_NAME}-pw_shard_2-1" "${PROJECT_NAME}-pw_shard_3-1" "${PROJECT_NAME}-pw_shard_4-1"

echo "All shards completed! Generating combined report..."

echo "Found the following reports to merge:"
ls -la ./blob-report/

npx playwright merge-reports --reporter html ./blob-report

docker-compose down
