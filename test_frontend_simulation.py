import requests
import json

# Simulate what the frontend is doing
url = "http://127.0.0.1:8000/api/face"

# Open the test image file
with open("test-image.png", "rb") as f:
    files = {"file": ("face.jpg", f, "image/jpeg")}
    response = requests.post(url, files=files)

print(f"Status Code: {response.status_code}")
print(f"Headers: {response.headers}")
try:
    result = response.json()
    print(f"Response JSON: {json.dumps(result, indent=2)}")
    
    # Simulate frontend response handling
    if 'result' in result and result['result']:
        if 'status' in result['result'] and result['result']['status'] == 'success':
            print(f"Frontend would return: {result['result']['data']}")
        elif 'status' in result['result'] and result['result']['status'] == 'error':
            print(f"Frontend would throw error: {result['result']['error']}")
        else:
            print(f"Frontend would return: {result['result']}")
    else:
        print(f"Frontend would return: {result}")
except Exception as e:
    print(f"Error parsing JSON: {e}")
    print(f"Response text: {response.text}")