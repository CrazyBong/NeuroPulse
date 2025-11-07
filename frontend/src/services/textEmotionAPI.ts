/**
 * Text Emotion Recognition API Service
 * Connects to Flask backend for text emotion analysis
 * Backend: http://127.0.0.1:5001
 */

const BACKEND_URL = import.meta.env.VITE_TEXT_BACKEND_URL || 'http://127.0.0.1:5001/api';

// Types
export interface EmotionPrediction {
  label: string;
  score: number;
}

export interface TextAnalysisResult {
  success: boolean;
  predictions: EmotionPrediction[];
  top_emotion: string;
  confidence: number;
  text_length?: number;
  error?: string;
}

export interface BatchAnalysisResult {
  success: boolean;
  results: Array<TextAnalysisResult & { index: number }>;
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
  max_length: number;
  language: string;
  description: string;
}

// Main API Class
class TextEmotionAPI {
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
        type: 'text-emotion-analysis',
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
      return ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise'];
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
   * Analyze text for emotion
   * @param text - Text to analyze (max 5000 characters)
   */
  async analyzeText(text: string): Promise<TextAnalysisResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          predictions: [],
          top_emotion: 'neutral',
          confidence: 0,
          error: 'Text cannot be empty',
        };
      }

      if (text.length > 5000) {
        return {
          success: false,
          predictions: [],
          top_emotion: 'neutral',
          confidence: 0,
          error: 'Text too long (max 5000 characters)',
        };
      }

      const response = await fetch(`${this.baseURL}/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Text analysis failed:', error);
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
   * Analyze multiple texts in batch
   * @param texts - Array of texts to analyze (max 50)
   */
  async analyzeBatch(texts: string[]): Promise<BatchAnalysisResult> {
    try {
      if (!texts || texts.length === 0) {
        return {
          success: false,
          results: [],
          error: 'texts array cannot be empty',
        };
      }

      if (texts.length > 50) {
        return {
          success: false,
          results: [],
          error: 'Maximum 50 texts per batch',
        };
      }

      const response = await fetch(`${this.baseURL}/analyze-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts }),
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
      anger: '#ef4444',      // red
      disgust: '#f97316',    // orange
      fear: '#8b5cf6',       // purple
      joy: '#fbbf24',        // yellow
      neutral: '#6b7280',    // gray
      sadness: '#3b82f6',    // blue
      surprise: '#ec4899',   // pink
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  }

  /**
   * Get emotion emoji (helper method)
   */
  getEmotionEmoji(emotion: string): string {
    const emojis: Record<string, string> = {
      anger: '😠',
      disgust: '🤢',
      fear: '😨',
      joy: '😄',
      neutral: '😐',
      sadness: '😢',
      surprise: '😲',
    };
    return emojis[emotion.toLowerCase()] || '😐';
  }
}

// Export singleton instance
export const textEmotionAPI = new TextEmotionAPI();

// Also export the class for custom instances
export default TextEmotionAPI;