/**
 * Fusion API Service
 * Connects to FastAPI gateway for fusion analysis
 * Gateway: http://127.0.0.1:8000
 */

const BACKEND_URL = 'http://127.0.0.1:8000';

// Types
export interface FusionSource {
  success: boolean;
  predictions: Array<{ label: string; score: number }>;
  top_emotion: string;
  confidence: number;
  error?: string;
  [key: string]: any; // Allow additional properties
}

export interface FusionResult {
  success: boolean;
  combined_emotion: string;
  confidence: number;
  predictions: Record<string, number> | Array<{ label: string; score: number }>;
  sources: {
    text?: FusionSource | null;
    face?: FusionSource | null;
    audio?: FusionSource | null;
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

// Main API Class
class FusionAPI {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Perform fusion analysis with pre-analyzed results
   * @param textResult - Text analysis result (optional)
   * @param faceResult - Face analysis result (optional)
   * @param audioResult - Audio analysis result (optional)
   */
  async analyzeFusion(
    textResult?: FusionSource | null,
    faceResult?: FusionSource | null,
    audioResult?: FusionSource | null
  ): Promise<FusionResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/fusion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_result: textResult || null,
          face_result: faceResult || null,
          audio_result: audioResult || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Fusion analysis failed:', error);
      return {
        success: false,
        combined_emotion: 'neutral',
        confidence: 0,
        predictions: {},
        sources: {},
        weights: { text: 0, face: 0, audio: 0 },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Test the connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fusionAPI = new FusionAPI();

// Also export the class for custom instances
export default FusionAPI;