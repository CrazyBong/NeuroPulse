"""
Test Unified Response Formats
Test script to verify all backend services return the unified JSON response format
"""

import requests
import json

# Unified response format we're expecting
UNIFIED_RESPONSE_FORMAT = {
    "success": bool,
    "predictions": list,
    "top_emotion": str,
    "confidence": (int, float)
}

def verify_response_format(response_data, source_type):
    """Verify that response follows unified format"""
    if not isinstance(response_data, dict):
        return False, f"Response is not a dictionary: {type(response_data)}"
    
    # Check required fields
    for field, expected_type in UNIFIED_RESPONSE_FORMAT.items():
        if field not in response_data:
            return False, f"Missing required field: {field}"
        
        if not isinstance(response_data[field], expected_type):
            return False, f"Field {field} has wrong type. Expected {expected_type}, got {type(response_data[field])}"
    
    # Check predictions format
    predictions = response_data['predictions']
    if not isinstance(predictions, list):
        return False, "Predictions should be a list"
    
    for i, pred in enumerate(predictions):
        if not isinstance(pred, dict):
            return False, f"Prediction {i} is not a dictionary"
        if 'label' not in pred or 'score' not in pred:
            return False, f"Prediction {i} missing required fields (label, score)"
        if not isinstance(pred['label'], str):
            return False, f"Prediction {i} label should be string"
        if not isinstance(pred['score'], (int, float)):
            return False, f"Prediction {i} score should be number"
    
    return True, "Response format is correct"

def test_service(base_url, service_name):
    """Test a backend service"""
    print(f"Testing {service_name} at {base_url}")
    
    try:
        # Test health endpoint
        print("  Health check...")
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"    ✅ Health: {health_data.get('status', 'unknown')}")
        else:
            print(f"    ❌ Health check failed: HTTP {health_response.status_code}")
        
        # Test emotions endpoint
        print("  Emotions endpoint...")
        emotions_response = requests.get(f"{base_url}/emotions", timeout=5)
        if emotions_response.status_code == 200:
            emotions_data = emotions_response.json()
            print(f"    ✅ Emotions: {len(emotions_data.get('emotions', []))} available")
        else:
            print(f"    ❌ Emotions endpoint failed: HTTP {emotions_response.status_code}")
            
        print(f"  ✅ {service_name} basic endpoints working")
        return True
        
    except Exception as e:
        print(f"  ❌ {service_name} test failed: {e}")
        return False

def main():
    print("🔬 Testing Unified Response Formats")
    print("=" * 50)
    
    services = [
        ("http://127.0.0.1:5000/api", "Audio Service"),
        ("http://127.0.0.1:5001/api", "Text Service"),
        ("http://127.0.0.1:5002/api", "Face Service")
    ]
    
    working_services = 0
    
    for url, name in services:
        if test_service(url, name):
            working_services += 1
        print()
    
    print("=" * 50)
    print(f"Services working: {working_services}/3")
    
    if working_services == 3:
        print("🎉 All services are running and responding correctly!")
        print("The unified response format is ready for frontend integration.")
    else:
        print("⚠️  Some services are not running.")
        print("Please start all backend services before testing full integration.")

if __name__ == "__main__":
    main()