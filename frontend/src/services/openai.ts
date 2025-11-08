// OpenAI service for generating personalized mental health recommendations
// In production, this should call your FastAPI backend which handles OpenAI API calls

export interface MentalHealthTipsRequest {
  stressScore: number;
  primaryEmotion: string;
  emotionBreakdown: {
    label: string;
    score: number;
  }[];
  hasTextAnalysis: boolean;
  hasFaceAnalysis: boolean;
  textStress?: number;
  faceStress?: number;
}

export interface MentalHealthTipsResponse {
  summary: string;
  tips: string[];
  resources: {
    title: string;
    description: string;
  }[];
}

// Call the FastAPI backend to generate mental health tips using LLM
export async function generateMentalHealthTips(
  request: MentalHealthTipsRequest
): Promise<MentalHealthTipsResponse> {
  try {
    console.log('🔍 Calling backend for mental health tips:', request);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('http://127.0.0.1:8000/api/generate-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('📊 Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Mental health tips received:', data);
    return data;
  } catch (error: any) {
    console.error('🔥 Error generating mental health tips:', error);
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.log('⏰ Request timeout - using fallback response');
    }
    
    // Fallback response if backend call fails or times out
    const fallbackResponse = {
      summary: "We've analyzed your emotional state and provided personalized suggestions to support your wellbeing.",
      tips: [
        "Practice deep breathing exercises for 5 minutes daily",
        "Engage in physical activity or stretching",
        "Connect with friends or family members",
        "Maintain a regular sleep schedule",
        "Try mindfulness or meditation techniques"
      ],
      resources: [
        {"title": "Crisis Text Line", "description": "Text HOME to 741741 for free, 24/7 crisis support"},
        {"title": "National Suicide Prevention Lifeline", "description": "Call 988 for 24/7 support"}
      ]
    };
    
    console.log('🔄 Using fallback response:', fallbackResponse);
    return fallbackResponse;
  }
}