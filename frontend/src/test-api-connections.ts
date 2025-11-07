/**
 * Test API Connections
 * Simple script to verify all backend services are accessible
 */

import { audioAPI } from './services/api';
import { textEmotionAPI } from './services/textEmotionAPI';
import { faceEmotionAPI } from './services/faceEmotionAPI';

async function testAllConnections() {
  console.log('🔍 Testing API Connections...\n');
  
  // Test Audio API
  console.log('🔊 Testing Audio API (Port 5000)...');
  try {
    const audioHealth = await audioAPI.checkHealth();
    console.log(`  Status: ${audioHealth.status}`);
    console.log(`  Emotions: ${audioHealth.emotions?.length || 0} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  // Test Text API
  console.log('📝 Testing Text API (Port 5001)...');
  try {
    const textHealth = await textEmotionAPI.checkHealth();
    console.log(`  Status: ${textHealth.status}`);
    console.log(`  Model: ${textHealth.model}`);
    console.log(`  Emotions: ${textHealth.emotions?.length || 0} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  // Test Face API
  console.log('📷 Testing Face API (Port 5002)...');
  try {
    const faceHealth = await faceEmotionAPI.checkHealth();
    console.log(`  Status: ${faceHealth.status}`);
    console.log(`  Model: ${faceHealth.model}`);
    console.log(`  Emotions: ${faceHealth.emotions?.length || 0} available\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
  
  console.log('✅ API Connection Test Complete');
}

// Run the test
testAllConnections();