@echo off
echo Starting NeuroPulse Backend Services...
echo ======================================

echo Starting Audio Emotion Analysis (Port 5000)...
start "Audio Backend" /D "c:\Users\Lenovo\NeuroPulse\backend" cmd /k "python audio_model.py"

timeout /t 5

echo Starting Text Emotion Analysis (Port 5001)...
start "Text Backend" /D "c:\Users\Lenovo\NeuroPulse\backend" cmd /k "python text_model.py"

timeout /t 5

echo Starting Face Emotion Analysis (Port 5002)...
start "Face Backend" /D "c:\Users\Lenovo\NeuroPulse\backend" cmd /k "python face_model.py"

timeout /t 5

echo Starting API Gateway (Port 8000)...
start "API Gateway" /D "c:\Users\Lenovo\NeuroPulse\backend\gateway" cmd /k "python app.py"

echo All services started. Check the individual command windows for status.
echo Press any key to close this window...
pause >nul