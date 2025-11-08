import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'gateway'))

# Add services directory to path
services_path = os.path.join(os.path.dirname(__file__), 'backend', 'gateway', 'services')
sys.path.append(services_path)

try:
    from llm_service import generate_mental_health_tips
    
    print("Testing generate_mental_health_tips function...")
    
    # Test data
    result = generate_mental_health_tips(
        stress_score=1.0,
        primary_emotion="sadness",
        emotion_breakdown=[{"label": "sadness", "score": 0.71}],
        has_text_analysis=True,
        has_face_analysis=False,
        text_stress=1.0,
        face_stress=0
    )
    
    print("Result:")
    print(result)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()