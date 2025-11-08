import json

# Initialize variables
face_stress_high = 0

# Simulate actual fusion response from gateway with face analysis
fusion_response = {
    "success": True,
    "combined_emotion": "happy",
    "confidence": 0.95,
    "predictions": {
        "happy": 0.76,
        "neutral": 0.24
    },
    "sources": {
        "text": None,
        "face": {
            "status": "success",
            "data": {
                "success": True,
                "predictions": [
                    {"label": "happy", "score": 0.95},
                    {"label": "neutral", "score": 0.05}
                ],
                "top_emotion": "happy",
                "confidence": 0.95
            }
        },
        "audio": None
    },
    "weights": {
        "text": 0.0,
        "face": 1.0,
        "audio": 0.0
    },
    "stress": 0.0,
    "llm_summary": "The analysis shows a predominantly happy emotional state with high confidence. The facial expression indicates positive emotions with minimal stress indicators."
}

# Extract face predictions for stress calculation
face_data = fusion_response["sources"]["face"]
if face_data and face_data.get("data", {}).get("success"):
    face_predictions = face_data["data"]["predictions"]
    print("Face analysis predictions:")
    for pred in face_predictions:
        print(f"  {pred['label']}: {pred['score']:.2f}")
    
    # Calculate face stress (same logic as in Dashboard.tsx)
    negative_emotions = ["sadness", "fear", "anger", "disgust"]
    face_stress = 0
    
    for pred in face_predictions:
        label = pred["label"].lower()
        if label in negative_emotions:
            face_stress += pred["score"]
    
    face_stress = min(1, max(0, face_stress))
    print(f"\nCalculated face stress: {face_stress:.2f} ({face_stress * 100:.0f}%)")
    
    # This should show as "Low" stress in the UI
    if face_stress < 0.3:
        print("✅ This correctly shows as 'Low' stress in the UI")
    else:
        print("❌ This would not show as 'Low' stress in the UI")
else:
    print("No valid face analysis data found")

# Test with high stress face analysis
high_stress_fusion_response = {
    "success": True,
    "combined_emotion": "sadness",
    "confidence": 0.85,
    "predictions": {
        "sadness": 0.68,
        "fear": 0.15,
        "neutral": 0.17
    },
    "sources": {
        "text": None,
        "face": {
            "status": "success",
            "data": {
                "success": True,
                "predictions": [
                    {"label": "sadness", "score": 0.8},
                    {"label": "fear", "score": 0.15},
                    {"label": "neutral", "score": 0.05}
                ],
                "top_emotion": "sadness",
                "confidence": 0.8
            }
        },
        "audio": None
    },
    "weights": {
        "text": 0.0,
        "face": 1.0,
        "audio": 0.0
    },
    "stress": 0.95,
    "llm_summary": "The analysis shows a predominantly sad emotional state with high confidence. The facial expression indicates strong negative emotions."
}

print("\n" + "="*50)
print("High stress test:")

face_data_high = high_stress_fusion_response["sources"]["face"]
if face_data_high and face_data_high.get("data", {}).get("success"):
    face_predictions_high = face_data_high["data"]["predictions"]
    print("Face analysis predictions:")
    for pred in face_predictions_high:
        print(f"  {pred['label']}: {pred['score']:.2f}")
    
    # Calculate face stress
    negative_emotions = ["sadness", "fear", "anger", "disgust"]  # Define here as well
    face_stress_high = 0
    for pred in face_predictions_high:
        label = pred["label"].lower()
        if label in negative_emotions:
            face_stress_high += pred["score"]
    
    face_stress_high = min(1, max(0, face_stress_high))
    print(f"\nCalculated face stress: {face_stress_high:.2f} ({face_stress_high * 100:.0f}%)")
    
    # This should show as "High" stress in the UI
    if face_stress_high >= 0.6:
        print("✅ This correctly shows as 'High' stress in the UI")
    elif face_stress_high >= 0.3:
        print("✅ This correctly shows as 'Moderate' stress in the UI")
    else:
        print("❌ This would show as 'Low' stress in the UI")
else:
    print("No valid face analysis data found")

# Check overall stress vs face stress
print(f"\nOverall stress: {high_stress_fusion_response['stress']:.2f}")
print(f"Face stress: {face_stress_high:.2f}")