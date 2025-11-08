import requests
import json
import os
from dotenv import load_dotenv

print("🔍 Testing Full LLM Flow")
print("=" * 50)

# Load environment variables
load_dotenv('backend/gateway/.env')

# Check if API key is set
api_key = os.getenv('OPENAI_API_KEY')
if api_key and api_key != 'your_openai_api_key_here':
    print("✅ Real OpenAI API key detected")
else:
    print("⚠️  Using placeholder API key - will use fallback responses")

# Test the fusion endpoint with realistic data
url = "http://127.0.0.1:8000/api/fusion"

# Test data with high stress (sad text)
data = {
    "text_result": {
        "success": True,
        "predictions": [
            {"label": "sadness", "score": 0.71},
            {"label": "fear", "score": 0.22},
            {"label": "anger", "score": 0.05},
            {"label": "disgust", "score": 0.03},
            {"label": "neutral", "score": 0.01}
        ],
        "top_emotion": "sadness",
        "confidence": 0.71
    }
}

print("\n📤 Sending request to fusion endpoint...")
print(f"   Input stress level: 100%")
print(f"   Text analysis: {data['text_result']['top_emotion']} ({data['text_result']['confidence']:.2f})")

try:
    response = requests.post(url, json=data, timeout=30)
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"   Combined emotion: {result.get('combined_emotion')}")
        print(f"   Calculated stress: {result.get('stress', 0) * 100:.0f}%")
        print(f"   LLM summary present: {bool(result.get('llm_summary'))}")
        
        if result.get('llm_summary'):
            summary = result['llm_summary']
            print(f"   Summary length: {len(summary)} characters")
            print(f"   Summary preview: {summary[:100]}..." if len(summary) > 100 else summary)
            
            # Check if it's the fallback message
            if "We've analyzed your emotions" in summary:
                print("   📝 Using fallback message (expected with placeholder API key)")
            else:
                print("   🤖 Real LLM response received!")
        else:
            print("   ❌ No LLM summary in response")
    else:
        print(f"   ❌ Error: {response.text}")
        
except Exception as e:
    print(f"   ❌ Request failed: {e}")

print("\n" + "=" * 50)
print("✅ Full LLM Flow Test Complete")