// Test file to verify the frontend service is working
import { generateMentalHealthTips } from './frontend/src/services/openai';

async function testService() {
  console.log('Testing mental health tips generation...');
  
  const testData = {
    stressScore: 1.0,
    primaryEmotion: 'sadness',
    emotionBreakdown: [
      { label: 'sadness', score: 0.71 },
      { label: 'fear', score: 0.22 },
      { label: 'anger', score: 0.05 },
      { label: 'disgust', score: 0.03 },
      { label: 'neutral', score: 0.01 }
    ],
    hasTextAnalysis: true,
    hasFaceAnalysis: false,
    textStress: 1.0,
    faceStress: 0
  };
  
  try {
    const result = await generateMentalHealthTips(testData);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testService();