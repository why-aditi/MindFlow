#!/usr/bin/env node
/**
 * Backend startup script with dependency checks
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

async function checkDependencies() {
  console.log('🔍 Checking backend dependencies...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  const requiredEnvVars = [
    'MONGODB_URI',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'GEMINI_API_KEY'
  ];

  const missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nPlease add these to your .env file\n');
    return false;
  }
  console.log('✅ All required environment variables found\n');

  // Check MongoDB connection
  console.log('2. Checking MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log(`   ${error.message}\n`);
    return false;
  }

  // Check Gemini API
  console.log('3. Checking Gemini API...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('✅ Gemini API key valid\n');
  } catch (error) {
    console.log('❌ Gemini API check failed:');
    console.log(`   ${error.message}\n`);
    return false;
  }

  return true;
}

async function startBackend() {
  console.log('🚀 Starting MindFlow Backend...\n');

  const dependenciesOk = await checkDependencies();
  
  if (!dependenciesOk) {
    console.log('❌ Dependency check failed. Please fix the issues above before starting the backend.');
    process.exit(1);
  }

  console.log('✅ All dependencies check passed!');
  console.log('🎯 Starting the backend server...\n');

  // Import and start the server
  try {
    const { default: app } = await import('./server.js');
    console.log('✅ Backend server started successfully!');
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Run the startup process
startBackend().catch(console.error);
