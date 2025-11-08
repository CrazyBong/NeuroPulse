import requests

# Test CORS by sending a request with Origin header
url = "http://127.0.0.1:8000/api/generate-tips"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:3002"  # Frontend origin
}

data = {
    "stressScore": 0.8,
    "primaryEmotion": "sadness",
    "emotionBreakdown": [
        {"label": "sadness", "score": 0.8},
        {"label": "neutral", "score": 0.2}
    ],
    "hasTextAnalysis": True,
    "hasFaceAnalysis": False,
    "textStress": 0.8,
    "faceStress": 0
}

print("Testing CORS with Origin header...")
response = requests.post(url, json=data, headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Headers: {dict(response.headers)}")
if response.status_code == 200:
    print("Response:")
    print(response.json())
else:
    print(f"Error: {response.text}")