import os
from dotenv import load_dotenv
from openai import OpenAI
import traceback

# Load environment variables
load_dotenv()

# Debug: Print environment loading status
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ OPENAI_API_KEY loaded successfully")
else:
    print("⚠️  OPENAI_API_KEY not found in environment")

# Initialize OpenAI client (uses OPENAI_API_KEY environment variable automatically)
client = OpenAI()

def generate_emotion_summary(predictions):
    """
    Generate an emotional summary using OpenAI based on emotion predictions
    
    Args:
        predictions (dict): Dictionary containing emotion analysis results
        Format:
        {
            "text": {...},
            "audio": {...},
            "face": {...},
            "stress": 0.68
        }
    
    Returns:
        str: AI-generated emotional summary
    """
    
    # Debug: Print input data
    print(f"🔍 LLM Service Input - Stress: {predictions.get('stress', 0) * 100:.0f}%")
    print(f"   Text Analysis: {predictions.get('text') is not None}")
    print(f"   Face Analysis: {predictions.get('face') is not None}")
    print(f"   Audio Analysis: {predictions.get('audio') is not None}")
    
    # Create a more detailed prompt with specific instructions
    prompt = f"""
    You are an emotion-analysis specialist and mental health wellbeing assistant.
    
    Here are the user's emotion analysis results:
    - Overall Stress Level: {predictions.get('stress', 0) * 100:.0f}%
    - Text Analysis: {predictions.get('text', {})}
    - Audio Analysis: {predictions.get('audio', {})}
    - Face Analysis: {predictions.get('face', {})}
    
    Please provide:
    1. A short emotional summary (2-3 sentences) that explains the user's overall emotional state
    2. Stress level interpretation (what this stress level means for their wellbeing)
    3. 3 personalized, actionable suggestions to improve their emotional state
    4. Keep the tone supportive, friendly, and positive
    5. Do not use technical terms or jargon
    6. Focus on practical advice
    
    Format your response as plain text without markdown or special formatting.
    """

    try:
        print("🚀 Calling OpenAI API...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using gpt-3.5-turbo as it's more cost-effective and sufficient for this task
            messages=[
                {"role": "system", "content": "You are a helpful emotional wellbeing assistant that provides supportive and practical advice."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,  # Balanced creativity and consistency
            max_tokens=300  # Limit response length
        )
        
        # Debug: Print response structure
        print("✅ OpenAI API call successful")
        print(f"   Response type: {type(response)}")
        print(f"   Choices count: {len(response.choices) if hasattr(response, 'choices') else 'N/A'}")
        
        content = response.choices[0].message.content
        result = content.strip() if content else "We've analyzed your emotions and stress levels. Taking deep breaths, practicing mindfulness, and engaging in activities you enjoy can help improve your emotional wellbeing. If you're feeling overwhelmed, consider talking to a friend or mental health professional."
        
        print(f"✅ LLM Summary generated ({len(result)} chars)")
        return result
    except Exception as e:
        print("🔥 LLM_SERVICE ERROR:", str(e))
        print("📋 Full traceback:")
        traceback.print_exc()
        # Return a default message if LLM fails
        return "We've analyzed your emotions and stress levels. Taking deep breaths, practicing mindfulness, and engaging in activities you enjoy can help improve your emotional wellbeing. If you're feeling overwhelmed, consider talking to a friend or mental health professional."

def generate_mental_health_tips(stress_score, primary_emotion, emotion_breakdown, 
                              has_text_analysis=False, has_face_analysis=False, 
                              text_stress=0, face_stress=0):
    """
    Generate personalized mental health tips based on emotion analysis
    
    Args:
        stress_score (float): Overall stress score (0-1)
        primary_emotion (str): Primary detected emotion
        emotion_breakdown (dict/list): Detailed emotion breakdown
        has_text_analysis (bool): Whether text analysis was performed
        has_face_analysis (bool): Whether face analysis was performed
        text_stress (float): Stress from text analysis (0-1)
        face_stress (float): Stress from face analysis (0-1)
    
    Returns:
        dict: Structured mental health tips with summary, tips list, and resources
    """
    
    prompt = f"""
    You are a mental health wellbeing expert. Based on the following emotional analysis:
    
    OVERALL RESULTS:
    - Primary Emotion: {primary_emotion}
    - Overall Stress Level: {stress_score * 100:.0f}%
    
    DETAILED BREAKDOWN:
    - Emotion Distribution: {emotion_breakdown}
    - Text Analysis Performed: {"Yes" if has_text_analysis else "No"} (Stress: {text_stress * 100:.0f}%)
    - Face Analysis Performed: {"Yes" if has_face_analysis else "No"} (Stress: {face_stress * 100:.0f}%)
    
    Please provide:
    1. A brief, encouraging summary (1-2 sentences) about their emotional state
    2. 4-5 personalized, practical tips for managing their emotions and stress
    3. 2-3 professional resources or helplines if stress is high (>70%)
    
    Format your response as JSON with this exact structure:
    {{
        "summary": "string",
        "tips": ["string", "string", ...],
        "resources": [
            {{"title": "string", "description": "string"}},
            ...
        ]
    }}
    
    Keep the tone supportive, non-clinical, and focused on self-care.
    If stress is low (<30%), focus on maintaining positive habits.
    If stress is moderate (30-70%), provide coping strategies.
    If stress is high (>70%), include crisis resources.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a mental health wellbeing expert providing practical, supportive advice."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        return content.strip() if content else {
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
    except Exception as e:
        # Return default structured response if LLM fails
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