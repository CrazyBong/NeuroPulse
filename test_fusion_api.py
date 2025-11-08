import requests
import json

# Test the fusion endpoint
url = "http://127.0.0.1:8000/api/fusion"

# Sample data for testing
data = {
    "text_result": {
        "success": True,
        "predictions": [
            {"label": "happy", "score": 0.8},
            {"label": "neutral", "score": 0.2}
        ],
        "top_emotion": "happy",
        "confidence": 0.8
    },
    "face_result": {
        "success": True,
        "predictions": [
            {"label": "sad", "score": 0.6},
            {"label": "neutral", "score": 0.4}
        ],
        "top_emotion": "sad",
        "confidence": 0.6
    }
}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")