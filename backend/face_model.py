from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import io
import base64
from datetime import datetime
import logging
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load the face emotion detection model
print("Loading face emotion recognition model...")
MODEL_NAME = "dima806/facial_emotions_image_detection"

try:
    processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    model.eval()  # Set to evaluation mode
    print("Model loaded successfully!")
    print(f"Model: {MODEL_NAME}")
    
    # Get emotion labels from model config
    EMOTION_LABELS = list(model.config.id2label.values())
    print(f"Emotions: {EMOTION_LABELS}")
except Exception as e:
    print(f"Error loading model: {e}")
    processor = None
    model = None
    EMOTION_LABELS = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'model_not_loaded',
        'model': MODEL_NAME,
        'emotions': EMOTION_LABELS,
        'timestamp': datetime.now().isoformat(),
        'type': 'face-emotion-detection'
    })

@app.route('/api/analyze-face', methods=['POST'])
def analyze_face():
    """
    Analyze face image and predict emotion
    Accepts: multipart/form-data with 'image' field
    Or: JSON with 'image' field containing base64 encoded image
    """
    if model is None or processor is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        image = None
        
        # Try to get image from multipart form data
        if 'image' in request.files:
            image_file = request.files['image']
            image = Image.open(image_file.stream).convert('RGB')
            logger.info(f"Received image file: {image_file.filename}")
        
        # Try to get image from JSON (base64)
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                # Remove data URL prefix if present
                image_data = data['image']
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                # Decode base64
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                logger.info("Received base64 image")
        
        if image is None:
            return jsonify({
                'success': False,
                'error': 'No image provided. Send as multipart form-data or base64 in JSON.'
            }), 400
        
        # Log image details
        logger.info(f"Image size: {image.size}, mode: {image.mode}")
        
        # Process image
        inputs = processor(images=image, return_tensors="pt")
        
        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
        
        # Get probabilities
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        probabilities = probabilities[0].tolist()
        
        # Create results
        predictions = []
        for idx, prob in enumerate(probabilities):
            label = model.config.id2label.get(idx, f'emotion_{idx}')
            predictions.append({
                'label': label,
                'score': float(prob)
            })
        
        # Sort by score
        predictions.sort(key=lambda x: x['score'], reverse=True)
        
        top_emotion = predictions[0]['label']
        confidence = predictions[0]['score']
        
        logger.info(f"Prediction: {top_emotion} ({confidence:.2%})")
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'top_emotion': top_emotion,
            'confidence': confidence,
            'image_size': list(image.size)
        })
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-batch', methods=['POST'])
def analyze_batch():
    """
    Analyze multiple face images in batch
    Accepts: multipart/form-data with multiple 'images' fields
    """
    if model is None or processor is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        files = request.files.getlist('images')
        
        if not files or len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'No images provided'
            }), 400
        
        if len(files) > 20:
            return jsonify({
                'success': False,
                'error': 'Maximum 20 images per batch'
            }), 400
        
        logger.info(f"Analyzing batch of {len(files)} images...")
        
        # Analyze all images
        batch_results = []
        for idx, file in enumerate(files):
            try:
                image = Image.open(file.stream).convert('RGB')
                
                # Process image
                inputs = processor(images=image, return_tensors="pt")
                
                # Make prediction
                with torch.no_grad():
                    outputs = model(**inputs)
                    logits = outputs.logits
                
                # Get probabilities
                probabilities = torch.nn.functional.softmax(logits, dim=-1)
                probabilities = probabilities[0].tolist()
                
                # Create results
                predictions = []
                for pred_idx, prob in enumerate(probabilities):
                    label = model.config.id2label.get(pred_idx, f'emotion_{pred_idx}')
                    predictions.append({
                        'label': label,
                        'score': float(prob)
                    })
                
                predictions.sort(key=lambda x: x['score'], reverse=True)
                
                batch_results.append({
                    'success': True,
                    'predictions': predictions,
                    'top_emotion': predictions[0]['label'],
                    'confidence': predictions[0]['score'],
                    'index': idx,
                    'filename': file.filename
                })
                
            except Exception as e:
                batch_results.append({
                    'success': False,
                    'error': str(e),
                    'index': idx,
                    'filename': file.filename
                })
        
        return jsonify({
            'success': True,
            'results': batch_results,
            'total': len(files)
        })
        
    except Exception as e:
        logger.error(f"Batch error: {str(e)}")
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
        'model_type': 'image-classification',
        'emotions': EMOTION_LABELS,
        'input_size': processor.size if processor else None,
        'description': 'Facial emotion detection from images'
    })

@app.route('/api/test-image', methods=['GET'])
def test_image():
    """
    Test endpoint - returns info about expected image format
    """
    return jsonify({
        'success': True,
        'message': 'Send POST request to /api/analyze-face',
        'accepted_formats': ['JPEG', 'PNG', 'WebP'],
        'methods': [
            {
                'method': 'multipart/form-data',
                'description': 'Upload image file',
                'field_name': 'image'
            },
            {
                'method': 'application/json',
                'description': 'Send base64 encoded image',
                'field_name': 'image',
                'format': 'data:image/jpeg;base64,/9j/4AAQ...'
            }
        ],
        'max_size': '10MB (recommended)',
        'tips': [
            'Face should be clearly visible',
            'Good lighting recommended',
            'Single face per image works best'
        ]
    })

if __name__ == '__main__':
    print("\nStarting Face Emotion Detection Server...")
    print("=" * 60)
    print(f"Model: {MODEL_NAME}")
    print(f"Emotions: {', '.join(EMOTION_LABELS) if EMOTION_LABELS else 'Loading...'}")
    print("=" * 60)
    print("\nAvailable endpoints:")
    print("  - GET  /api/health           - Health check")
    print("  - GET  /api/emotions         - List emotions")
    print("  - GET  /api/model-info       - Model details")
    print("  - GET  /api/test-image       - Image format info")
    print("  - POST /api/analyze-face     - Analyze single face")
    print("  - POST /api/analyze-batch    - Analyze multiple faces")
    print("=" * 60)
    print("\nServer starting on http://127.0.0.1:5002")
    print("Press CTRL+C to quit\n")
    
    app.run(debug=True, host='0.0.0.0', port=5002)