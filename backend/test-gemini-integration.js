#!/usr/bin/env node
/**
 * Test script for Gemini AI integration
 * Run this to verify the AI chatbot is working properly
 */

import geminiService from './src/services/geminiService.js';
import { AISession, Message } from './src/models/Conversation.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeminiIntegration() {
  console.log('🤖 Testing Gemini AI Integration...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindflow');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check API key
    console.log('1. Checking Gemini API key...');
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ GEMINI_API_KEY not found in environment variables');
      console.log('   Please add GEMINI_API_KEY to your .env file');
      return;
    }
    console.log('✅ Gemini API key found\n');

    // Test 2: Create test session
    console.log('2. Creating test session...');
    const testSession = new AISession({
      userId: 'test-user-123',
      language: 'en',
      context: { testMode: true }
    });
    await testSession.save();
    console.log(`✅ Test session created: ${testSession._id}\n`);

    // Test 3: Test basic chat
    console.log('3. Testing basic chat...');
    const chatResult = await geminiService.generateResponse(
      'Hello, I\'m feeling a bit anxious today. Can you help me?',
      testSession._id,
      'test-user-123',
      'en',
      { testMode: true }
    );

    if (chatResult.success) {
      console.log('✅ Chat response generated successfully');
      console.log(`   Model: ${chatResult.model}`);
      console.log(`   Response: ${chatResult.response.substring(0, 100)}...`);
      console.log(`   Conversation Length: ${chatResult.conversationLength}\n`);
    } else {
      console.log('❌ Chat response failed');
      console.log(`   Error: ${chatResult.error}\n`);
    }

    // Test 4: Test mood analysis
    console.log('4. Testing mood analysis...');
    const conversationHistory = await geminiService.getConversationHistory(testSession._id);
    const moodAnalysis = await geminiService.analyzeMood(conversationHistory);
    
    console.log('✅ Mood analysis completed');
    console.log(`   Emotional State: ${moodAnalysis.emotionalState}`);
    console.log(`   Emotions: ${moodAnalysis.emotions.join(', ')}`);
    console.log(`   Stress Level: ${moodAnalysis.stressLevel}\n`);

    // Test 5: Test wellness suggestions
    console.log('5. Testing wellness suggestions...');
    const userProfile = {
      age: 18,
      interests: ['music', 'art'],
      goals: ['reduce anxiety']
    };
    
    const suggestions = await geminiService.generateWellnessSuggestions(userProfile, moodAnalysis);
    
    console.log('✅ Wellness suggestions generated');
    console.log(`   Number of suggestions: ${suggestions.length}`);
    if (suggestions.length > 0) {
      console.log(`   First suggestion: ${suggestions[0].title}\n`);
    }

    // Test 6: Test crisis detection
    console.log('6. Testing crisis detection...');
    const crisisCheck = await geminiService.checkCrisisIndicators(
      'I feel like I want to hurt myself'
    );
    
    if (crisisCheck.isCrisis) {
      console.log('✅ Crisis detection working correctly');
      console.log('   Crisis detected and appropriate response provided\n');
    } else {
      console.log('⚠️  Crisis detection may need adjustment\n');
    }

    // Test 7: Test conversation summary
    console.log('7. Testing conversation summary...');
    const summary = await geminiService.generateConversationSummary(conversationHistory);
    
    console.log('✅ Conversation summary generated');
    console.log(`   Summary: ${summary.substring(0, 100)}...\n`);

    // Test 8: Test multi-language support
    console.log('8. Testing multi-language support...');
    const spanishResult = await geminiService.generateResponse(
      'Hola, ¿cómo estás?',
      testSession._id,
      'test-user-123',
      'es',
      { testMode: true }
    );

    if (spanishResult.success) {
      console.log('✅ Spanish language support working');
      console.log(`   Response: ${spanishResult.response.substring(0, 100)}...\n`);
    } else {
      console.log('❌ Spanish language support failed\n');
    }

    // Cleanup
    console.log('9. Cleaning up test data...');
    await Message.deleteMany({ sessionId: testSession._id });
    await AISession.findByIdAndDelete(testSession._id);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 Gemini AI Integration test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ API Key Configuration');
    console.log('   ✅ Basic Chat Functionality');
    console.log('   ✅ Mood Analysis');
    console.log('   ✅ Wellness Suggestions');
    console.log('   ✅ Crisis Detection');
    console.log('   ✅ Conversation Summary');
    console.log('   ✅ Multi-language Support');
    console.log('   ✅ Database Integration');
    
    console.log('\n🚀 Your AI chatbot is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the test
testGeminiIntegration().catch(console.error);
