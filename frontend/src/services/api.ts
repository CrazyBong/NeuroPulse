// NeuroPulse API Service Layer
// Connects to Flask backend services for emotion analysis

import { textEmotionAPI } from './textEmotionAPI';
import { faceEmotionAPI } from './faceEmotionAPI';
import { audioEmotionAPI } from './audioEmotionAPI';

// Unified response interfaces
export interface TextEmotionResponse {
  success: boolean;
  predictions: {
    label: string;
    score: number;
  }[];
  top_emotion: string;
  confidence: number;
  text_length?: number;
  error?: string;
}

export interface FaceEmotionResponse {
  success: boolean;
  predictions: {
    label: string;
    score: number;
  }[];
  top_emotion: string;
  confidence: number;
  image_size?: [number, number];
  error?: string;
}

export interface AudioEmotionResponse {
  success: boolean;
  predictions: {
    label: string;
    score: number;
  }[];
  top_emotion: string;
  confidence: number;
  duration?: number;
  error?: string;
}

export interface FusionResponse {
  success: boolean;
  combined_emotion: string;
  confidence: number;
  predictions: {
    label: string;
    score: number;
  }[];
  sources: {
    text?: TextEmotionResponse;
    face?: FaceEmotionResponse;
    audio?: AudioEmotionResponse;
  };
  weights: {
    text: number;
    face: number;
    audio: number;
  };
  stress?: number;
  llm_summary?: string;
  error?: string;
}

// Text emotion analysis
export async function analyzeText(text: string): Promise<TextEmotionResponse> {
  try {
    // Use real backend service
    return await textEmotionAPI.analyzeText(text);
  } catch (error) {
    console.error('Text analysis failed:', error);
    return {
      success: false,
      predictions: [],
      top_emotion: 'neutral',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Face emotion analysis
export async function analyzeFace(imageBlob: Blob): Promise<FaceEmotionResponse> {
  try {
    // Use real backend service
    return await faceEmotionAPI.analyzeFace(imageBlob);
  } catch (error) {
    console.error('Face analysis failed:', error);
    return {
      success: false,
      predictions: [],
      top_emotion: 'neutral',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Audio emotion analysis
export async function analyzeAudio(audioBlob: Blob): Promise<AudioEmotionResponse> {
  try {
    // Use real backend service
    return await audioEmotionAPI.uploadAndPredict(audioBlob);
  } catch (error) {
    console.error('Audio analysis failed:', error);
    return {
      success: false,
      predictions: [],
      top_emotion: 'neutral',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Fusion analysis combining multiple emotion sources
export async function analyzeFusion(
  text?: string, 
  faceImage?: Blob, 
  audioBlob?: Blob
): Promise<FusionResponse> {
  try {
    // Run all analyses in parallel
    const textPromise = text ? analyzeText(text) : Promise.resolve(null);
    const facePromise = faceImage ? analyzeFace(faceImage) : Promise.resolve(null);
    const audioPromise = audioBlob ? analyzeAudio(audioBlob) : Promise.resolve(null);

    const [textResult, faceResult, audioResult] = await Promise.all([
      textPromise,
      facePromise,
      audioPromise
    ]);

    return fuseResults(textResult, faceResult, audioResult);
  } catch (error) {
    console.error('Fusion analysis failed:', error);
    return {
      success: false,
      combined_emotion: 'neutral',
      confidence: 0,
      predictions: [],
      sources: {},
      weights: { text: 0, face: 0, audio: 0 },
      error: error instanceof Error ? error.message : 'Fusion analysis failed'
    };
  }
}

// New function to fuse pre-analyzed results
export async function fusePreAnalyzedResults(
  textResult: TextEmotionResponse | null,
  faceResult: FaceEmotionResponse | null,
  audioResult: AudioEmotionResponse | null
): Promise<FusionResponse> {
  try {
    return fuseResults(textResult, faceResult, audioResult);
  } catch (error) {
    console.error('Fusion analysis failed:', error);
    return {
      success: false,
      combined_emotion: 'neutral',
      confidence: 0,
      predictions: [],
      sources: {},
      weights: { text: 0, face: 0, audio: 0 },
      error: error instanceof Error ? error.message : 'Fusion analysis failed'
    };
  }
}

// Helper function to perform the actual fusion logic
function fuseResults(
  textResult: TextEmotionResponse | null,
  faceResult: FaceEmotionResponse | null,
  audioResult: AudioEmotionResponse | null
): FusionResponse {
  // Calculate weights (adjust as needed)
  const textWeight = textResult?.success ? 0.4 : 0;
  const faceWeight = faceResult?.success ? 0.4 : 0;
  const audioWeight = audioResult?.success ? 0.2 : 0;
  
  const totalWeight = textWeight + faceWeight + audioWeight;
  
  // Handle case where no sources are available
  if (totalWeight === 0) {
    return {
      success: true,
      combined_emotion: 'neutral',
      confidence: 0.5,
      predictions: [{ label: 'neutral', score: 1.0 }],
      sources: {},
      weights: { text: 0, face: 0, audio: 0 }
    };
  }

  // Normalize weights
  const normalizedTextWeight = textWeight / totalWeight;
  const normalizedFaceWeight = faceWeight / totalWeight;
  const normalizedAudioWeight = audioWeight / totalWeight;

  // Combine predictions
  const emotionMap = new Map<string, number>();

  if (textResult?.success) {
    textResult.predictions.forEach(pred => {
      const currentScore = emotionMap.get(pred.label) || 0;
      emotionMap.set(pred.label, currentScore + pred.score * normalizedTextWeight);
    });
  }

  if (faceResult?.success) {
    faceResult.predictions.forEach(pred => {
      const currentScore = emotionMap.get(pred.label) || 0;
      emotionMap.set(pred.label, currentScore + pred.score * normalizedFaceWeight);
    });
  }

  if (audioResult?.success) {
    audioResult.predictions.forEach(pred => {
      const currentScore = emotionMap.get(pred.label) || 0;
      emotionMap.set(pred.label, currentScore + pred.score * normalizedAudioWeight);
    });
  }

  // Convert to array and sort
  const predictions = Array.from(emotionMap.entries())
    .map(([label, score]) => ({ label, score }))
    .sort((a, b) => b.score - a.score);

  return {
    success: true,
    combined_emotion: predictions[0]?.label || 'neutral',
    confidence: predictions[0]?.score || 0.5,
    predictions,
    sources: {
      text: textResult || undefined,
      face: faceResult || undefined,
      audio: audioResult || undefined
    },
    weights: {
      text: normalizedTextWeight,
      face: normalizedFaceWeight,
      audio: normalizedAudioWeight
    }
  };
}
