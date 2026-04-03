#!/bin/bash

# On-demand opportunity scraper for Salone Opportunity Hub
# Run this anytime to fetch and store new opportunities

API_URL="${1:-http://localhost:3000/api/scrape}"

echo "🔄 Calling scrape API: $API_URL"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" == "200" ]; then
  echo "✅ Success (HTTP $http_code)"
  echo "Response:"
  echo "$body" | grep -o '"inserted"[^,]*' || echo "$body"
else
  echo "❌ Failed (HTTP $http_code)"
  echo "Response: $body" | head -n 5
fi
