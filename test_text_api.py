import requests
import json

# Test the text analysis endpoint
url = "http://127.0.0.1:8000/api/text"

# Sample text for testing
data = {
    "text": "I am so happy today! This is the best day ever!"
}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")