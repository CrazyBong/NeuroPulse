# NeuroPulse API Documentation

## Overview
NeuroPulse is a multi-modal emotion analysis application that provides real-time emotion detection through audio, text, and facial analysis. The system consists of three separate backend services and a React frontend.

## Backend Services

### 1. Audio Emotion Analysis (Port 5000)
Analyzes audio input to detect emotions.

#### Endpoints:
- `GET /api/health` - Check service health
- `GET /api/emotions` - Get available emotions
- `POST /api/record-and-predict` - Record audio and predict emotion
- `POST /api/upload-and-predict` - Upload audio file and predict emotion
- `POST /api/predict-from-data` - Predict emotion from raw audio data
- `GET /api/available-devices` - Get available audio input devices

### 2. Text Emotion Analysis (Port 5001)
Analyzes text input to detect emotions.

#### Endpoints:
- `GET /api/health` - Check service health
- `GET /api/emotions` - Get available emotions
- `GET /api/model-info` - Get model information
- `POST /api/analyze-text` - Analyze text for emotion
- `POST /api/analyze-batch` - Analyze multiple texts for emotion

### 3. Face Emotion Analysis (Port 5002)
Analyzes facial expressions in images to detect emotions.

#### Endpoints:
- `GET /api/health` - Check service health
- `GET /api/emotions` - Get available emotions
- `GET /api/model-info` - Get model information
- `GET /api/test-image` - Get a test image
- `POST /api/analyze-face` - Analyze face image for emotion
- `POST /api/analyze-batch` - Analyze multiple face images for emotion

## Frontend Components

### Main Pages
1. **Welcome Page** - Introduction and getting started
2. **Analysis Page** - Text and face analysis input
3. **Live Analysis Page** - Real-time face emotion detection
4. **Results Dashboard** - Combined emotion analysis results

### Components
- **TextAnalyzer** - Text input and analysis
- **WebcamAnalyzer** - Face capture and analysis
- **LiveEmotionAnalysis** - Real-time emotion tracking
- **Dashboard** - Results visualization
- **StressGauge** - Stress level visualization
- **EmotionChart** - Emotion history chart

### Services
- **audioAPI** - Interface to audio backend
- **textAPI** - Interface to text backend
- **faceAPI** - Interface to face backend
- **emotionAPI** - Unified interface for all emotion analysis

## Data Models

### Audio Analysis Result
```json
{
  "success": true,
  "predictions": [
    {
      "label": "happy",
      "score": 0.85
    }
  ],
  "top_emotion": "happy",
  "confidence": 0.85
}
```

### Text Analysis Result
```json
{
  "success": true,
  "predictions": [
    {
      "label": "joy",
      "score": 0.78
    }
  ],
  "top_emotion": "joy",
  "confidence": 0.78
}
```

### Face Analysis Result
```json
{
  "success": true,
  "predictions": [
    {
      "label": "happy",
      "score": 0.92
    }
  ],
  "top_emotion": "happy",
  "confidence": 0.92
}
```

## Environment Setup

### Backend Requirements
- Python 3.8+
- Flask
- Transformers
- Torch
- TensorFlow
- Sounddevice
- Soundfile
- Numpy

### Frontend Requirements
- Node.js 16+
- React 18+
- TypeScript
- Vite

## Running the Application

### Backend Services
```bash
# Start all services
cd backend
./start_services.bat

# Or start individually
python audio_model.py  # Port 5000
python text_model.py   # Port 5001
python face_model.py   # Port 5002
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## Testing

### Backend Testing
```bash
cd backend/tests
python test_audio_integration.py
python face_emotion_webcam_test.py
python interactive_text_test.py
```

### API Testing with cURL
```bash
# Check audio service health
curl http://127.0.0.1:5000/api/health

# Check text service health
curl http://127.0.0.1:5001/api/health

# Check face service health
curl http://127.0.0.1:5002/api/health
```

## Error Handling
All API responses include success status and error messages when applicable. The frontend implements fallback mechanisms to handle backend failures gracefully.