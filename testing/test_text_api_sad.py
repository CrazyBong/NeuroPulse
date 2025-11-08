import requests
import json

# Test the text analysis endpoint with sad text
url = "http://127.0.0.1:8000/api/text"

# Sample sad text for testing
data = {
    "text": "I feel so sad and lonely today. Nothing seems to go right."
}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")