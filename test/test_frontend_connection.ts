// Simple test to verify frontend can connect to backend
async function testConnection() {
  console.log('🔍 Testing connection to backend...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://127.0.0.1:8000/api/health');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
    
    // Test generate-tips endpoint with sample data
    const testData = {
      stressScore: 0.8,
      primaryEmotion: 'sadness',
      emotionBreakdown: [
        { label: 'sadness', score: 0.8 },
        { label: 'neutral', score: 0.2 }
      ],
      hasTextAnalysis: true,
      hasFaceAnalysis: false,
      textStress: 0.8,
      faceStress: 0
    };
    
    console.log('Sending test data:', testData);
    
    const tipsResponse = await fetch('http://127.0.0.1:8000/api/generate-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Tips response status:', tipsResponse.status);
    
    if (tipsResponse.ok) {
      const tipsData = await tipsResponse.json();
      console.log('Tips data:', tipsData);
    } else {
      console.error('Tips response error:', await tipsResponse.text());
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

// Run the test
testConnection();