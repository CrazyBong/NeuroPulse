import requests
import json
import time

print("Testing NeuroPulse API Gateway...")

# Test health endpoint
print("\n1. Testing health endpoint...")
try:
    health_response = requests.get("http://127.0.0.1:8000/api/health")
    print(f"Health check status: {health_response.status_code}")
    if health_response.status_code == 200:
        print("✅ Health check passed")
        print(json.dumps(health_response.json(), indent=2))
    else:
        print("❌ Health check failed")
except Exception as e:
    print(f"❌ Health check error: {e}")

# Test generate-tips endpoint
print("\n2. Testing generate-tips endpoint...")
test_data = {
    "stressScore": 0.7,
    "primaryEmotion": "sadness",
    "emotionBreakdown": [
        {"label": "sadness", "score": 0.7},
        {"label": "neutral", "score": 0.3}
    ],
    "hasTextAnalysis": True,
    "hasFaceAnalysis": False,
    "textStress": 0.7,
    "faceStress": 0
}

try:
    print("Sending request...")
    start_time = time.time()
    tips_response = requests.post(
        "http://127.0.0.1:8000/api/generate-tips",
        headers={"Content-Type": "application/json"},
        json=test_data
    )
    end_time = time.time()
    
    print(f"Response time: {end_time - start_time:.2f} seconds")
    print(f"Tips response status: {tips_response.status_code}")
    
    if tips_response.status_code == 200:
        print("✅ Tips generation successful")
        response_data = tips_response.json()
        print(f"Summary: {response_data.get('summary', 'N/A')}")
        print(f"Tips count: {len(response_data.get('tips', []))}")
        print(f"Resources count: {len(response_data.get('resources', []))}")
    else:
        print("❌ Tips generation failed")
        print(f"Error: {tips_response.text}")
        
except Exception as e:
    print(f"❌ Tips generation error: {e}")

print("\nTest completed.")