import json

# Test data that would be passed to the EmotionChart component
test_emotions = [
    {"label": "joy", "score": 0.45},
    {"label": "sadness", "score": 0.20},
    {"label": "anger", "score": 0.15},
    {"label": "fear", "score": 0.10},
    {"label": "surprise", "score": 0.05},
    {"label": "neutral", "score": 0.03},
    {"label": "disgust", "score": 0.02}
]

print("Test Emotion Data:")
print(json.dumps(test_emotions, indent=2))

print("\nExpected Colors:")
emotion_colors = {
    "joy": "#FFD93D",
    "sadness": "#6A67CE",
    "anger": "#FF6B6B",
    "fear": "#4D96FF",
    "surprise": "#00C49F",
    "neutral": "#BFBFBF",
    "disgust": "#8E44AD"
}

for emotion in test_emotions:
    label = emotion["label"]
    color = emotion_colors.get(label, "#999999")
    print(f"  {label}: {color}")