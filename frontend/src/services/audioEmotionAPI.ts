/**
 * Audio Emotion Recognition API Service
 * Connects to Flask backend for audio emotion analysis
 * Backend: http://127.0.0.1:5000
 */

const BACKEND_URL = 'http://127.0.0.1:8000';

// Types
export interface EmotionPrediction {
  label: string;
  score: number;
}

export interface AudioAnalysisResult {
  success: boolean;
  predictions: EmotionPrediction[];
  top_emotion: string;
  confidence: number;
  duration?: number;
  error?: string;
}

export interface BatchAnalysisResult {
  success: boolean;
  results: Array<AudioAnalysisResult & { index: number }>;
  total?: number;
  error?: string;
}

export interface BackendHealthResponse {
  status: 'healthy' | 'model_not_loaded';
  model: string;
  emotions: string[];
  timestamp: string;
  type: string;
}

// Main API Class
class AudioEmotionAPI {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if backend is online and healthy
   */
  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'model_not_loaded',
        model: '',
        emotions: [],
        timestamp: new Date().toISOString(),
        type: 'audio-emotion-analysis',
      };
    }
  }

  /**
   * Get list of available emotions from backend
   */
  async getEmotions(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/emotions`);
      const data = await response.json();
      return data.emotions || [];
    } catch (error) {
      console.error('Failed to fetch emotions:', error);
      // Fallback emotions
      return ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];
    }
  }

  /**
   * Get available audio devices
   */
  async getAudioDevices(): Promise<{ success: boolean; devices: any[] }> {
    try {
      const response = await fetch(`${this.baseURL}/api/audio/devices`);
      const result = await response.json();
      // Handle gateway response format
      if (result.result) {
        return result.result;
      }
      return result;
    } catch (error) {
      console.error('Failed to fetch audio devices:', error);
      return { success: false, devices: [] };
    }
  }

  /**
   * Record audio and predict emotion
   */
  async recordAndPredict(): Promise<AudioAnalysisResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'record' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      // Handle gateway response format
      if (result.result) {
        return result.result;
      }
      return result;
    } catch (error) {
      console.error('Audio recording and prediction failed:', error);
      return {
        success: false,
        predictions: [],
        top_emotion: 'neutral',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload audio file and predict emotion
   * @param audioBlob - Audio file blob to analyze
   */
  async uploadAndPredict(audioBlob: Blob): Promise<AudioAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const response = await fetch(`${this.baseURL}/api/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      // Handle gateway response format
      if (result.result && result.result.status === 'success') {
        return result.result.data;
      } else if (result.result && result.result.status === 'error') {
        throw new Error(result.result.error);
      }
      return result;
    } catch (error) {
      console.error('Audio upload and prediction failed:', error);
      return {
        success: false,
        predictions: [],
        top_emotion: 'neutral',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Predict emotion from raw audio data
   * @param audioData - Raw audio data
   */
  async predictFromData(audioData: ArrayBuffer): Promise<AudioAnalysisResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/audio/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: audioData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      // Handle gateway response format
      if (result.result) {
        return result.result;
      }
      return result;
    } catch (error) {
      console.error('Audio data prediction failed:', error);
      return {
        success: false,
        predictions: [],
        top_emotion: 'neutral',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Test the connection to backend
   */
  async testConnection(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === 'healthy';
  }

  /**
   * Get emotion color for UI (helper method)
   */
  getEmotionColor(emotion: string): string {
    const colors: Record<string, string> = {
      angry: '#ef4444',      // red
      calm: '#8b5cf6',       // purple
      disgust: '#f97316',    // orange
      fearful: '#8b5cf6',    // purple
      happy: '#fbbf24',      // yellow
      neutral: '#6b7280',    // gray
      sad: '#3b82f6',        // blue
      surprised: '#ec4899',  // pink
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  }

  /**
   * Get emotion emoji (helper method)
   */
  getEmotionEmoji(emotion: string): string {
    const emojis: Record<string, string> = {
      angry: '😠',
      calm: '😌',
      disgust: '🤢',
      fearful: '😨',
      happy: '😄',
      neutral: '😐',
      sad: '😢',
      surprised: '😲',
    };
    return emojis[emotion.toLowerCase()] || '😐';
  }
}

// Export singleton instance
export const audioEmotionAPI = new AudioEmotionAPI();

// Also export the class for custom instances
export default AudioEmotionAPI;