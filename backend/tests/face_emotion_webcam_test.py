"""
Live Face Emotion Detection using Webcam
This script captures live video from your webcam and detects emotions in real-time
"""

import cv2
import requests
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import time

# Configuration
FACE_BACKEND_URL = "http://127.0.0.1:5002/api/analyze-face"
WEBCAM_INDEX = 0  # Change this if you have multiple cameras
CONFIDENCE_THRESHOLD = 0.1  # Minimum confidence to show emotion

def capture_and_analyze_emotions():
    """Capture video from webcam and analyze emotions in real-time"""
    
    # Check if face backend is running
    try:
        health_response = requests.get("http://127.0.0.1:5002/api/health", timeout=3)
        if health_response.status_code == 200:
            health_data = health_response.json()
            if health_data.get('status') == 'healthy':
                print("✅ Face emotion backend is running")
                print(f"🧠 Model: {health_data.get('model')}")
                emotions = health_data.get('emotions', [])
                print(f"😊 Emotions: {', '.join(emotions)}")
            else:
                print("❌ Face emotion backend is not healthy")
                print("Please start the face backend: python face_model.py")
                return
        else:
            print("❌ Could not connect to face emotion backend")
            print("Please start the face backend: python face_model.py")
            return
    except Exception as e:
        print(f"❌ Could not connect to face emotion backend: {e}")
        print("Please start the face backend: python face_model.py")
        return
    
    # Initialize webcam
    print(f"\nInitializing webcam (index {WEBCAM_INDEX})...")
    cap = cv2.VideoCapture(WEBCAM_INDEX)
    
    if not cap.isOpened():
        print("❌ Error: Could not open webcam")
        return
    
    print("✅ Webcam initialized successfully")
    print("📸 Starting live emotion detection...")
    print("Press 'q' to quit")
    
    frame_count = 0
    last_analysis_time = 0
    current_emotion = "Analyzing..."
    confidence = 0.0
    
    try:
        while True:
            # Capture frame
            ret, frame = cap.read()
            if not ret:
                print("❌ Error: Could not read frame from webcam")
                break
            
            frame_count += 1
            
            # Analyze frame every 10 frames (to reduce API calls)
            current_time = time.time()
            if current_time - last_analysis_time > 0.5:  # Analyze every 0.5 seconds
                # Convert frame to PIL Image
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(rgb_frame)
                
                # Convert to base64
                buffered = BytesIO()
                pil_image.save(buffered, format="JPEG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                # Send to backend for analysis
                try:
                    response = requests.post(
                        FACE_BACKEND_URL,
                        json={"image": f"data:image/jpeg;base64,{img_str}"}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if result.get('success'):
                            current_emotion = result['top_emotion']
                            confidence = result['confidence']
                        else:
                            current_emotion = f"Error: {result.get('error', 'Unknown')}"
                    else:
                        current_emotion = f"HTTP {response.status_code}"
                        
                    last_analysis_time = current_time
                    
                except Exception as e:
                    current_emotion = f"API Error: {str(e)}"
            
            # Display results on frame
            # Add emotion text
            emotion_text = f"Emotion: {current_emotion}"
            confidence_text = f"Confidence: {confidence:.1%}" if isinstance(confidence, float) else ""
            
            # Draw text on frame
            cv2.putText(frame, emotion_text, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            if confidence_text:
                cv2.putText(frame, confidence_text, (10, 60), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Add instructions
            cv2.putText(frame, "Press 'q' to quit", (10, frame.shape[0] - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
            # Display frame
            cv2.imshow('Live Face Emotion Detection', frame)
            
            # Break loop on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Stopping emotion detection...")
    except Exception as e:
        print(f"❌ Error during emotion detection: {e}")
    finally:
        # Release resources
        cap.release()
        cv2.destroyAllWindows()
        print("👋 Webcam session ended")

def main():
    """Main function"""
    print("🔍 Live Face Emotion Detection")
    print("=" * 50)
    print("This tool uses your webcam to detect emotions in real-time")
    print("Make sure the face emotion backend is running on port 5002")
    print("=" * 50)
    
    capture_and_analyze_emotions()

if __name__ == "__main__":
    main()