#!/bin/bash
# cURL Examples for Testing the Generate Edge Function
# Make this file executable: chmod +x test-examples.sh

# Configuration - REPLACE THESE VALUES
SUPABASE_URL="https://your-project.supabase.co"
JWT_TOKEN="your-jwt-token-here"

# Test 1: Basic request with all parameters
echo "Test 1: Basic request with all parameters"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "peaceful ambient forest sounds with birds",
    "duration": 10,
    "quality": "medium",
    "mode": "ambient"
  }'

echo -e "\n\n"

# Test 2: Minimal request (only prompt required)
echo "Test 2: Minimal request (only prompt required)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "techno beat"
  }'

echo -e "\n\n"

# Test 3: Maximum duration
echo "Test 3: Maximum duration (60 seconds)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "epic orchestral music",
    "duration": 60,
    "quality": "high"
  }'

echo -e "\n\n"

# Test 4: Error - Missing prompt
echo "Test 4: Error - Missing prompt (should return 400)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "duration": 10
  }'

echo -e "\n\n"

# Test 5: Error - Invalid duration
echo "Test 5: Error - Invalid duration (should return 400)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "test",
    "duration": 100
  }'

echo -e "\n\n"

# Test 6: Error - Invalid quality
echo "Test 6: Error - Invalid quality (should return 400)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header "Authorization: Bearer ${JWT_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "test",
    "quality": "ultra"
  }'

echo -e "\n\n"

# Test 7: Error - No authentication
echo "Test 7: Error - No authentication (should return 401)"
curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "test"
  }'

echo -e "\n\n"

# Test 8: CORS preflight request
echo "Test 8: CORS preflight request"
curl -i --location --request OPTIONS \
  "${SUPABASE_URL}/functions/v1/generate" \
  --header 'Access-Control-Request-Method: POST' \
  --header 'Access-Control-Request-Headers: authorization, content-type'

echo -e "\n\nAll tests completed!"
