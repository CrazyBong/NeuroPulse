/**
 * Test Services
 * Simple script to verify all frontend service implementations
 */

import { textEmotionAPI } from './textEmotionAPI';
import { faceEmotionAPI } from './faceEmotionAPI';
import { audioEmotionAPI } from './audioEmotionAPI';

async function testAllServices() {
  console.log('🔍 Testing Frontend Service Implementations...\n');
  
  // Test Text API
  console.log('📝 Testing Text Emotion API...');
  try {
    const health = await textEmotionAPI.checkHealth();
    console.log(`  Status: ${health.status}`);
    console.log(`  Model: ${health.model}`);
    console.log(`  Emotions: ${health.emotions.length} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  // Test Face API
  console.log('📷 Testing Face Emotion API...');
  try {
    const health = await faceEmotionAPI.checkHealth();
    console.log(`  Status: ${health.status}`);
    console.log(`  Model: ${health.model}`);
    console.log(`  Emotions: ${health.emotions.length} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  // Test Audio API
  console.log('🔊 Testing Audio Emotion API...');
  try {
    const health = await audioEmotionAPI.checkHealth();
    console.log(`  Status: ${health.status}`);
    console.log(`  Model: ${health.model}`);
    console.log(`  Emotions: ${health.emotions.length} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  console.log('✅ Service Implementation Test Complete');
}

// Run the test
testAllServices();