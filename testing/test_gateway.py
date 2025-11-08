import requests
import json

# Test data
test_data = {
    "stressScore": 0.5,
    "primaryEmotion": "sadness",
    "emotionBreakdown": [
        {"label": "sadness", "score": 0.9}
    ],
    "hasTextAnalysis": True,
    "hasFaceAnalysis": False
}

# Make the request
response = requests.post(
    "http://127.0.0.1:8000/api/generate-tips",
    headers={"Content-Type": "application/json"},
    json=test_data
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")