import json

# Simulate face analysis results with high negative emotions
face_result_high_stress = {
    "success": True,
    "predictions": [
        {"label": "sadness", "score": 0.8},
        {"label": "neutral", "score": 0.2}
    ]
}

# Simulate face analysis results with low negative emotions
face_result_low_stress = {
    "success": True,
    "predictions": [
        {"label": "happy", "score": 0.7},
        {"label": "neutral", "score": 0.3}
    ]
}

# Calculate stress based on negative emotions
negative_emotions = ["sadness", "fear", "anger", "disgust"]

def calculate_stress(predictions):
    stress = 0
    for pred in predictions:
        if pred["label"].lower() in negative_emotions:
            stress += pred["score"]
    return min(1.0, max(0.0, stress))

print("High stress face result:")
stress_high = calculate_stress(face_result_high_stress["predictions"])
print(f"Stress score: {stress_high:.2f}")

print("\nLow stress face result:")
stress_low = calculate_stress(face_result_low_stress["predictions"])
print(f"Stress score: {stress_low:.2f}")

# Test fusion calculation
text_result = {
    "success": True,
    "predictions": [
        {"label": "sadness", "score": 0.6},
        {"label": "neutral", "score": 0.4}
    ]
}

# Fusion calculation (simplified)
text_weight = 0.4
face_weight = 0.4
audio_weight = 0.2

total_weight = text_weight + face_weight + audio_weight

# Normalize weights
normalized_text_weight = text_weight / total_weight
normalized_face_weight = face_weight / total_weight
normalized_audio_weight = audio_weight / total_weight

print(f"\nNormalized weights:")
print(f"Text: {normalized_text_weight:.2f}")
print(f"Face: {normalized_face_weight:.2f}")
print(f"Audio: {normalized_audio_weight:.2f}")

# Combine predictions
emotion_map = {}

# Add text predictions
for pred in text_result["predictions"]:
    label = pred["label"]
    score = pred["score"]
    current_score = emotion_map.get(label, 0)
    emotion_map[label] = current_score + score * normalized_text_weight

# Add face predictions
for pred in face_result_high_stress["predictions"]:
    label = pred["label"]
    score = pred["score"]
    current_score = emotion_map.get(label, 0)
    emotion_map[label] = current_score + score * normalized_face_weight

# Convert to sorted list
predictions_list = sorted(
    [{"label": label, "score": score} for label, score in emotion_map.items()],
    key=lambda x: x["score"],
    reverse=True
)

print(f"\nCombined predictions:")
for pred in predictions_list:
    print(f"{pred['label']}: {pred['score']:.3f}")

# Calculate final stress
final_stress = 0
for pred in predictions_list:
    if pred["label"].lower() in negative_emotions:
        final_stress += pred["score"]

final_stress = min(1.0, max(0.0, final_stress))
print(f"\nFinal combined stress score: {final_stress:.2f}")