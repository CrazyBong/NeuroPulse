/**
 * Test script for Face Emotion Recognition API
 * Run this to verify backend connection
 */

import { faceEmotionAPI } from '../frontend/src/services/faceEmotionAPI';

// Test 1: Check Backend Health
export async function testHealth() {
  console.log('🔍 Testing face backend health...');
  const health = await faceEmotionAPI.checkHealth();
  
  if (health.status === 'healthy') {
    console.log('✅ Backend is ONLINE');
    console.log('📊 Model:', health.model);
    console.log('😊 Available emotions:', health.emotions);
    console.log('📅 Timestamp:', health.timestamp);
  } else {
    console.log('❌ Backend is OFFLINE');
  }
  
  return health;
}

// Test 2: Get Model Info
export async function testModelInfo() {
  console.log('\n📖 Fetching model information...');
  try {
    const info = await faceEmotionAPI.getModelInfo();
    console.log('✅ Model Info:');
    console.log('  - Name:', info.model_name);
    console.log('  - Type:', info.model_type);
    console.log('  - Emotions:', info.emotions.join(', '));
    return info;
  } catch (error) {
    console.log('❌ Failed to fetch model info');
    return null;
  }
}

// Test 3: Get Available Emotions
export async function testEmotions() {
  console.log('\n🎭 Fetching available emotions...');
  const emotions = await faceEmotionAPI.getEmotions();
  console.log('✅ Emotions:', emotions);
  return emotions;
}

// Test 4: Test Connection
export async function testConnection() {
  console.log('\n🔌 Testing connection...');
  const isConnected = await faceEmotionAPI.testConnection();
  console.log(isConnected ? '✅ Connected!' : '❌ Not connected');
  return isConnected;
}

// Run All Tests
export async function runAllTests() {
  console.log('🧪 Running Face Emotion API Tests...\n');
  console.log('═'.repeat(60));
  
  await testHealth();
  await testModelInfo();
  await testEmotions();
  await testConnection();
  
  console.log('\n' + '═'.repeat(60));
  console.log('✨ All tests complete!');
  console.log('\n💡 Usage in your app:');
  console.log('   import { faceEmotionAPI } from "./faceEmotionAPI";');
  console.log('   const result = await faceEmotionAPI.analyzeFace(imageFile);');
}

// Export everything
export { faceEmotionAPI } from '../frontend/src/services/faceEmotionAPI';