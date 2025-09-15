# MindFlow Backend API

A comprehensive Node.js backend API for the MindFlow Youth Mental Wellness Platform, providing secure authentication, data management, AI integration, and analytics.

## 🚀 Features

### 🔐 Authentication & Security

- **Firebase Authentication** integration with Google OAuth
- **JWT token verification** for secure API access
- **Rate limiting** to prevent abuse
- **Data encryption** for sensitive information
- **CORS protection** and security headers

### 📝 Journaling System

- **CRUD operations** for journal entries
- **End-to-end encryption** for sensitive data
- **Mood tracking** with analytics
- **Tag system** for categorization
- **Voice-to-text** integration
- **Privacy protection** with user-specific data isolation

### 🤖 AI Companion

- **Dialogflow CX integration** for conversational AI
- **Session management** for context-aware conversations
- **Intent recognition** and confidence scoring
- **Feedback system** for AI improvement
- **Multilingual support** via Google Translation API

### 🥽 VR Meditation

- **Session tracking** for VR meditation experiences
- **Multiple environments** (Ocean, Forest, Rain, Space)
- **Guided meditation** programs
- **Progress analytics** and insights
- **Achievement system** integration

### 👤 User Management

- **Profile management** with preferences
- **Wellness goals** tracking
- **Achievement system** with badges
- **Statistics dashboard**
- **Privacy controls**

### 📊 Analytics & Insights

- **Comprehensive dashboard** analytics
- **Mood trends** over time
- **Activity patterns** analysis
- **Wellness score** calculation
- **Personalized insights** generation

### 🎤 Voice Processing

- **Speech-to-text** conversion
- **Multiple audio formats** support
- **Streaming recognition** for real-time processing
- **Confidence scoring**
- **File management** and cleanup

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Authentication and Firestore
- **Google Cloud APIs**:
  - Dialogflow CX (AI conversations)
  - Cloud Speech-to-Text (voice processing)
  - Cloud Translation (multilingual support)
  - Cloud Natural Language (sentiment analysis)
- **Multer** - File upload handling
- **Crypto-JS** - Data encryption
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - Request logging

## 📁 Project Structure

```
backend/
├── config/
│   ├── firebase.js          # Firebase configuration
│   └── initialize.js        # App initialization
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── journal.js           # Journaling API
│   ├── ai.js                # AI companion API
│   ├── vr.js                # VR sessions API
│   ├── user.js              # User management API
│   ├── analytics.js         # Analytics API
│   └── upload.js            # File upload API
├── utils/
│   └── encryption.js        # Encryption utilities
├── server.js                # Main server file
├── package.json             # Dependencies
└── env.example              # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore
- Google Cloud Platform account
- Service account key for Google Cloud APIs

### Installation

1. **Clone and navigate to backend**

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Configure Firebase**

   - Create a Firebase project
   - Enable Authentication (Google provider)
   - Create Firestore database
   - Generate service account key

4. **Set up Google Cloud APIs**

   - Enable Dialogflow CX API
   - Enable Cloud Speech-to-Text API
   - Enable Cloud Translation API
   - Enable Cloud Natural Language API

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Cloud APIs
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Dialogflow CX Configuration
DIALOGFLOW_PROJECT_ID=your-project-id
DIALOGFLOW_LOCATION=global
DIALOGFLOW_AGENT_ID=your-agent-id

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:5174
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Journaling

- `POST /api/journal/entries` - Create journal entry
- `GET /api/journal/entries` - Get journal entries
- `GET /api/journal/entries/:id` - Get specific entry
- `PUT /api/journal/entries/:id` - Update entry
- `DELETE /api/journal/entries/:id` - Delete entry
- `GET /api/journal/analytics` - Get journal analytics

### AI Companion

- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/conversations` - Get conversation history
- `GET /api/ai/sessions` - Get chat sessions
- `POST /api/ai/feedback` - Submit AI feedback
- `GET /api/ai/analytics` - Get AI analytics

### VR Meditation

- `POST /api/vr/sessions` - Create VR session
- `PUT /api/vr/sessions/:id/complete` - Complete VR session
- `GET /api/vr/sessions` - Get VR sessions
- `GET /api/vr/sessions/:id` - Get specific session
- `GET /api/vr/guided-sessions` - Get guided sessions
- `GET /api/vr/analytics` - Get VR analytics

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/wellness-goals` - Update wellness goals
- `PUT /api/user/achievements` - Update achievements
- `GET /api/user/achievements` - Get achievements
- `GET /api/user/stats` - Get user statistics
- `POST /api/user/feedback` - Submit feedback

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/mood-trends` - Get mood trends
- `GET /api/analytics/activity-patterns` - Get activity patterns

### File Upload

- `POST /api/upload/voice` - Upload voice recording
- `POST /api/upload/voice-stream` - Stream voice recognition
- `GET /api/upload/transcriptions` - Get transcriptions
- `DELETE /api/upload/transcriptions/:id` - Delete transcription

## 🔒 Security Features

### Data Encryption

- All sensitive journal entries are encrypted using AES-256
- User tags and personal notes are encrypted
- Voice transcriptions are stored securely

### Authentication

- Firebase token verification for all protected routes
- User-specific data isolation
- Session management and token expiration

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable limits for different endpoints
- Graceful error handling for rate limit exceeded

### Input Validation

- Comprehensive input validation using express-validator
- File type and size restrictions
- SQL injection prevention through Firestore

## 📊 Database Schema

### Collections

#### users

```javascript
{
  uid: string,
  email: string,
  name: string,
  picture: string,
  preferences: {
    language: string,
    notifications: boolean,
    theme: string,
    privacy: string
  },
  wellnessGoals: array,
  achievements: array,
  stats: {
    totalPoints: number,
    currentStreak: number,
    sessionsCompleted: number,
    averageMood: number
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

#### journalEntries

```javascript
{
  userId: string,
  text: string, // encrypted
  mood: number,
  tags: array, // encrypted
  type: string,
  voiceFileUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### conversations

```javascript
{
  userId: string,
  sessionId: string,
  userMessage: string, // encrypted
  aiResponse: string, // encrypted
  intent: string,
  confidence: number,
  feedback: object,
  createdAt: timestamp
}
```

#### vrSessions

```javascript
{
  userId: string,
  environment: string,
  duration: number,
  actualDuration: number,
  sessionType: string,
  guidedSessionId: string,
  notes: string,
  startTime: timestamp,
  endTime: timestamp,
  completed: boolean,
  feedback: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🚀 Deployment

### Environment Setup

1. Set up production environment variables
2. Configure Firebase production project
3. Set up Google Cloud production APIs
4. Configure CORS for production domain

### Deployment Options

#### Heroku

```bash
heroku create mindflow-backend
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-project-id
# ... set other environment variables
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

## 🧪 Testing

### Health Check

```bash
curl http://localhost:8000/health
```

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Test authentication
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-firebase-token"}'

# Test journal entry creation
curl -X POST http://localhost:8000/api/journal/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"text": "Today was great!", "mood": 8, "tags": ["happy"]}'
```

## 📈 Monitoring

### Logging

- Morgan for HTTP request logging
- Console logging for errors and important events
- Structured logging for production environments

### Health Monitoring

- Health check endpoint at `/health`
- Uptime monitoring
- Error rate tracking

### Performance

- Response time monitoring
- Database query optimization
- Memory usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

Built with ❤️ for youth mental wellness.
