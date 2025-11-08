import json

# Simulate a real scenario where face analysis might show unexpectedly low stress
# This could happen if the face model is not detecting strong emotions or if
# there's an issue with how the results are being processed

# Scenario 1: Face analysis returns mostly neutral results
neutral_face_result = {
    "success": True,
    "predictions": [
        {"label": "neutral", "score": 0.95},
        {"label": "happy", "score": 0.05}
    ]
}

# Scenario 2: Face analysis returns mixed results but with low negative emotion scores
mixed_face_result = {
    "success": True,
    "predictions": [
        {"label": "happy", "score": 0.4},
        {"label": "neutral", "score": 0.3},
        {"label": "sadness", "score": 0.2},  # This would contribute to stress
        {"label": "surprise", "score": 0.1}
    ]
}

# Scenario 3: Face analysis returns high negative emotions (what we'd expect to see high stress)
high_negative_result = {
    "success": True,
    "predictions": [
        {"label": "sadness", "score": 0.6},
        {"label": "fear", "score": 0.25},
        {"label": "anger", "score": 0.1},
        {"label": "disgust", "score": 0.05}
    ]
}

def calculate_stress(predictions):
    """Calculate stress based on negative emotions"""
    negative_emotions = ["sadness", "fear", "anger", "disgust"]
    stress_sum = 0
    
    for pred in predictions:
        label = pred["label"].lower()
        if label in negative_emotions:
            stress_sum += pred["score"]
    
    return min(1, max(0, stress_sum))

print("Stress calculations for different scenarios:")
print("=" * 50)

# Test neutral face result
neutral_stress = calculate_stress(neutral_face_result["predictions"])
print(f"Neutral face result:")
for pred in neutral_face_result["predictions"]:
    print(f"  {pred['label']}: {pred['score']:.2f}")
print(f"  Calculated stress: {neutral_stress:.2f} ({neutral_stress * 100:.0f}%)")
print(f"  Stress level: {'Low' if neutral_stress < 0.3 else 'Moderate' if neutral_stress < 0.6 else 'High'}")
print()

# Test mixed face result
mixed_stress = calculate_stress(mixed_face_result["predictions"])
print(f"Mixed face result:")
for pred in mixed_face_result["predictions"]:
    print(f"  {pred['label']}: {pred['score']:.2f}")
print(f"  Calculated stress: {mixed_stress:.2f} ({mixed_stress * 100:.0f}%)")
print(f"  Stress level: {'Low' if mixed_stress < 0.3 else 'Moderate' if mixed_stress < 0.6 else 'High'}")
print()

# Test high negative result
high_negative_stress = calculate_stress(high_negative_result["predictions"])
print(f"High negative emotions result:")
for pred in high_negative_result["predictions"]:
    print(f"  {pred['label']}: {pred['score']:.2f}")
print(f"  Calculated stress: {high_negative_stress:.2f} ({high_negative_stress * 100:.0f}%)")
print(f"  Stress level: {'Low' if high_negative_stress < 0.3 else 'Moderate' if high_negative_stress < 0.6 else 'High'}")
print()

# Possible issue: What if the face model is not very confident?
low_confidence_result = {
    "success": True,
    "predictions": [
        {"label": "happy", "score": 0.35},
        {"label": "neutral", "score": 0.30},
        {"label": "sadness", "score": 0.20},  # 20% sadness should contribute some stress
        {"label": "fear", "score": 0.10},     # 10% fear should contribute some stress
        {"label": "anger", "score": 0.05}     # 5% anger should contribute some stress
    ]
}

low_confidence_stress = calculate_stress(low_confidence_result["predictions"])
print(f"Low confidence mixed emotions result:")
for pred in low_confidence_result["predictions"]:
    print(f"  {pred['label']}: {pred['score']:.2f}")
print(f"  Negative emotions total: {0.20 + 0.10 + 0.05:.2f}")
print(f"  Calculated stress: {low_confidence_stress:.2f} ({low_confidence_stress * 100:.0f}%)")
print(f"  Stress level: {'Low' if low_confidence_stress < 0.3 else 'Moderate' if low_confidence_stress < 0.6 else 'High'}")
print()

# Another possible issue: Are we correctly extracting the predictions from the gateway response?
print("=" * 50)
print("Checking data extraction from gateway response:")

# This is how the frontend receives data from the gateway
gateway_response_example = {
    "sources": {
        "face": {
            "status": "success",
            "data": {
                "success": True,
                "predictions": [
                    {"label": "happy", "score": 0.85},
                    {"label": "neutral", "score": 0.15}
                ]
            }
        }
    }
}

# Extract face predictions correctly
face_source = gateway_response_example["sources"]["face"]
if face_source and face_source.get("data", {}).get("success"):
    face_predictions = face_source["data"]["predictions"]
    print("Successfully extracted face predictions:")
    for pred in face_predictions:
        print(f"  {pred['label']}: {pred['score']:.2f}")
    
    extracted_stress = calculate_stress(face_predictions)
    print(f"Calculated stress from extracted data: {extracted_stress:.2f} ({extracted_stress * 100:.0f}%)")
else:
    print("Failed to extract face predictions")