from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn
from typing import Optional, Dict, Any
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))
from services.llm_service import generate_emotion_summary, generate_mental_health_tips

# ---------------------------------------------------
# ✅ FastAPI App Initialization
# ---------------------------------------------------
app = FastAPI(
    title="NeuroPulse API Gateway",
    description="Unified API Gateway for Text, Audio, and Face Emotion Services",
    version="1.0.0"
)

# ---------------------------------------------------
# ✅ CORS Configuration (React + Vite Compatible)
# ---------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3002"],  # Allow frontend running on port 3002
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# ✅ Model Service URLs
# ---------------------------------------------------
TEXT_SERVICE_URL = "http://127.0.0.1:5001"
AUDIO_SERVICE_URL = "http://127.0.0.1:5000"
FACE_SERVICE_URL = "http://127.0.0.1:5002"

# ---------------------------------------------------
# ✅ Helper: Safe POST Wrapper
# ---------------------------------------------------
def safe_post(url, service_name="", **kwargs):
    try:
        response = requests.post(url, **kwargs, timeout=20)
        response.raise_for_status()
        return {
            "status": "success",
            "service": service_name,
            "data": response.json()
        }
    except Exception as e:
        return {
            "status": "error",
            "service": service_name,
            "error": str(e)
        }

# ---------------------------------------------------
# ✅ Health Check Helper
# ---------------------------------------------------
def check_health(url):
    try:
        r = requests.get(url, timeout=0.5)
        return r.status_code == 200
    except Exception:
        return False

# ---------------------------------------------------
# ✅ Health Check Endpoint
# ---------------------------------------------------
@app.get("/api/health")
def health():
    services = {
        "text_service": check_health(f"{TEXT_SERVICE_URL}/api/health"),
        "audio_service": check_health(f"{AUDIO_SERVICE_URL}/api/health"),
        "face_service": check_health(f"{FACE_SERVICE_URL}/api/health"),
    }
    return {
        "status": "OK",
        "services": services
    }

# ---------------------------------------------------
# ✅ Text Emotion Analysis
# ---------------------------------------------------
@app.post("/api/text")
async def analyze_text(request: Request):
    # Parse JSON body
    try:
        body = await request.json()
        text = body.get("text", "")
    except:
        # Fallback to form data if JSON parsing fails
        form = await request.form()
        text = form.get("text", "")
    
    result = safe_post(
        f"{TEXT_SERVICE_URL}/api/analyze-text",
        service_name="text",
        json={"text": text}
    )
    return {"type": "text", "input": text, "result": result}

# ---------------------------------------------------
# ✅ Audio Emotion Analysis
# ---------------------------------------------------
@app.post("/api/audio")
async def analyze_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    result = safe_post(
        f"{AUDIO_SERVICE_URL}/api/upload-and-predict",
        service_name="audio",
        files={"audio": (file.filename, audio_bytes, file.content_type)}
    )

    return {"type": "audio", "filename": file.filename, "result": result}

# ---------------------------------------------------
# ✅ Face Emotion Analysis
# ---------------------------------------------------
@app.post("/api/face")
async def analyze_face(file: UploadFile = File(...)):
    img_bytes = await file.read()

    result = safe_post(
        f"{FACE_SERVICE_URL}/api/analyze-face",
        service_name="face",
        files={"image": ("image.jpg", img_bytes, file.content_type)}
    )

    return {"type": "face", "filename": file.filename, "result": result}

# ---------------------------------------------------
# ✅ Fusion Analysis
# ---------------------------------------------------
@app.post("/api/fusion")
async def analyze_fusion(
    text_result: Optional[dict] = None,
    face_result: Optional[dict] = None,
    audio_result: Optional[dict] = None
):
    try:
        # Calculate weights (adjust as needed)
        text_weight = 0.4 if text_result and text_result.get("success") else 0
        face_weight = 0.4 if face_result and face_result.get("success") else 0
        audio_weight = 0.2 if audio_result and audio_result.get("success") else 0
        
        total_weight = text_weight + face_weight + audio_weight
        
        # Handle case where no sources are available
        if total_weight == 0:
            return {
                "success": True,
                "combined_emotion": "neutral",
                "confidence": 0.5,
                "predictions": {"neutral": 1.0},
                "sources": {},
                "weights": {"text": 0, "face": 0, "audio": 0}
            }

        # Normalize weights
        normalized_text_weight = text_weight / total_weight
        normalized_face_weight = face_weight / total_weight
        normalized_audio_weight = audio_weight / total_weight

        # Combine predictions
        emotion_map = {}

        if text_result and text_result.get("success"):
            for pred in text_result.get("predictions", []):
                label = pred.get("label")
                score = pred.get("score", 0)
                current_score = emotion_map.get(label, 0)
                emotion_map[label] = current_score + score * normalized_text_weight

        if face_result and face_result.get("success"):
            for pred in face_result.get("predictions", []):
                label = pred.get("label")
                score = pred.get("score", 0)
                current_score = emotion_map.get(label, 0)
                emotion_map[label] = current_score + score * normalized_face_weight

        if audio_result and audio_result.get("success"):
            for pred in audio_result.get("predictions", []):
                label = pred.get("label")
                score = pred.get("score", 0)
                current_score = emotion_map.get(label, 0)
                emotion_map[label] = current_score + score * normalized_audio_weight

        # Convert to sorted list
        predictions_list = sorted(
            [{"label": label, "score": score} for label, score in emotion_map.items()],
            key=lambda x: x["score"],
            reverse=True
        )

        # Create predictions object for compatibility
        predictions_obj = {item["label"]: item["score"] for item in predictions_list}

        # Calculate stress score based on negative emotions
        negative_emotions = ["sadness", "fear", "anger", "disgust"]
        stress_score = 0
        for pred in predictions_list:
            if pred["label"].lower() in negative_emotions:
                stress_score += pred["score"]
        stress_score = min(1.0, max(0.0, stress_score))

        print(f"📊 Calculated stress score: {stress_score:.2f}")

        # Generate LLM summary
        llm_input = {
            "text": text_result,
            "audio": audio_result,
            "face": face_result,
            "stress": stress_score
        }
        print("🤖 Generating LLM summary...")
        llm_summary = generate_emotion_summary(llm_input)
        print(f"📝 LLM summary generated ({len(llm_summary)} chars)")

        result = {
            "success": True,
            "combined_emotion": predictions_list[0]["label"] if predictions_list else "neutral",
            "confidence": predictions_list[0]["score"] if predictions_list else 0.5,
            "predictions": predictions_obj,
            "sources": {
                "text": text_result,
                "face": face_result,
                "audio": audio_result
            },
            "weights": {
                "text": normalized_text_weight,
                "face": normalized_face_weight,
                "audio": normalized_audio_weight
            },
            "stress": stress_score,
            "llm_summary": llm_summary
        }
        
        print(f"✅ Fusion endpoint response prepared with llm_summary: {len(result.get('llm_summary', '')) > 0}")
        return result
    except Exception as e:
        return {
            "success": False,
            "combined_emotion": "neutral",
            "confidence": 0,
            "predictions": {},
            "sources": {},
            "weights": {"text": 0, "face": 0, "audio": 0},
            "error": str(e)
        }

# ---------------------------------------------------
# ✅ Mental Health Tips Generation
# ---------------------------------------------------
@app.post("/api/generate-tips")
async def generate_mental_health_tips_endpoint(request: Request):
    try:
        # Parse JSON body
        body = await request.json()
        
        # Extract parameters
        stress_score = body.get("stressScore", 0)
        primary_emotion = body.get("primaryEmotion", "neutral")
        emotion_breakdown = body.get("emotionBreakdown", [])
        has_text_analysis = body.get("hasTextAnalysis", False)
        has_face_analysis = body.get("hasFaceAnalysis", False)
        text_stress = body.get("textStress", 0)
        face_stress = body.get("faceStress", 0)
        
        print(f"🤖 Generating mental health tips for {primary_emotion} with stress {stress_score:.2f}")
        
        # Call LLM service
        tips_response = generate_mental_health_tips(
            stress_score=stress_score,
            primary_emotion=primary_emotion,
            emotion_breakdown=emotion_breakdown,
            has_text_analysis=has_text_analysis,
            has_face_analysis=has_face_analysis,
            text_stress=text_stress,
            face_stress=face_stress
        )
        
        print(f"✅ Mental health tips generated")
        return tips_response
    except Exception as e:
        print(f"🔥 Error generating mental health tips: {str(e)}")
        # Return fallback response
        return {
            "summary": "We've analyzed your emotional state and provided personalized suggestions to support your wellbeing.",
            "tips": [
                "Practice deep breathing exercises for 5 minutes daily",
                "Engage in physical activity or stretching",
                "Connect with friends or family members",
                "Maintain a regular sleep schedule",
                "Try mindfulness or meditation techniques"
            ],
            "resources": [
                {"title": "Crisis Text Line", "description": "Text HOME to 741741 for free, 24/7 crisis support"},
                {"title": "National Suicide Prevention Lifeline", "description": "Call 988 for 24/7 support"}
            ]
        }

# ---------------------------------------------------
# ✅ Start Gateway Server
# ---------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)