from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
import torch
import sounddevice as sd
import soundfile as sf
import librosa
import numpy as np
import tempfile
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load the emotion recognition model (loads once at startup)
print("Loading emotion recognition model...")
MODEL_NAME = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"

# Emotion labels from RAVDESS dataset
EMOTION_LABELS = ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised']

try:
    # Load feature extractor and model separately
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_NAME)
    model = Wav2Vec2ForSequenceClassification.from_pretrained(MODEL_NAME, ignore_mismatched_sizes=True)
    model.eval()  # Set to evaluation mode
    print("Model loaded successfully!")
    print(f"Emotion labels: {EMOTION_LABELS}")
except Exception as e:
    print(f"Error loading model: {e}")
    feature_extractor = None
    model = None

# Configuration
SAMPLE_RATE = 16000  # Required sample rate for the model

def predict_emotion(audio_path):
    """
    Predict emotion from audio file
    """
    try:
        # Load audio file
        audio, sr = librosa.load(audio_path, sr=SAMPLE_RATE)
        
        # Process audio
        inputs = feature_extractor(audio, sampling_rate=SAMPLE_RATE, return_tensors="pt", padding=True)
        
        # Make prediction
        with torch.no_grad():
            logits = model(inputs.input_values).logits
        
        # Get probabilities
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        probabilities = probabilities[0].tolist()
        
        # Create results
        results = []
        for idx, prob in enumerate(probabilities):
            if idx < len(EMOTION_LABELS):
                results.append({
                    'label': EMOTION_LABELS[idx],
                    'score': float(prob)
                })
        
        # Sort by score
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return results
        
    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'model_not_loaded',
        'model': MODEL_NAME,
        'emotions': EMOTION_LABELS,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/record-and-predict', methods=['POST'])
def record_and_predict():
    """
    Record audio from microphone and predict emotion
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        # Get duration from request or use default
        data = request.get_json() or {}
        duration = data.get('duration', 5)
        
        print(f"Recording audio for {duration} seconds...")
        
        # Record audio from microphone
        audio_data = sd.rec(
            int(duration * SAMPLE_RATE),
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype='float32'
        )
        sd.wait()  # Wait until recording is finished
        
        print("Recording finished. Processing...")
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            sf.write(tmp_file.name, audio_data, SAMPLE_RATE)
            tmp_path = tmp_file.name
        
        # Predict emotion
        results = predict_emotion(tmp_path)
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        print(f"Prediction results: {results[:3]}")
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_emotion': results[0]['label'],
            'confidence': results[0]['score'],
            'duration': duration
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/upload-and-predict', methods=['POST'])
def upload_and_predict():
    """
    Accept uploaded audio file and predict emotion
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
        
        audio_file = request.files['audio']
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            audio_file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        print(f"Processing uploaded file: {audio_file.filename}")
        
        # Predict emotion
        results = predict_emotion(tmp_path)
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        print(f"Prediction results: {results[:3]}")
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_emotion': results[0]['label'],
            'confidence': results[0]['score'],
            'filename': audio_file.filename
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-from-data', methods=['POST'])
def predict_from_data():
    """
    Accept audio data as base64 or raw bytes and predict emotion
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    try:
        # Get audio data from request
        audio_file = request.files.get('audio')
        
        if not audio_file:
            return jsonify({
                'success': False,
                'error': 'No audio data provided'
            }), 400
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            audio_file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        # Predict emotion
        results = predict_emotion(tmp_path)
        
        # Clean up
        os.unlink(tmp_path)
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_emotion': results[0]['label'],
            'confidence': results[0]['score']
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/available-devices', methods=['GET'])
def get_audio_devices():
    """
    Get list of available audio input devices
    """
    try:
        devices = sd.query_devices()
        input_devices = [
            {
                'index': i,
                'name': device['name'],
                'channels': device['max_input_channels']
            }
            for i, device in enumerate(devices)
            if device['max_input_channels'] > 0
        ]
        
        return jsonify({
            'success': True,
            'devices': input_devices
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
        'emotions': EMOTION_LABELS
    })

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Available endpoints:")
    print("  - GET  /api/health")
    print("  - GET  /api/emotions")
    print("  - POST /api/record-and-predict")
    print("  - POST /api/upload-and-predict")
    print("  - POST /api/predict-from-data")
    print("  - GET  /api/available-devices")
    app.run(debug=True, host='0.0.0.0', port=5000)