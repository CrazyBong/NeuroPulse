"""
Text Emotion Analysis API
Pure PyTorch implementation to avoid TensorFlow conflicts
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Use a PyTorch-only model to avoid TensorFlow conflicts
MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

print(f"Loading text emotion recognition model: {MODEL_NAME}")

try:
    # Force PyTorch framework and avoid TensorFlow entirely
    classifier = pipeline(
        "text-classification",
        model=MODEL_NAME,
        top_k=None,
        framework="pt",  # Explicitly use PyTorch
        device=0 if torch.cuda.is_available() else -1  # Use GPU if available
    )
    
    print("✅ Model loaded successfully!")
    
    # Emotion labels from the model
    EMOTION_LABELS = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']
    print(f"😊 Emotions: {EMOTION_LABELS}")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    classifier = None
    EMOTION_LABELS = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if classifier is not None else 'model_not_loaded',
        'model': MODEL_NAME,
        'emotions': EMOTION_LABELS,
        'timestamp': datetime.now().isoformat(),
        'type': 'text-emotion-analysis'
    })

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Analyze text and predict emotion
    """
    if classifier is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        # Get text from request
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided. Send JSON with "text" field.'
            }), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text cannot be empty'
            }), 400
        
        if len(text) > 5000:
            return jsonify({
                'success': False,
                'error': 'Text too long. Maximum 5000 characters.'
            }), 400
        
        # Predict emotion using the pipeline
        results = classifier(text)
        
        # Format results - handle different result structures
        if isinstance(results, list) and len(results) > 0:
            if isinstance(results[0], list):
                # Results is a list of lists (top_k format)
                predictions = [
                    {
                        "label": result["label"],
                        "score": float(result["score"])
                    }
                    for result in results[0]
                ]
            else:
                # Results is a list of dictionaries
                predictions = [
                    {
                        "label": result["label"],
                        "score": float(result["score"])
                    }
                    for result in results
                ]
        else:
            return jsonify({
                'success': False,
                'error': 'Unexpected result format from model'
            }), 500
        
        top_emotion = predictions[0]["label"]
        confidence = predictions[0]["score"]
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'top_emotion': top_emotion,
            'confidence': confidence,
            'text_length': len(text)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/emotions', methods=['GET'])
def get_emotions():
    """
    Get list of supported emotions
    """
    return jsonify({
        'success': True,
        'emotions': EMOTION_LABELS,
        'count': len(EMOTION_LABELS)
    })

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """
    Get detailed model information
    """
    return jsonify({
        'success': True,
        'model_name': MODEL_NAME,
        'model_type': 'distilroberta-base',
        'emotions': EMOTION_LABELS,
        'max_length': 512,
        'language': 'English',
        'description': 'Fine-tuned DistilRoBERTa for emotion classification (PyTorch only)'
    })

if __name__ == '__main__':
    print("\nStarting Text Emotion Analysis Server...")
    print("=" * 60)
    print(f"Model: {MODEL_NAME}")
    print(f"Emotions: {', '.join(EMOTION_LABELS)}")
    print("=" * 60)
    print("\nAvailable endpoints:")
    print("  - GET  /api/health           - Health check")
    print("  - GET  /api/emotions         - List emotions")
    print("  - GET  /api/model-info       - Model details")
    print("  - POST /api/analyze-text     - Analyze single text")
    print("=" * 60)
    print("\nServer starting on http://127.0.0.1:5001")
    print("Press CTRL+C to quit\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)