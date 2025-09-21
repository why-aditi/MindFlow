# 🌊 MindFlow - Youth Mental Wellness Platform

<div align="center">

![MindFlow Logo](https://img.shields.io/badge/MindFlow-Youth%20Wellness-purple?style=for-the-badge&logo=heart)

**A comprehensive, AI-powered mental wellness platform designed specifically for young people, combining cutting-edge technology with intuitive user experiences.**

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12+-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4+-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-green?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

## 🌟 Overview

MindFlow is a revolutionary mental wellness platform that empowers young people to take control of their mental health through innovative technology. Our platform combines AI-powered conversations, immersive VR experiences, intelligent journaling, and community support to create a comprehensive wellness ecosystem.

### 🎯 Mission

To make mental wellness accessible, engaging, and effective for the next generation through technology that speaks their language.

### 🚀 Key Features

- **🤖 AI Companion**: Intelligent conversational AI powered by Google's Gemini AI with voice input
- **📝 Smart Journaling**: Advanced voice-to-text journaling using Google Cloud Speech-to-Text with mood tracking and analytics
- **🏃‍♀️ Mindful Movement**: Real-time pose tracking and guided movement exercises using MediaPipe
- **👥 Community Forums**: Safe spaces for peer support with AI-powered content moderation and crisis detection
- **📊 Wellness Analytics**: Comprehensive insights and progress tracking
- **🎮 Gamification**: Points, achievements, and rewards system
- **🔒 Privacy-First**: End-to-end encryption and secure data handling
- **🎤 Voice Features**: Professional audio recording with multi-language support and real-time transcription

## 🏗️ Architecture

```
MindFlow/
├── frontend/          # React 19 + TailwindCSS + Vite
├── backend/           # Node.js + Express + Firebase + MongoDB
└── python scripts/    # Computer Vision & Pose Tracking (MediaPipe + OpenCV)
```

### 🛠️ Tech Stack

#### Frontend

- **React 19** - Latest React with modern features
- **TailwindCSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication and real-time database
- **MediaPipe** - Real-time pose detection and tracking
- **Lucide React** - Modern icon library
- **Radix UI** - Accessible component primitives

#### Backend

- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **MongoDB** - NoSQL database for structured data
- **Socket.io** - Real-time communication
- **JWT** - Secure authentication tokens
- **Crypto-JS** - Data encryption utilities

#### AI & ML Services

- **Google Gemini AI** - Advanced AI capabilities for conversational AI
- **Google Cloud Speech-to-Text** - Professional voice-to-text transcription with 40+ languages
- **Google Cloud Natural Language API** - Advanced sentiment analysis and content moderation
- **MediaPipe** - Pose detection and tracking
- **OpenCV** - Computer vision processing

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Firebase project** with Authentication and Firestore enabled
- **Google Cloud Platform** account with required APIs enabled:
  - **Gemini AI API** - For conversational AI
  - **Cloud Speech-to-Text API** - For voice transcription
  - **Cloud Natural Language API** - For content moderation and sentiment analysis
- **Webcam** for pose tracking features

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/MindFlow.git
   cd MindFlow
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your Firebase and Google Cloud credentials
   npm run dev
   ```

3. **Set up the frontend**

   ```bash
   cd frontend
   npm install
   cp src/config/firebase.example.js src/config/firebase.js
   # Edit firebase.js with your Firebase config
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📱 Features Deep Dive

### 🤖 AI Companion

Our AI companion provides 24/7 emotional support through natural conversations:

- **Gemini AI Integration**: Powered by Google's Gemini 2.5 Flash and 2.0 Flash models
- **Voice Input**: Professional audio recording with Google Cloud Speech-to-Text integration
- **Multi-language Support**: 10+ supported languages for voice and text interactions
- **Context Awareness**: Remembers conversation history and maintains session state
- **Crisis Detection**: Identifies mental health crises and provides appropriate resources
- **Mood Analysis**: Analyzes emotional patterns and provides insights
- **Personalized Responses**: Tailored responses based on user context and history
- **Real-time Transcription**: Live voice-to-text conversion with confidence scoring

**Tech Stack**: Google Gemini AI, Google Cloud Speech-to-Text, Firebase Firestore, MongoDB

### 📝 Smart Journaling

Transform thoughts into insights with our intelligent journaling system:

- **Advanced Voice-to-Text**: Google Cloud Speech-to-Text with professional audio recording
- **Multi-language Support**: 10+ supported languages for voice journaling
- **Real-time Transcription**: Live audio-to-text conversion with confidence scoring
- **Mood Tracking**: Automatic mood detection from voice and text analysis
- **Smart Tags**: Automatic categorization of entries using AI
- **Calendar View**: Easy browsing of past entries
- **AI Analysis**: Gemini AI-powered insights and emotion analysis
- **Privacy Protection**: End-to-end encryption for sensitive data
- **Audio Recording**: Professional recording interface with waveform visualization
- **Auto-punctuation**: Intelligent text formatting and punctuation

**Tech Stack**: Google Cloud Speech-to-Text, Google Cloud Natural Language API, Google Gemini AI, Firebase Firestore, Crypto-JS

### 🏃‍♀️ Mindful Movement

AI-powered movement and exercise tracking:

- **Real-time Pose Detection**: MediaPipe-powered body tracking
- **Guided Exercises**: Step-by-step movement instructions
- **Progress Tracking**: Exercise completion and improvement metrics
- **Form Analysis**: Feedback on exercise technique and accuracy
- **Live Camera Integration**: Real-time visual feedback during exercises

**Tech Stack**: MediaPipe Tasks Vision, MediaPipe Pose, MediaPipe Camera Utils, MediaPipe Drawing Utils, WebRTC, Custom Pose Analysis Algorithms

### 👥 Community Forums

Safe spaces for peer support and discussion:

- **Topic-based Forums**: Organized by wellness topics (anxiety, depression, relationships, academic, family, self-care, crisis-support)
- **Anonymous Posting**: Privacy-focused discussions with optional anonymity
- **AI-Powered Moderation**: Advanced content moderation using Google Cloud Natural Language API
- **Real-time Content Analysis**: Pre-posting content analysis with sentiment scoring
- **Crisis Detection**: AI-powered crisis identification and resource suggestions
- **Detailed Moderation Reports**: Comprehensive analysis with confidence scores
- **Peer Support**: Connect with others on similar wellness journeys
- **Regional Support**: Location-based forum organization
- **Age-appropriate Content**: Forums tailored for youth (13-25 age range)

**Tech Stack**: Google Cloud Natural Language API, Firebase Firestore, MongoDB, Google Gemini AI

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security
ENCRYPTION_KEY=your-secret-encryption-key
JWT_SECRET=your-jwt-secret

# Database
MONGODB_URI=mongodb://localhost:27017/mindflow

# Google Cloud APIs
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
GEMINI_API_KEY=your-gemini-api-key

# Speech-to-Text Configuration
SPEECH_LANGUAGE_CODE=en-US
NLP_LANGUAGE_CODE=en
```

#### Frontend (firebase.js)

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| POST   | `/api/auth/verify`  | Verify Firebase token |
| GET    | `/api/auth/profile` | Get user profile      |
| PUT    | `/api/auth/profile` | Update user profile   |

### Journaling Endpoints

| Method | Endpoint                      | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| POST   | `/api/journal/entries`        | Create journal entry             |
| POST   | `/api/journal/entries/speech` | Create journal entry from speech |
| GET    | `/api/journal/entries`        | Get user's journal entries       |
| GET    | `/api/journal/entries/:id`    | Get specific entry               |
| PUT    | `/api/journal/entries/:id`    | Update entry                     |
| DELETE | `/api/journal/entries/:id`    | Delete entry                     |

### AI Companion Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/ai/chat`          | Send message to AI       |
| GET    | `/api/ai/conversations` | Get conversation history |
| POST   | `/api/ai/feedback`      | Submit AI feedback       |

### Speech-to-Text Endpoints

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| POST   | `/api/speech/transcribe`      | Transcribe audio to text   |
| POST   | `/api/speech/detect-language` | Detect language from audio |
| GET    | `/api/speech/languages`       | Get supported languages    |
| POST   | `/api/speech/validate-format` | Validate audio format      |

### Natural Language Processing Endpoints

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| POST   | `/api/language/sentiment`   | Analyze text sentiment      |
| POST   | `/api/language/entities`    | Extract entities from text  |
| POST   | `/api/language/classify`    | Classify text content       |
| POST   | `/api/language/analyze`     | Comprehensive text analysis |
| POST   | `/api/language/moderate`    | Moderate content for safety |
| POST   | `/api/language/key-phrases` | Extract key phrases         |
| POST   | `/api/language/detect`      | Detect text language        |

### Community Forum Endpoints

| Method | Endpoint                 | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/forums`            | Get all forums    |
| GET    | `/api/forums/:id/posts`  | Get forum posts   |
| POST   | `/api/forums/:id/posts`  | Create new post   |
| POST   | `/api/posts/:id/replies` | Reply to post     |
| GET    | `/api/posts/:id`         | Get specific post |
| PUT    | `/api/posts/:id`         | Update post       |
| DELETE | `/api/posts/:id`         | Delete post       |
| POST   | `/api/posts/:id/like`    | Like/unlike post  |
| POST   | `/api/posts/:id/report`  | Report post       |

## 🎤 Google Cloud AI Features

### Speech-to-Text Integration

MindFlow leverages Google Cloud Speech-to-Text for professional-grade voice transcription:

- **40+ Languages**: Support for major world languages with regional variants
- **Real-time Transcription**: Live audio-to-text conversion with confidence scoring
- **Professional Audio Recording**: High-quality recording interface with waveform visualization
- **Auto-punctuation**: Intelligent text formatting and punctuation
- **Language Detection**: Automatic language identification from audio
- **Format Validation**: Support for WebM, MP4, WAV, FLAC, and OGG formats

### Natural Language Processing

Advanced text analysis powered by Google Cloud Natural Language API:

- **Sentiment Analysis**: Comprehensive emotional state detection with confidence scores
- **Entity Recognition**: Automatic identification of people, places, organizations, and events
- **Content Classification**: Intelligent categorization of text content
- **Content Moderation**: Real-time inappropriate content detection and crisis intervention
- **Key Phrase Extraction**: Automatic identification of important topics and themes
- **Language Detection**: Automatic text language identification

### AI-Powered Features

- **Mood Detection**: Automatic emotion analysis from voice and text
- **Crisis Detection**: Mental health crisis identification with appropriate resource suggestions
- **Content Moderation**: Pre-posting analysis for community forums
- **Personalized Insights**: AI-generated wellness recommendations based on user patterns

## 🔒 Security & Privacy

### Data Protection

- **End-to-End Encryption**: All sensitive data encrypted using AES-256
- **Privacy Controls**: User-configurable privacy settings
- **Data Minimization**: Only collect necessary information
- **Secure Storage**: Firebase Firestore with security rules

### Authentication

- **Firebase Auth**: Google OAuth integration
- **JWT Tokens**: Secure API access
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configured for specific origins

### Compliance

- **GDPR Ready**: Built with privacy regulations in mind
- **COPPA Compliant**: Safe for users under 13
- **HIPAA Considerations**: Healthcare data handling best practices

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

#### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Backend Deployment

#### Heroku

```bash
heroku create mindflow-backend
heroku config:set NODE_ENV=production
# Set all environment variables
git push heroku main
```

#### Google Cloud Run

```bash
gcloud run deploy mindflow-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### AWS Elastic Beanstalk

```bash
eb init
eb create production
eb deploy
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
