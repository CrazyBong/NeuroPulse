import requests

# Test the gateway face analysis endpoint
url = "http://127.0.0.1:8000/api/face"

# Open the test image file
with open("test-image.png", "rb") as f:
    files = {"file": ("test-image.png", f, "image/png")}
    response = requests.post(url, files=files)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")