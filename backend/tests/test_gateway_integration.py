"""
Test script to verify gateway integration with all microservices
"""

import requests
import json

def test_gateway_health():
    """Test gateway health endpoint"""
    print("Testing Gateway Health...")
    try:
        response = requests.get("http://127.0.0.1:8000/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Gateway Health: {data}")
            return True
        else:
            print(f"❌ Gateway Health Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Gateway Health Error: {e}")
        return False

def test_text_service():
    """Test text emotion service through gateway"""
    print("\nTesting Text Service...")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/text",
            json={"text": "I am feeling happy today!"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Text Service: {data}")
            return True
        else:
            print(f"❌ Text Service Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Text Service Error: {e}")
        return False

def test_audio_service():
    """Test audio emotion service through gateway"""
    print("\nTesting Audio Service...")
    try:
        # Create a simple test WAV file content
        test_audio = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
        
        files = {'file': ('test.wav', test_audio, 'audio/wav')}
        response = requests.post(
            "http://127.0.0.1:8000/api/audio",
            files=files
        )
        print(f"Audio Service Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Audio Service: {data}")
            return True
        else:
            print(f"❌ Audio Service Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Audio Service Error: {e}")
        return False

def test_face_service():
    """Test face emotion service through gateway"""
    print("\nTesting Face Service...")
    try:
        # Create a simple test image content
        test_image = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"
        
        files = {'file': ('test.png', test_image, 'image/png')}
        response = requests.post(
            "http://127.0.0.1:8000/api/face",
            files=files
        )
        print(f"Face Service Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Face Service: {data}")
            return True
        else:
            print(f"❌ Face Service Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Face Service Error: {e}")
        return False

def main():
    print("🔍 NeuroPulse Gateway Integration Test")
    print("=" * 50)
    
    # Test all services
    tests = [
        test_gateway_health,
        test_text_service,
        test_audio_service,
        test_face_service
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 50)
    print(f"Summary: {sum(results)}/{len(results)} tests passed")
    
    if all(results):
        print("🎉 All services are working correctly through the gateway!")
    else:
        print("⚠️  Some services need attention.")
    
    print("=" * 50)

if __name__ == "__main__":
    main()