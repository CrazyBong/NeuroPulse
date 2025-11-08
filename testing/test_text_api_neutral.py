import requests
import json

# Test the text analysis endpoint with neutral text
url = "http://127.0.0.1:8000/api/text"

# Sample neutral text for testing
data = {
    "text": "The weather is okay today. I am going to the store to buy some groceries."
}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")