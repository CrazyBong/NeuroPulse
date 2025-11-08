# Test to simulate how face stress is calculated and displayed

# Simulate actual face analysis result from backend
face_analysis_result = {
    "type": "face",
    "filename": "test.jpg",
    "result": {
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
    }
}

# Extract the actual predictions data
face_predictions = face_analysis_result["result"]["data"]["predictions"]
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

# Check if this would appear as "low" in the UI
if face_stress < 0.3:
    print("✅ This would correctly show as 'Low' stress in the UI")
else:
    print("❌ This would not show as 'Low' stress in the UI")

# Test with high stress face result
high_stress_face_result = {
    "type": "face", 
    "filename": "test2.jpg",
    "result": {
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
    }
}

high_face_predictions = high_stress_face_result["result"]["data"]["predictions"]
high_face_stress = 0

for pred in high_face_predictions:
    label = pred["label"].lower()
    if label in negative_emotions:
        high_face_stress += pred["score"]

high_face_stress = min(1, max(0, high_face_stress))
print(f"\nHigh stress face result:")
print(f"Calculated face stress: {high_face_stress:.2f} ({high_face_stress * 100:.0f}%)")

if high_face_stress < 0.3:
    print("✅ This would show as 'Low' stress in the UI")
else:
    print("❌ This would not show as 'Low' stress in the UI")