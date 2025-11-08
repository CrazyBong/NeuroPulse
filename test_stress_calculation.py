import json

# Test data that would be passed to the stress calculation
test_predictions = [
    {"label": "sadness", "score": 0.71},
    {"label": "fear", "score": 0.22},
    {"label": "anger", "score": 0.05},
    {"label": "disgust", "score": 0.03},
    {"label": "neutral", "score": 0.01}
]

# Calculate stress using the new method
negative_emotions = ["sadness", "fear", "anger", "disgust"]

stress_score = 0
for emo in test_predictions:
    label = emo["label"].lower()
    if label in negative_emotions:
        stress_score += emo["score"]

# Cap to 0-1 range
stress_score = min(1, max(0, stress_score))

print("Test Predictions:")
print(json.dumps(test_predictions, indent=2))

print(f"\nStress Score: {stress_score:.2f} ({stress_score * 100:.0f}%)")

# Test with different data
test_predictions_2 = [
    {"label": "joy", "score": 0.85},
    {"label": "neutral", "score": 0.15}
]

stress_score_2 = 0
for emo in test_predictions_2:
    label = emo["label"].lower()
    if label in negative_emotions:
        stress_score_2 += emo["score"]

stress_score_2 = min(1, max(0, stress_score_2))

print("\n\nTest Predictions 2:")
print(json.dumps(test_predictions_2, indent=2))

print(f"\nStress Score: {stress_score_2:.2f} ({stress_score_2 * 100:.0f}%)")