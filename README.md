# NeuroPulse

An AI-powered multi-modal emotion analysis system that supports text, audio, and face processing for real-time emotion and stress detection.

## Features

- **Text Emotion Analysis**: Detect emotions from written text using DistilRoBERTa
- **Voice Emotion Detection**: Analyze audio input for emotional content using Wav2Vec2
- **Face Emotion Detection**: Recognize facial expressions through webcam input using CNN models
- **Real-time Processing**: Instant emotion analysis with live feedback
- **Multi-modal Fusion**: Combine multiple emotion sources for enhanced accuracy
- **Privacy-focused**: All processing happens locally, no data is stored on servers

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations

### Backend
- Flask (Python)
- Hugging Face Transformers
- PyTorch for deep learning models
- TensorFlow for audio processing

### AI Models
- **Text**: DistilRoBERTa for text emotion classification
- **Audio**: Wav2Vec2 for voice emotion recognition
- **Face**: dima806/facial_emotions_image_detection CNN model

## Architecture

NeuroPulse consists of three independent backend services:

1. **Audio Service** (Port 5000): Handles voice emotion detection
2. **Text Service** (Port 5001): Processes text emotion analysis
3. **Face Service** (Port 5002): Manages facial emotion recognition

The React frontend connects to all three services simultaneously, providing a unified interface for multi-modal emotion analysis.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm/yarn

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start all backend services:
```bash
# Option 1: Using the batch file (Windows)
start_services.bat

# Option 2: Start each service manually
python audio_model.py  # Port 5000
python text_model.py   # Port 5001
python face_model.py   # Port 5002
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Audio Service (Port 5000)
- `GET /api/health` - Service health check
- `GET /api/emotions` - Available emotions
- `POST /api/record-and-predict` - Record and analyze audio
- `POST /api/upload-and-predict` - Upload and analyze audio file
- `POST /api/predict-from-data` - Analyze raw audio data
- `GET /api/available-devices` - List audio input devices

### Text Service (Port 5001)
- `GET /api/health` - Service health check
- `GET /api/emotions` - Available emotions
- `GET /api/model-info` - Model information
- `POST /api/analyze-text` - Analyze text emotion
- `POST /api/analyze-batch` - Batch text analysis

### Face Service (Port 5002)
- `GET /api/health` - Service health check
- `GET /api/emotions` - Available emotions
- `GET /api/model-info` - Model information
- `GET /api/test-image` - Sample test image
- `POST /api/analyze-face` - Analyze face emotion
- `POST /api/analyze-batch` - Batch face analysis

## Unified Response Format

All backend services return a consistent JSON response format:

```json
{
  "success": true,
  "predictions": [
    {"label": "emotion_name", "score": 0.85}
  ],
  "top_emotion": "emotion_name",
  "confidence": 0.85
}
```

This unified format makes it easy for the frontend to handle responses from all services consistently.

## Testing

Run backend tests:
```bash
cd backend/tests
python test_audio_integration.py
python face_emotion_webcam_test.py
python interactive_text_test.py
```

## Project Structure

```
NeuroPulse/
├── backend/
│   ├── audio_model.py      # Audio emotion analysis service
│   ├── text_model.py       # Text emotion analysis service
│   ├── face_model.py       # Face emotion analysis service
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # Test scripts
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API services
    │   └── App.tsx         # Main application
    ├── package.json        # Frontend dependencies
    └── vite.config.ts      # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hugging Face for providing pre-trained models
- Facebook Research for Wav2Vec2
- All contributors who have helped shape NeuroPulse