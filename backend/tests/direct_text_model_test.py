"""
Direct text emotion analysis test (no backend required)
PyTorch-only — works with michellejieli/emotion_text_classifier
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F


def load_model():
    MODEL_NAME = "michellejieli/emotion_text_classifier"
    print(f"Loading model: {MODEL_NAME}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    LABELS = ["anger", "fear", "joy", "love", "sadness", "surprise"]

    print("✅ Model loaded successfully!")
    return model, tokenizer, device, LABELS


def predict(text, model, tokenizer, device, LABELS):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)[0]

    results = []
    for label, score in zip(LABELS, probs):
        results.append({
            "label": label,
            "score": float(score)
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)


def main():
    print("🔍 Direct Text Emotion Analysis Test")
    print("=" * 50)

    model, tokenizer, device, LABELS = load_model()

    test_texts = [
        "I am so happy and excited about this!",
        "This makes me really angry and frustrated.",
        "I feel sad and lonely today.",
        "Wow! This is such a surprise!",
        "I'm scared of what might happen."
    ]

    print("\n🧪 Testing with sample texts:")
    for text in test_texts:
        print(f"\nAnalyzing: \"{text}\"")

        results = predict(text, model, tokenizer, device, LABELS)

        print("📊 Results:")
        for i, result in enumerate(results):
            emotion = result["label"]
            score = result["score"]
            bar = "█" * int(score * 20)
            print(f"  {i+1}. {emotion:10} {bar} {score*100:.1f}%")

    print("\n" + "=" * 50)
    print("💬 Interactive Mode — Type your own text!")
    print("Type 'quit' to exit.")
    print("=" * 50)

    while True:
        user_text = input("\nEnter text: ").strip()
        if user_text.lower() in ["quit", "exit", "q"]:
            print("👋 Goodbye!")
            break

        if user_text:
            results = predict(user_text, model, tokenizer, device, LABELS)

            print("\n📊 Results:")
            for i, result in enumerate(results):
                emotion = result["label"]
                score = result["score"]
                bar = "█" * int(score * 20)
                print(f"  {i+1}. {emotion:10} {bar} {score*100:.1f}%")


if __name__ == "__main__":
    main()
