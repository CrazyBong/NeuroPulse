// Mock API service layer for NeuroPulse
// In production, these would call the FastAPI backend endpoints

export interface TextEmotionResponse {
  emotions: {
    label: string;
    score: number;
  }[];
  stress_score: number;
  shap_explanation: {
    token: string;
    importance: number;
  }[];
}

export interface FaceEmotionResponse {
  emotion: string;
  confidence: number;
  stress_mapping?: number;
  detailed_emotions?: Record<string, number>;
  all_emotions?: {
    label: string;
    score: number;
  }[];
}

export interface FusionResponse {
  combined_stress_score: number;
  primary_emotion: string;
  confidence: number;
  breakdown: {
    text_stress: number;
    face_stress: number;
    text_weight: number;
    face_weight: number;
  };
  emotions: {
    label: string;
    score: number;
  }[];
  shap_explanation: {
    token: string;
    importance: number;
  }[];
}

// Mock text emotion inference
export async function analyzeText(text: string): Promise<TextEmotionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  // Mock emotion detection based on keywords
  const emotions = [
    { label: 'joy', score: 0 },
    { label: 'sadness', score: 0 },
    { label: 'anger', score: 0 },
    { label: 'fear', score: 0 },
    { label: 'surprise', score: 0 },
    { label: 'neutral', score: 0 },
  ];
  
  const lowerText = text.toLowerCase();
  
  // Simple keyword matching for demo
  if (lowerText.match(/happy|joy|great|wonderful|amazing|love|excited/)) {
    emotions[0].score = 0.7 + Math.random() * 0.25;
  } else if (lowerText.match(/sad|depressed|down|unhappy|disappointed/)) {
    emotions[1].score = 0.6 + Math.random() * 0.3;
  } else if (lowerText.match(/angry|mad|furious|hate|annoyed/)) {
    emotions[2].score = 0.65 + Math.random() * 0.3;
  } else if (lowerText.match(/scared|afraid|anxious|worried|nervous/)) {
    emotions[3].score = 0.6 + Math.random() * 0.35;
  } else if (lowerText.match(/wow|surprised|shocked|unexpected/)) {
    emotions[4].score = 0.55 + Math.random() * 0.3;
  } else {
    emotions[5].score = 0.5 + Math.random() * 0.3;
  }
  
  // Fill remaining with smaller values
  emotions.forEach(e => {
    if (e.score === 0) {
      e.score = Math.random() * 0.2;
    }
  });
  
  // Normalize
  const total = emotions.reduce((sum, e) => sum + e.score, 0);
  emotions.forEach(e => e.score = e.score / total);
  
  // Calculate stress score (anger + fear + sadness weighted)
  const stress_score = (emotions[2].score * 0.8 + emotions[3].score * 0.9 + emotions[1].score * 0.6);
  
  // Generate SHAP explanations
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const shap_explanation = words.map(token => ({
    token,
    importance: (Math.random() - 0.5) * 2 // Range -1 to 1
  })).sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance)).slice(0, Math.min(10, words.length));
  
  return {
    emotions: emotions.sort((a, b) => b.score - a.score),
    stress_score,
    shap_explanation
  };
}

// Mock face emotion inference
export async function analyzeFace(imageBlob: Blob): Promise<FaceEmotionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  
  const emotionsList = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];
  const primaryIdx = Math.floor(Math.random() * emotionsList.length);
  const primary = emotionsList[primaryIdx];
  
  const all_emotions = emotionsList.map((label, idx) => ({
    label,
    score: idx === primaryIdx ? 0.5 + Math.random() * 0.4 : Math.random() * 0.3
  }));
  
  // Normalize
  const total = all_emotions.reduce((sum, e) => sum + e.score, 0);
  all_emotions.forEach(e => e.score = e.score / total);
  
  const primaryEmotion = all_emotions.find(e => e.label === primary)!;
  
  // Map to stress
  const stressMap: Record<string, number> = {
    joy: 0.1,
    sadness: 0.6,
    anger: 0.8,
    fear: 0.85,
    surprise: 0.3,
    neutral: 0.2
  };
  
  const detailed_emotions: Record<string, number> = {};
  all_emotions.forEach(e => {
    detailed_emotions[e.label] = e.score;
  });

  return {
    emotion: primary,
    confidence: primaryEmotion.score,
    stress_mapping: stressMap[primary] + (Math.random() - 0.5) * 0.1,
    detailed_emotions,
    all_emotions: all_emotions.sort((a, b) => b.score - a.score)
  };
}

// Optimized: Parallel processing for text and face analysis
export async function analyzeFusion(text: string, faceImage?: Blob): Promise<FusionResponse> {
  // Run text and face analysis in parallel for better performance
  const [textResult, faceResult] = await Promise.all([
    analyzeText(text),
    faceImage ? analyzeFace(faceImage) : Promise.resolve(null)
  ]);
  
  const text_weight = faceImage ? 0.6 : 1.0;
  const face_weight = faceImage ? 0.4 : 0.0;
  
  const combined_stress_score = faceResult
    ? textResult.stress_score * text_weight + faceResult.stress_mapping * face_weight
    : textResult.stress_score;
  
  // Merge emotions
  const emotionMap = new Map<string, number>();
  
  textResult.emotions.forEach(e => {
    emotionMap.set(e.label, (emotionMap.get(e.label) || 0) + e.score * text_weight);
  });
  
  if (faceResult && faceResult.all_emotions) {
    faceResult.all_emotions.forEach(e => {
      emotionMap.set(e.label, (emotionMap.get(e.label) || 0) + e.score * face_weight);
    });
  }
  
  const emotions = Array.from(emotionMap.entries())
    .map(([label, score]) => ({ label, score }))
    .sort((a, b) => b.score - a.score);
  
  return {
    combined_stress_score,
    primary_emotion: emotions[0].label,
    confidence: emotions[0].score,
    breakdown: {
      text_stress: textResult.stress_score,
      face_stress: faceResult?.stress_mapping || 0,
      text_weight,
      face_weight
    },
    emotions,
    shap_explanation: textResult.shap_explanation
  };
}
