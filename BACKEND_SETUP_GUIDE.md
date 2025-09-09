# MindFlow Backend Setup Guide

## 🎉 Backend Complete!

Your MindFlow backend is now fully functional with all the requested features! Here's what has been built:

## ✅ **Completed Features**

### 🔐 **Authentication & Security**

- Firebase Authentication with Google OAuth
- JWT token verification middleware
- Rate limiting (100 requests/15 minutes)
- Data encryption for sensitive information
- CORS protection and security headers

### 📝 **Journaling API**

- **CRUD operations** for journal entries
- **End-to-end encryption** for text and tags
- **Mood tracking** (1-10 scale)
- **Tag system** for categorization
- **Voice-to-text** integration
- **Analytics** with mood trends and insights

### 🤖 **AI Companion API**

- **Dialogflow CX integration** for conversational AI
- **Session management** for context-aware conversations
- **Intent recognition** and confidence scoring
- **Feedback system** for AI improvement
- **Conversation history** with encryption
- **Analytics** for AI usage patterns

### 🥽 **VR Meditation API**

- **Session tracking** for VR experiences
- **Multiple environments** (Ocean, Forest, Rain, Space)
- **Guided meditation** programs
- **Progress analytics** and completion tracking
- **Achievement integration**

### 👤 **User Management API**

- **Profile management** with preferences
- **Wellness goals** tracking and updates
- **Achievement system** with badges
- **Statistics dashboard**
- **Privacy controls**

### 📊 **Analytics API**

- **Comprehensive dashboard** analytics
- **Mood trends** over time
- **Activity patterns** analysis
- **Wellness score** calculation
- **Personalized insights** generation

### 🎤 **Voice Processing API**

- **Speech-to-text** conversion
- **Multiple audio formats** support
- **Streaming recognition** for real-time processing
- **Confidence scoring**
- **File management** and cleanup

## 🚀 **Quick Start**

### 1. **Install Dependencies**

```bash
cd backend
npm install
```

### 2. **Set Up Environment**

```bash
cp env.example .env
# Edit .env with your actual values
```

### 3. **Start Development Server**

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🔧 **Configuration Required**

### **Firebase Setup**

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google provider)
3. Create Firestore database
4. Generate service account key
5. Update `.env` with Firebase config

### **Google Cloud APIs**

Enable these APIs in Google Cloud Console:

- Dialogflow CX API
- Cloud Speech-to-Text API
- Cloud Translation API
- Cloud Natural Language API

### **Environment Variables**

Update `.env` file with:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Cloud APIs
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Dialogflow CX
DIALOGFLOW_PROJECT_ID=your-project-id
DIALOGFLOW_AGENT_ID=your-agent-id

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
```

## 📚 **API Endpoints Overview**

### **Authentication**

- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### **Journaling**

- `POST /api/journal/entries` - Create journal entry
- `GET /api/journal/entries` - Get entries with pagination
- `GET /api/journal/entries/:id` - Get specific entry
- `PUT /api/journal/entries/:id` - Update entry
- `DELETE /api/journal/entries/:id` - Delete entry
- `GET /api/journal/analytics` - Get mood analytics

### **AI Companion**

- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/conversations` - Get conversation history
- `GET /api/ai/sessions` - Get chat sessions
- `POST /api/ai/feedback` - Submit AI feedback
- `GET /api/ai/analytics` - Get AI usage analytics

### **VR Meditation**

- `POST /api/vr/sessions` - Create VR session
- `PUT /api/vr/sessions/:id/complete` - Complete session
- `GET /api/vr/sessions` - Get VR sessions
- `GET /api/vr/guided-sessions` - Get guided programs
- `GET /api/vr/analytics` - Get VR analytics

### **User Management**

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/wellness-goals` - Update wellness goals
- `PUT /api/user/achievements` - Update achievements
- `GET /api/user/achievements` - Get available achievements
- `GET /api/user/stats` - Get user statistics

### **Analytics**

- `GET /api/analytics/dashboard` - Get comprehensive analytics
- `GET /api/analytics/mood-trends` - Get mood trends over time
- `GET /api/analytics/activity-patterns` - Get activity patterns

### **File Upload**

- `POST /api/upload/voice` - Upload voice recording
- `POST /api/upload/voice-stream` - Stream voice recognition
- `GET /api/upload/transcriptions` - Get transcriptions
- `DELETE /api/upload/transcriptions/:id` - Delete transcription

## 🔒 **Security Features**

### **Data Encryption**

- All journal entries encrypted with AES-256
- User tags and personal notes encrypted
- Voice transcriptions stored securely
- Conversation history encrypted

### **Authentication**

- Firebase token verification for all protected routes
- User-specific data isolation
- Session management and token expiration

### **Rate Limiting**

- 100 requests per 15 minutes per IP
- Configurable limits for different endpoints
- Graceful error handling

### **Input Validation**

- Comprehensive validation using express-validator
- File type and size restrictions
- SQL injection prevention through Firestore

## 📊 **Database Collections**

### **users**

- User profiles, preferences, wellness goals
- Achievement tracking and statistics
- Privacy settings and preferences

### **journalEntries**

- Encrypted journal entries with mood tracking
- Tag system for categorization
- Voice file URLs and metadata

### **conversations**

- Encrypted AI conversation history
- Intent recognition and confidence scores
- User feedback for AI improvement

### **vrSessions**

- VR meditation session tracking
- Environment and duration data
- Completion status and feedback

### **transcriptions**

- Voice-to-text conversion results
- Confidence scores and metadata
- File management and cleanup

## 🧪 **Testing the API**

### **Health Check**

```bash
curl http://localhost:5000/health
```

### **Test Authentication**

```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-firebase-token"}'
```

### **Test Journal Entry**

```bash
curl -X POST http://localhost:5000/api/journal/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"text": "Today was great!", "mood": 8, "tags": ["happy", "productive"]}'
```

### **Test AI Chat**

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"message": "How are you today?", "sessionId": "test-session"}'
```

## 🚀 **Deployment Options**

### **Heroku**

```bash
heroku create mindflow-backend
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-project-id
# ... set other environment variables
git push heroku main
```

### **Google Cloud Run**

```bash
gcloud run deploy mindflow-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### **AWS Elastic Beanstalk**

```bash
eb init
eb create production
eb deploy
```

## 🔗 **Frontend Integration**

The backend is designed to work seamlessly with the React frontend:

1. **Authentication**: Frontend sends Firebase tokens to backend
2. **Data Flow**: All user data flows through encrypted API endpoints
3. **Real-time Updates**: Firestore provides real-time data synchronization
4. **File Upload**: Voice recordings processed and transcribed
5. **Analytics**: Comprehensive data for dashboard and insights

## 📈 **Monitoring & Logging**

- **Morgan** for HTTP request logging
- **Console logging** for errors and important events
- **Health check** endpoint for monitoring
- **Error handling** with detailed error messages
- **Performance tracking** and optimization

## 🎯 **Next Steps**

1. **Set up Firebase project** and configure authentication
2. **Enable Google Cloud APIs** for AI and voice processing
3. **Configure environment variables** in `.env` file
4. **Test API endpoints** using Postman or curl
5. **Deploy to production** using your preferred platform
6. **Integrate with frontend** for full-stack functionality

## 🆘 **Support**

- Check the `backend/README.md` for detailed documentation
- Review API endpoint documentation
- Test with the provided curl examples
- Monitor logs for debugging

---

## 🎉 **Congratulations!**

Your MindFlow backend is now complete with:

- ✅ **No hardcoded data** - All data comes from Firebase/Firestore
- ✅ **Full CRUD operations** for all features
- ✅ **End-to-end encryption** for sensitive data
- ✅ **AI integration** with Dialogflow CX
- ✅ **Voice processing** with Google Speech-to-Text
- ✅ **Comprehensive analytics** and insights
- ✅ **Production-ready** security and error handling

The backend is ready to power your MindFlow platform! 🚀✨
