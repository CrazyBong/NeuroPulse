import requests
import json

# Test the mental health tips endpoint
url = "http://127.0.0.1:8000/api/generate-tips"

# Test data with high stress
data = {
    "stressScore": 1.0,
    "primaryEmotion": "sadness",
    "emotionBreakdown": [
        {"label": "sadness", "score": 0.71},
        {"label": "fear", "score": 0.22},
        {"label": "anger", "score": 0.05},
        {"label": "disgust", "score": 0.03},
        {"label": "neutral", "score": 0.01}
    ],
    "hasTextAnalysis": True,
    "hasFaceAnalysis": False,
    "textStress": 1.0,
    "faceStress": 0
}

print("Sending request to mental health tips endpoint...")
print("Input data:")
print(json.dumps(data, indent=2))

try:
    response = requests.post(url, json=data, timeout=30)
    print(f"\nStatus Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("Response:")
        print(json.dumps(result, indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")