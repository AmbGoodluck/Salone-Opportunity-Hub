#!/bin/bash

# Scrape opportunities every 15 minutes for 5 hours (20 iterations)
# This increases the database with fresh opportunities from Adzuna and other sources

API_URL="${1:-http://localhost:3000/api/scrape}"
ITERATIONS=20
INTERVAL=900  # 15 minutes in seconds

echo "🔄 Starting opportunity scraping loop"
echo "API URL: $API_URL"
echo "Interval: 15 minutes"
echo "Total duration: 5 hours (20 iterations)"
echo ""

for i in $(seq 1 $ITERATIONS); do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iteration $i/20 - Calling scrape API..."

  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{}')

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" == "200" ]; then
    # Extract count from response
    count=$(echo "$body" | grep -o '"inserted"[^,]*' | head -1 || echo "unknown")
    echo "✅ Success (HTTP $http_code) - $count"
  else
    echo "❌ Failed (HTTP $http_code)"
    echo "Response: $body" | head -n 3
  fi

  echo ""

  # Wait 15 minutes before next call (except on last iteration)
  if [ $i -lt $ITERATIONS ]; then
    echo "⏳ Waiting 15 minutes until $(date -d '+15 minutes' '+%H:%M:%S')..."
    sleep $INTERVAL
  fi
done

echo "✨ Scraping loop completed! All $ITERATIONS iterations finished."
