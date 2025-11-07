"""
Check Services Status - Run this after starting all backend services
"""

import requests
import json

def check_service_health(port, service_name):
    """Check health of a service"""
    try:
        response = requests.get(f"http://127.0.0.1:{port}/api/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return {"status": "error", "message": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def main():
    print("🔍 NeuroPulse Backend Services Status Check")
    print("=" * 50)
    
    services = [
        {"port": 5000, "name": "Audio Emotion Analysis"},
        {"port": 5001, "name": "Text Emotion Analysis"},
        {"port": 5002, "name": "Face Emotion Analysis"}
    ]
    
    running_count = 0
    
    for service in services:
        port = service["port"]
        name = service["name"]
        
        print(f"Checking {name} (Port {port})...")
        health = check_service_health(port, name)
        
        if health.get("status") == "healthy":
            print(f"  ✅ Status: Healthy")
            print(f"  🧠 Model: {health.get('model', 'N/A')}")
            emotions = health.get('emotions', [])
            print(f"  😊 Emotions: {len(emotions)} available")
            running_count += 1
        else:
            print(f"  ❌ Status: {health.get('message', 'Unknown error')}")
        
        print()
    
    print("=" * 50)
    print(f"Summary: {running_count}/3 services running")
    
    if running_count == 3:
        print("🎉 All services are ready!")
        print("You can now test with Postman or run the frontend.")
    elif running_count > 0:
        print("⚠️  Some services are running.")
    else:
        print("❌ No services are running.")
        print("Please check the service terminal windows for errors.")
    
    print("=" * 50)

if __name__ == "__main__":
    main()