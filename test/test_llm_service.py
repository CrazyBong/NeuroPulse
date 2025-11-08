import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'gateway'))

# Test the LLM service
try:
    # Add services directory to path
    services_path = os.path.join(os.path.dirname(__file__), 'backend', 'gateway', 'services')
    sys.path.append(services_path)
    
    from llm_service import generate_emotion_summary
    
    # Test data
    test_predictions = {
        "text": {
            "success": True,
            "predictions": [
                {"label": "sadness", "score": 0.71},
                {"label": "fear", "score": 0.22},
                {"label": "neutral", "score": 0.07}
            ],
            "top_emotion": "sadness",
            "confidence": 0.71
        },
        "face": {
            "success": True,
            "predictions": [
                {"label": "sadness", "score": 0.65},
                {"label": "anger", "score": 0.25},
                {"label": "neutral", "score": 0.10}
            ],
            "top_emotion": "sadness",
            "confidence": 0.65
        },
        "audio": None,
        "stress": 0.93
    }
    
    print("Testing LLM service with sample data...")
    print("Input data:")
    print(f"  Stress Level: {test_predictions['stress'] * 100:.0f}%")
    print(f"  Text Analysis: {test_predictions['text']}")
    print(f"  Face Analysis: {test_predictions['face']}")
    
    # Generate summary (this will fail if OPENAI_API_KEY is not set)
    try:
        summary = generate_emotion_summary(test_predictions)
        print("\nLLM Summary:")
        print(summary)
    except Exception as e:
        print(f"\nError generating summary (likely due to missing API key): {e}")
        print("This is expected if OPENAI_API_KEY is not set in the .env file.")
    
except ImportError as e:
    print(f"Error importing LLM service: {e}")
    print("Make sure the backend/gateway/services directory exists and contains llm_service.py")