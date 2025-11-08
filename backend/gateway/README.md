# NeuroPulse API Gateway

This is the central API gateway for the NeuroPulse emotion analysis system. It provides a unified interface for all frontend requests and routes them to the appropriate microservices.

## Architecture

```
Frontend (Vite/React) 
    ↓ (http://localhost:8000)
API Gateway (FastAPI)
    ↓
Microservices:
├── Text Emotion Service (Port 5001)
├── Audio Emotion Service (Port 5000)
└── Face Emotion Service (Port 5002)
```

## Endpoints

### Health Check
- `GET /api/health` - Check status of all services

### Text Emotion Analysis
- `POST /api/text` - Analyze text for emotions

### Audio Emotion Analysis
- `POST /api/audio` - Analyze audio for emotions

### Face Emotion Analysis
- `POST /api/face` - Analyze face image for emotions

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure all microservices are running:
- Text service on port 5001
- Audio service on port 5000
- Face service on port 5002

3. Start the gateway:
```bash
python app.py
```

## Usage

The gateway will be available at `http://localhost:8000`