# Test to verify the exact data structure and stress calculation for face analysis

# Simulate the exact structure of data that comes from the gateway
fusion_result = {
    "success": True,
    "combined_emotion": "happy",
    "confidence": 0.95,
    "predictions": [
        {"label": "happy", "score": 0.76},
        {"label": "neutral", "score": 0.24}
    ],
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
    "stress": 0.0
}

# This is how safeData is constructed in Dashboard.tsx
safeData = {
    "success": fusion_result.get("success", False),
    "combined_emotion": fusion_result.get("combined_emotion", "neutral"),
    "confidence": fusion_result.get("confidence", 0),
    "predictions": fusion_result.get("predictions", []),
    "sources": {
        "text": fusion_result.get("sources", {}).get("text"),
        "face": fusion_result.get("sources", {}).get("face"),
        "audio": fusion_result.get("sources", {}).get("audio"),
    },
    "weights": {
        "text": fusion_result.get("weights", {}).get("text", 0),
        "face": fusion_result.get("weights", {}).get("face", 0),
        "audio": fusion_result.get("weights", {}).get("audio", 0),
    },
    "stress": fusion_result.get("stress", 0),
}

print("SafeData structure:")
print(f"  Face source data: {safeData['sources']['face']}")

# This is how getFaceStress is calculated in Dashboard.tsx
def get_face_stress(face_source):
    if not face_source or not face_source.get("data", {}).get("predictions"):
        return 0
    
    predictions = face_source["data"]["predictions"]
    negative_emotions = ["sadness", "fear", "anger", "disgust"]
    
    stress_sum = 0
    for pred in predictions:
        label = pred["label"].lower()
        if label in negative_emotions:
            stress_sum += pred["score"]
    
    return min(1, max(0, stress_sum))

face_stress = get_face_stress(safeData["sources"]["face"])
print(f"\nCalculated face stress: {face_stress:.2f} ({face_stress * 100:.0f}%)")

# Check if face analysis is being used
face_weight = safeData["weights"]["face"]
print(f"Face analysis weight: {face_weight:.2f} ({face_weight * 100:.0f}%)")

# This is how the visualization width is calculated in the UI
visualization_width = face_stress * 100
print(f"Visualization width: {visualization_width:.0f}%")

# Determine stress level category
if face_stress < 0.3:
    stress_level = "Low"
elif face_stress < 0.6:
    stress_level = "Moderate"
else:
    stress_level = "High"

print(f"Stress level category: {stress_level}")

# Test with a high stress example
print("\n" + "="*50)
print("Testing high stress scenario:")

high_stress_fusion_result = {
    "success": True,
    "combined_emotion": "sadness",
    "confidence": 0.85,
    "predictions": [
        {"label": "sadness", "score": 0.68},
        {"label": "fear", "score": 0.15},
        {"label": "neutral", "score": 0.17}
    ],
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
    "stress": 0.95
}

high_safeData = {
    "success": high_stress_fusion_result.get("success", False),
    "combined_emotion": high_stress_fusion_result.get("combined_emotion", "neutral"),
    "confidence": high_stress_fusion_result.get("confidence", 0),
    "predictions": high_stress_fusion_result.get("predictions", []),
    "sources": {
        "text": high_stress_fusion_result.get("sources", {}).get("text"),
        "face": high_stress_fusion_result.get("sources", {}).get("face"),
        "audio": high_stress_fusion_result.get("sources", {}).get("audio"),
    },
    "weights": {
        "text": high_stress_fusion_result.get("weights", {}).get("text", 0),
        "face": high_stress_fusion_result.get("weights", {}).get("face", 0),
        "audio": high_stress_fusion_result.get("weights", {}).get("audio", 0),
    },
    "stress": high_stress_fusion_result.get("stress", 0),
}

high_face_stress = get_face_stress(high_safeData["sources"]["face"])
print(f"High stress face stress: {high_face_stress:.2f} ({high_face_stress * 100:.0f}%)")
print(f"High stress visualization width: {high_face_stress * 100:.0f}%")

if high_face_stress < 0.3:
    high_stress_level = "Low"
elif high_face_stress < 0.6:
    high_stress_level = "Moderate"
else:
    high_stress_level = "High"

print(f"High stress level category: {high_stress_level}")