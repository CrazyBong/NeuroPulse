"""
Verify Backend Responses
Test script to verify all backend services return consistent JSON responses
"""

import requests
import json

def test_endpoint(url, method='GET', data=None):
    """Test a backend endpoint"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            if data:
                response = requests.post(url, json=data, timeout=10)
            else:
                response = requests.post(url, timeout=10)
        else:
            return None
            
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'error': f'HTTP {response.status_code}',
                'status_code': response.status_code
            }
    except Exception as e:
        return {'error': str(e)}

def main():
    print("🔍 Verifying Backend Response Formats")
    print("=" * 50)
    
    # Test Text Service (Port 5001)
    print("📝 Text Emotion Service (Port 5001)")
    text_base = "http://127.0.0.1:5001/api"
    
    # Health check
    print("  Health Check:")
    health = test_endpoint(f"{text_base}/health")
    if health and isinstance(health, dict):
        print(f"    Status: {health.get('status', 'N/A')}")
        print(f"    Model: {health.get('model', 'N/A')}")
    else:
        print(f"    Error: {health}")
    
    # Emotions
    print("  Emotions:")
    emotions = test_endpoint(f"{text_base}/emotions")
    if emotions and isinstance(emotions, dict) and 'emotions' in emotions:
        print(f"    Count: {len(emotions['emotions'])}")
        print(f"    Emotions: {', '.join(emotions['emotions'][:3])}...")
    else:
        print(f"    Error: {emotions}")
    
    # Analyze text
    print("  Text Analysis:")
    text_result = test_endpoint(
        f"{text_base}/analyze-text", 
        'POST', 
        {'text': 'I am feeling really happy today!'}
    )
    if text_result and isinstance(text_result, dict):
        if 'success' in text_result:
            print(f"    Success: {text_result['success']}")
            if text_result['success']:
                print(f"    Top Emotion: {text_result['top_emotion']}")
                print(f"    Confidence: {text_result['confidence']:.2f}")
        else:
            print(f"    Error: {text_result}")
    else:
        print(f"    Error: {text_result}")
    
    print()
    
    # Test Face Service (Port 5002)
    print("📷 Face Emotion Service (Port 5002)")
    face_base = "http://127.0.0.1:5002/api"
    
    # Health check
    print("  Health Check:")
    health = test_endpoint(f"{face_base}/health")
    if health and isinstance(health, dict):
        print(f"    Status: {health.get('status', 'N/A')}")
        print(f"    Model: {health.get('model', 'N/A')}")
    else:
        print(f"    Error: {health}")
    
    # Emotions
    print("  Emotions:")
    emotions = test_endpoint(f"{face_base}/emotions")
    if emotions and isinstance(emotions, dict) and 'emotions' in emotions:
        print(f"    Count: {len(emotions['emotions'])}")
        print(f"    Emotions: {', '.join(emotions['emotions'][:3])}...")
    else:
        print(f"    Error: {emotions}")
    
    print()
    
    # Test Audio Service (Port 5000)
    print("🔊 Audio Emotion Service (Port 5000)")
    audio_base = "http://127.0.0.1:5000/api"
    
    # Health check
    print("  Health Check:")
    health = test_endpoint(f"{audio_base}/health")
    if health and isinstance(health, dict):
        print(f"    Status: {health.get('status', 'N/A')}")
        print(f"    Model: {health.get('model', 'N/A')}")
    else:
        print(f"    Error: {health}")
    
    # Emotions
    print("  Emotions:")
    emotions = test_endpoint(f"{audio_base}/emotions")
    if emotions and isinstance(emotions, dict) and 'emotions' in emotions:
        print(f"    Count: {len(emotions['emotions'])}")
        print(f"    Emotions: {', '.join(emotions['emotions'][:3])}...")
    else:
        print(f"    Error: {emotions}")
    
    print()
    print("=" * 50)
    print("✅ Backend Response Verification Complete")

if __name__ == "__main__":
    main()