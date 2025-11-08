import requests
import json

data = {
    "stressScore": 1.0,
    "primaryEmotion": "sadness",
    "emotionBreakdown": [{"label": "sadness", "score": 0.71}],
    "hasTextAnalysis": True,
    "hasFaceAnalysis": False
}

response = requests.post('http://127.0.0.1:8000/api/generate-tips', json=data)
print(f'Status: {response.status_code}')
if response.status_code == 200:
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Error: {response.text}")