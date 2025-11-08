"""
Script to start all NeuroPulse services including the gateway
"""

import subprocess
import time
import os
import sys

def start_service(script_name, service_name, cwd=None):
    """Start a service in the background"""
    try:
        if cwd is None:
            cwd = os.path.dirname(os.path.abspath(__file__))
        
        # Use the current Python interpreter
        process = subprocess.Popen(
            [sys.executable, script_name],
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(f"✅ Started {service_name} (PID: {process.pid})")
        return process
    except Exception as e:
        print(f"❌ Failed to start {service_name}: {e}")
        return None

def main():
    print("🚀 Starting NeuroPulse Backend Services...")
    print("=" * 50)
    
    processes = []
    
    # Start microservices
    print("Starting Microservices...")
    audio_process = start_service("audio_model.py", "Audio Emotion Service")
    if audio_process:
        processes.append(audio_process)
        time.sleep(2)  # Wait for service to start
    
    text_process = start_service("text_model.py", "Text Emotion Service")
    if text_process:
        processes.append(text_process)
        time.sleep(2)  # Wait for service to start
    
    face_process = start_service("face_model.py", "Face Emotion Service")
    if face_process:
        processes.append(face_process)
        time.sleep(2)  # Wait for service to start
    
    # Start gateway
    print("\nStarting API Gateway...")
    gateway_process = start_service("app.py", "API Gateway", cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)), "gateway"))
    if gateway_process:
        processes.append(gateway_process)
    
    print("\n" + "=" * 50)
    if len(processes) == 4:
        print("🎉 All services started successfully!")
        print("Services running in background:")
        print("  - Audio Emotion Service (Port 5000)")
        print("  - Text Emotion Service (Port 5001)")
        print("  - Face Emotion Service (Port 5002)")
        print("  - API Gateway (Port 8000)")
        print("\nPress Ctrl+C to stop all services.")
    else:
        print("⚠️  Some services failed to start.")
        print(f"Started {len(processes)}/4 services.")
    
    print("=" * 50)
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all services...")
        for process in processes:
            try:
                process.terminate()
                process.wait(timeout=5)
                print(f"✅ Stopped process {process.pid}")
            except subprocess.TimeoutExpired:
                process.kill()
                print(f"⚠️  Force killed process {process.pid}")
        
        print("👋 All services stopped. Goodbye!")

if __name__ == "__main__":
    main()