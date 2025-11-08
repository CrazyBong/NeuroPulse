import requests
import json

# Test the fusion endpoint with sad text
url = "http://127.0.0.1:8000/api/fusion"

# Sample data with sad text
data = {
    "text_result": {
        "success": True,
        "predictions": [
            {"label": "sadness", "score": 0.71},
            {"label": "fear", "score": 0.22},
            {"label": "anger", "score": 0.05},
            {"label": "disgust", "score": 0.03},
            {"label": "neutral", "score": 0.01}
        ],
        "top_emotion": "sadness",
        "confidence": 0.71
    }
}

print("Sending request to fusion endpoint with sad text...")
print("Input data:")
print(json.dumps(data, indent=2))

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")