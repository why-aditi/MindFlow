# 🌊 MindFlow - Youth Mental Wellness Platform

<div align="center">

![MindFlow Logo](https://img.shields.io/badge/MindFlow-Youth%20Wellness-purple?style=for-the-badge&logo=heart)

**A comprehensive, AI-powered mental wellness platform designed specifically for young people, combining cutting-edge technology with intuitive user experiences.**

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12+-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4+-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

## 🌟 Overview

MindFlow is a revolutionary mental wellness platform that empowers young people to take control of their mental health through innovative technology. Our platform combines AI-powered conversations, immersive VR experiences, intelligent journaling, and community support to create a comprehensive wellness ecosystem.

### 🎯 Mission

To make mental wellness accessible, engaging, and effective for the next generation through technology that speaks their language.

### 🚀 Key Features

- **🤖 AI Companion**: Intelligent conversational AI powered by Google's Dialogflow CX
- **📝 Smart Journaling**: Voice-to-text journaling with mood tracking and analytics
- **🥽 VR Meditation**: Immersive virtual reality meditation experiences
- **🏃‍♀️ Mindful Movement**: Pose tracking and guided movement exercises
- **👥 Community Forums**: Safe spaces for peer support and discussion
- **📊 Wellness Analytics**: Comprehensive insights and progress tracking
- **🎮 Gamification**: Points, achievements, and rewards system
- **🔒 Privacy-First**: End-to-end encryption and secure data handling

## 🏗️ Architecture

```
MindFlow/
├── frontend/          # React 19 + TailwindCSS + Vite
├── backend/           # Node.js + Express + Firebase
├── python scripts/    # Computer Vision & Pose Tracking
└── vrscript.py       # VR Environment Scripts
```

### 🛠️ Tech Stack

#### Frontend

- **React 19** - Latest React with modern features
- **TailwindCSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication and real-time database
- **WebXR** - Virtual reality web experiences
- **Three.js** - 3D graphics for VR environments

#### Backend

- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **MongoDB** - NoSQL database for structured data
- **Socket.io** - Real-time communication
- **JWT** - Secure authentication tokens
- **Crypto-JS** - Data encryption utilities

#### AI & ML Services

- **Google Dialogflow CX** - Conversational AI
- **Google Cloud Speech-to-Text** - Voice processing
- **Google Cloud Translation** - Multilingual support
- **Google Cloud Natural Language** - Sentiment analysis
- **Gemini AI** - Advanced AI capabilities
- **MediaPipe** - Pose detection and tracking
- **OpenCV** - Computer vision processing

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** (for VR and pose tracking)
- **Firebase project** with Authentication and Firestore enabled
- **Google Cloud Platform** account with required APIs enabled

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

4. **Set up Python dependencies** (for VR and pose tracking)

   ```bash
   cd "python scripts"
   pip install -r requirements.txt
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📱 Features Deep Dive

### 🤖 AI Companion

Our AI companion provides 24/7 emotional support through natural conversations:

- **WhatsApp-style Interface**: Familiar messaging experience
- **Context Awareness**: Remembers conversation history
- **Multilingual Support**: Communicates in multiple languages
- **Voice Input**: Speech-to-text capabilities
- **Sentiment Analysis**: Understands emotional context
- **Crisis Detection**: Identifies and responds to mental health crises

**Tech Stack**: Dialogflow CX, Google Cloud Speech-to-Text, Firebase Firestore

### 📝 Smart Journaling

Transform thoughts into insights with our intelligent journaling system:

- **Voice Journaling**: Speak your thoughts, get them transcribed
- **Mood Tracking**: Visual mood trends and analytics
- **Smart Tags**: Automatic categorization of entries
- **Privacy Protection**: End-to-end encryption
- **Calendar View**: Easy browsing of past entries
- **Insights Generation**: AI-powered wellness insights

**Tech Stack**: Google Cloud Speech-to-Text, Firebase Firestore, Crypto-JS

### 🥽 VR Meditation

Immersive virtual reality experiences for deep relaxation:

- **Multiple Environments**: Ocean, Forest, Rain, Space scenes
- **Guided Sessions**: Pre-built meditation programs
- **Session Tracking**: Duration and feedback storage
- **WebXR Integration**: Works on VR headsets and mobile
- **Customizable Settings**: Adjustable environments and audio

**Tech Stack**: WebXR, Three.js, React Three Fiber

### 🏃‍♀️ Mindful Movement

AI-powered movement and exercise tracking:

- **Pose Detection**: Real-time body pose tracking
- **Guided Exercises**: Step-by-step movement instructions
- **Progress Tracking**: Exercise completion and improvement
- **Form Analysis**: Feedback on exercise technique
- **Customizable Workouts**: Personalized exercise routines

**Tech Stack**: MediaPipe, OpenCV, Python, WebRTC

### 👥 Community Forums

Safe spaces for peer support and discussion:

- **Topic-based Forums**: Organized by wellness topics
- **Anonymous Posting**: Privacy-focused discussions
- **Moderation Tools**: Community-driven content moderation
- **Expert Q&A**: Professional mental health guidance
- **Peer Support**: Connect with others on similar journeys

**Tech Stack**: Firebase Firestore, React, Socket.io

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

### Required Google Cloud APIs

Enable these APIs in your Google Cloud Console:

- **Dialogflow CX API** - For AI conversations
- **Cloud Speech-to-Text API** - For voice processing
- **Cloud Translation API** - For multilingual support
- **Cloud Natural Language API** - For sentiment analysis
- **Cloud Storage API** - For file storage

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| POST   | `/api/auth/verify`  | Verify Firebase token |
| GET    | `/api/auth/profile` | Get user profile      |
| PUT    | `/api/auth/profile` | Update user profile   |

### Journaling Endpoints

| Method | Endpoint                   | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/api/journal/entries`     | Create journal entry       |
| GET    | `/api/journal/entries`     | Get user's journal entries |
| GET    | `/api/journal/entries/:id` | Get specific entry         |
| PUT    | `/api/journal/entries/:id` | Update entry               |
| DELETE | `/api/journal/entries/:id` | Delete entry               |

### AI Companion Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/ai/chat`          | Send message to AI       |
| GET    | `/api/ai/conversations` | Get conversation history |
| POST   | `/api/ai/feedback`      | Submit AI feedback       |

### VR Meditation Endpoints

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/vr/sessions`              | Create VR session   |
| PUT    | `/api/vr/sessions/:id/complete` | Complete VR session |
| GET    | `/api/vr/sessions`              | Get VR sessions     |

### Community Forum Endpoints

| Method | Endpoint                 | Description     |
| ------ | ------------------------ | --------------- |
| GET    | `/api/forums`            | Get all forums  |
| GET    | `/api/forums/:id/posts`  | Get forum posts |
| POST   | `/api/forums/:id/posts`  | Create new post |
| POST   | `/api/posts/:id/replies` | Reply to post   |

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

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm test
```

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-firebase-token"}'
```

## 📈 Performance & Monitoring

### Frontend Performance

- **Vite**: Fast build times and HMR
- **Code Splitting**: Lazy loading for optimal performance
- **Image Optimization**: WebP format and lazy loading
- **Bundle Analysis**: Regular bundle size monitoring

### Backend Performance

- **Rate Limiting**: Prevent API abuse
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized Firestore queries
- **Error Monitoring**: Comprehensive error tracking

### Analytics

- **User Engagement**: Track feature usage
- **Performance Metrics**: Monitor response times
- **Error Rates**: Track and resolve issues
- **Wellness Outcomes**: Measure user progress

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Respect privacy and security requirements

### Areas for Contribution

- **UI/UX Improvements**: Better user experience
- **New Features**: Additional wellness tools
- **Performance**: Optimization and speed improvements
- **Accessibility**: Making the platform more inclusive
- **Documentation**: Improving guides and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase & Google Cloud Platform** - For providing robust backend services
- **React & TailwindCSS Communities** - For excellent frontend tools
- **Three.js & WebXR Communities** - For immersive web experiences
- **Mental Health Professionals** - For guidance on wellness best practices
- **Youth Advisory Board** - For invaluable user feedback

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**: If you see `Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy`, your frontend and backend are running on different ports. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

**Quick Fix**: Update the CORS configuration in `backend/server.js` to include your frontend's port (usually 3000, 3001, etc.).

**Backend Not Running**: Make sure to start the backend server:

```bash
cd backend && npm run dev
```

**Frontend Not Running**: Start the frontend server:

```bash
cd frontend && npm run dev
```

For detailed troubleshooting steps, see our [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.

## 📞 Support & Contact

### Getting Help

- **Documentation**: Check our comprehensive guides
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join our community discussions
- **Email**: support@mindflow.app

### Professional Support

- **Crisis Resources**: Links to emergency mental health services
- **Professional Directory**: Connect with licensed therapists
- **Educational Resources**: Mental health education materials

### Community

- **Discord**: Join our developer and user community
- **Twitter**: Follow us for updates and tips
- **LinkedIn**: Connect with our team

---

<div align="center">

**Built with ❤️ for the next generation of mental wellness**

[Website](https://mindflow.app) • [Documentation](https://docs.mindflow.app) • [Community](https://discord.gg/mindflow)

</div>
