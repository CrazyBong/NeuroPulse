import requests
import json

# Test the text analysis endpoint with empty text
url = "http://127.0.0.1:8000/api/text"

# Empty text for testing
data = {
    "text": ""
}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")