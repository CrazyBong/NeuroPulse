import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'gateway'))

# Test the updated LLM service
try:
    # Add services directory to path
    services_path = os.path.join(os.path.dirname(__file__), 'backend', 'gateway', 'services')
    sys.path.append(services_path)
    
    from llm_service import generate_emotion_summary
    
    # Test data with high stress
    test_predictions = {
        "text": {
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
        },
        "face": None,
        "audio": None,
        "stress": 1.0
    }
    
    print("Testing UPDATED LLM service with high stress data...")
    print("Input data:")
    print(f"  Stress Level: {test_predictions['stress'] * 100:.0f}%")
    print(f"  Text Analysis: {test_predictions['text']}")
    
    # Generate summary (this will use fallback since no API key)
    summary = generate_emotion_summary(test_predictions)
    print("\nLLM Summary (fallback):")
    print(summary)
    
    print("\n" + "="*50)
    
    # Test with low stress
    test_predictions_low = {
        "text": {
            "success": True,
            "predictions": [
                {"label": "joy", "score": 0.85},
                {"label": "neutral", "score": 0.15}
            ],
            "top_emotion": "joy",
            "confidence": 0.85
        },
        "face": None,
        "audio": None,
        "stress": 0.0
    }
    
    print("Testing UPDATED LLM service with low stress data...")
    print("Input data:")
    print(f"  Stress Level: {test_predictions_low['stress'] * 100:.0f}%")
    print(f"  Text Analysis: {test_predictions_low['text']}")
    
    # Generate summary (this will use fallback since no API key)
    summary_low = generate_emotion_summary(test_predictions_low)
    print("\nLLM Summary (fallback):")
    print(summary_low)
    
except ImportError as e:
    print(f"Error importing LLM service: {e}")
    print("Make sure the backend/gateway/services directory exists and contains llm_service.py")
except Exception as e:
    print(f"Error: {e}")