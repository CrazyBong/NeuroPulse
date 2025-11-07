/**
 * Face Emotion Recognition API Service
 * Connects to Flask backend for face emotion analysis
 * Backend: http://127.0.0.1:5002
 */

const BACKEND_URL = 'http://127.0.0.1:5002/api';

// Types
export interface EmotionPrediction {
  label: string;
  score: number;
}

export interface FaceAnalysisResult {
  success: boolean;
  predictions: EmotionPrediction[];
  top_emotion: string;
  confidence: number;
  image_size?: [number, number];
  error?: string;
}

export interface BatchAnalysisResult {
  success: boolean;
  results: Array<FaceAnalysisResult & { index: number }>;
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

export interface ModelInfo {
  success: boolean;
  model_name: string;
  model_type: string;
  emotions: string[];
  input_size: number | null;
  description: string;
}

// Main API Class
class FaceEmotionAPI {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if backend is online and healthy
   */
  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
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
        type: 'face-emotion-analysis',
      };
    }
  }

  /**
   * Get list of available emotions from backend
   */
  async getEmotions(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/emotions`);
      const data = await response.json();
      return data.emotions || [];
    } catch (error) {
      console.error('Failed to fetch emotions:', error);
      // Fallback emotions
      return ['sad', 'disgust', 'angry', 'neutral', 'fear', 'surprise', 'happy'];
    }
  }

  /**
   * Get detailed model information
   */
  async getModelInfo(): Promise<ModelInfo> {
    try {
      const response = await fetch(`${this.baseURL}/model-info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch model info:', error);
      throw error;
    }
  }

  /**
   * Analyze face image for emotion
   * @param imageBlob - Image blob to analyze
   */
  async analyzeFace(imageBlob: Blob): Promise<FaceAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'face.jpg');

      const response = await fetch(`${this.baseURL}/analyze-face`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Face analysis failed:', error);
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
   * Analyze multiple face images in batch
   * @param imageBlobs - Array of image blobs to analyze (max 20)
   */
  async analyzeBatch(imageBlobs: Blob[]): Promise<BatchAnalysisResult> {
    try {
      if (!imageBlobs || imageBlobs.length === 0) {
        return {
          success: false,
          results: [],
          error: 'images array cannot be empty',
        };
      }

      if (imageBlobs.length > 20) {
        return {
          success: false,
          results: [],
          error: 'Maximum 20 images per batch',
        };
      }

      const formData = new FormData();
      imageBlobs.forEach((blob, index) => {
        formData.append('images', blob, `face_${index}.jpg`);
      });

      const response = await fetch(`${this.baseURL}/analyze-batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch analysis failed:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Batch analysis failed',
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
      sad: '#3b82f6',       // blue
      disgust: '#f97316',    // orange
      angry: '#ef4444',      // red
      neutral: '#6b7280',    // gray
      fear: '#8b5cf6',       // purple
      surprise: '#ec4899',   // pink
      happy: '#fbbf24',      // yellow
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  }

  /**
   * Get emotion emoji (helper method)
   */
  getEmotionEmoji(emotion: string): string {
    const emojis: Record<string, string> = {
      sad: '😢',
      disgust: '🤢',
      angry: '😠',
      neutral: '😐',
      fear: '😨',
      surprise: '😲',
      happy: '😄',
    };
    return emojis[emotion.toLowerCase()] || '😐';
  }
}

// Export singleton instance
export const faceEmotionAPI = new FaceEmotionAPI();

// Also export the class for custom instances
export default FaceEmotionAPI;