# MindFlow - Youth Mental Wellness Platform

A modern, AI-powered wellness platform designed specifically for young people, combining cutting-edge technology with intuitive user experiences.

## 🌟 Features

### 🏠 Landing Page

- **Hero Section**: Calming gradient background with compelling tagline
- **About Section**: Introduction to MindFlow's mission and benefits
- **Four Pillars of Wellness**: Move, Dream, Recharge, Nourish
- **Youth-Centric Design**: Gamified experiences and social features
- **Rewards System**: Points-based engagement with real-world benefits
- **Smooth Animations**: Framer Motion powered interactions

### 🤖 AI Companion

- **WhatsApp-style Chat Interface**: Familiar and intuitive messaging
- **Dialogflow CX Integration**: Advanced conversational AI
- **Memory System**: Persistent conversation history via Firestore
- **Multilingual Support**: Google Translation API integration
- **Voice Input**: Speech-to-text capabilities

### 📝 Journaling System

- **Text Journaling**: Rich text editor with mood tracking
- **Voice Journaling**: Cloud Speech-to-Text API integration
- **Mood Analytics**: Visual mood trends and insights
- **Privacy Protection**: Encrypted storage in Firestore
- **Calendar View**: Easy entry browsing and management

### 🥽 VR Meditation

- **WebXR Integration**: Immersive virtual reality experiences
- **Multiple Environments**: Ocean, Forest, Rain, Space scenes
- **Guided Sessions**: Pre-built meditation programs
- **Session Tracking**: Duration and feedback storage
- **Three.js Rendering**: High-quality 3D environments

### 👤 User Profile

- **Wellness Goals**: Customizable targets and progress tracking
- **Achievement System**: Gamified milestones and rewards
- **Preferences**: Language, notifications, privacy settings
- **Analytics Dashboard**: Comprehensive wellness insights

## 🛠️ Tech Stack

### Frontend

- **React 19**: Latest React with modern features
- **TailwindCSS 4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **shadcn/ui**: Beautiful, accessible UI components
- **React Router**: Client-side routing
- **Lucide React**: Modern icon library

### Backend & Services

- **Firebase Auth**: Google OAuth authentication
- **Firestore**: NoSQL database for data storage
- **Google Cloud APIs**:
  - Dialogflow CX (AI conversations)
  - Cloud Natural Language (sentiment analysis)
  - Cloud Speech-to-Text (voice input)
  - Cloud Translation (multilingual support)

### VR/AR

- **WebXR**: Virtual reality web standard
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for Three.js

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Google Cloud Platform account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MindFlow/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Google provider)
   - Create a Firestore database
   - Copy your Firebase config to `src/config/firebase.js`

4. **Configure Google Cloud APIs**

   - Enable Dialogflow CX API
   - Enable Cloud Natural Language API
   - Enable Cloud Speech-to-Text API
   - Enable Cloud Translation API

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── ui/                 # Reusable UI components
│   └── landing/            # Landing page components
├── contexts/
│   └── AuthContext.jsx    # Authentication context
├── pages/
│   ├── LandingPage.jsx    # Main landing page
│   ├── Dashboard.jsx      # User dashboard
│   ├── AICompanion.jsx    # AI chat interface
│   ├── Journaling.jsx     # Journaling system
│   ├── VRMeditation.jsx   # VR meditation room
│   └── Profile.jsx        # User profile page
├── services/
│   └── firestore.js       # Firestore database operations
├── config/
│   ├── firebase.js        # Firebase configuration
│   └── firebase.example.js # Example config
├── utils/
│   └── cn.js              # Utility functions
└── App.jsx                # Main app component
```

## 🎨 Design System

### Color Palette

- **Primary**: Purple (#8b5cf6) to Blue (#3b82f6) gradient
- **Secondary**: Green (#10b981) for wellness features
- **Accent**: Yellow (#f59e0b) for rewards and achievements
- **Neutral**: Gray scale for text and backgrounds

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large sizes for hierarchy
- **Body**: Regular weight, readable line heights

### Components

- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with focus states
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration

### Firebase Setup

1. Copy `firebase.example.js` to `firebase.js`
2. Replace placeholder values with your Firebase config
3. Enable required Firebase services

### Environment Variables

Create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📱 Responsive Design

The platform is built with a mobile-first approach:

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Enhanced layouts for tablets (768px+)
- **Desktop**: Full-featured experience (1024px+)

## 🔒 Privacy & Security

- **Data Encryption**: All sensitive data encrypted in Firestore
- **Privacy Controls**: User-configurable privacy settings
- **Secure Authentication**: Firebase Auth with Google OAuth
- **GDPR Compliance**: Built with privacy regulations in mind

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA routing

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from WELLIFIZE platform
- Firebase and Google Cloud Platform
- React and TailwindCSS communities
- Three.js and WebXR communities

## 📞 Support

For support, email support@mindflow.app or join our Discord community.

---

Built with ❤️ for the next generation of mental wellness.
