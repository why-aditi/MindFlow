# VR Exercise Setup Guide

This guide will help you set up the VR exercise tracking feature for your MindFlow app.

## 🚀 Features

### Exercise Types
- **Rep-based Exercises**: Bicep curls, squats, push-ups, lunges
- **Hold-based Exercises**: Tree pose, Warrior II, plank, chair pose, cobra pose
- **Meditation & Breathing**: Guided meditation, breathing exercises, stretching

### Key Features
- Real-time pose detection using MediaPipe
- Exercise counting and timing
- Camera-based form tracking
- Session progress tracking
- Exercise statistics and history

## 📋 Prerequisites

- Python 3.7 or higher
- Node.js backend running
- Webcam/camera access
- Required Python packages

## 🛠️ Installation Steps

### 1. Install Python Dependencies

Navigate to the `python scripts` directory and run the setup script:

```bash
cd "python scripts"
python setup_python_vr.py
```

Or manually install the required packages:

```bash
pip install -r requirements.txt
```

### 2. Seed Exercise Database

Run the exercise seeder to populate the database with available exercises:

```bash
cd backend
npm run seed
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

## 🎯 Available Exercises

### Rep-based Exercises
- `bicep_curl` - Bicep curls with rep counting
- `squat` - Squats with rep counting  
- `pushup` - Push-ups with rep counting
- `lunge` - Lunges with rep counting

### Hold-based Exercises
- `tree_pose` - Yoga tree pose with hold timing
- `warrior_ii` - Warrior II pose with hold timing
- `plank` - Plank position with hold timing
- `chair_pose` - Chair pose with hold timing
- `cobra_pose` - Cobra pose with hold timing

### Meditation & Breathing
- `meditation` - Guided meditation session
- `breathing` - Breathing exercise with pattern guidance
- `stretching` - Gentle stretching routine

## 🔧 API Endpoints

### Exercise Management
```
GET /api/vr/exercises - Get all available exercises
GET /api/vr/exercises/:id - Get specific exercise details
```

### VR System
```
GET /api/vr/vr-dependencies - Check Python VR dependencies
GET /api/vr/vr-exercises - Get exercises from Python script
```

### Exercise Tracking
```
POST /api/vr/vr-exercise-tracking - Start exercise tracking
DELETE /api/vr/vr-exercise-tracking/:sessionId - Stop exercise tracking
GET /api/vr/vr-active-sessions - Get active tracking sessions
```

### Session Management
```
GET /api/vr/sessions - Get user's exercise sessions
GET /api/vr/sessions/:id - Get specific session details
PUT /api/vr/sessions/:id/feedback - Update session feedback
GET /api/vr/stats - Get user exercise statistics
```

## 🎮 Usage

### Starting an Exercise
1. Navigate to the VR Exercise page
2. Select an exercise from the available options
3. Adjust duration settings if needed
4. Click "Start Exercise"
5. Allow camera access when prompted
6. Follow the on-screen guidance

### During Exercise
- The camera window will show your pose with tracking overlays
- Rep-based exercises will count repetitions automatically
- Hold-based exercises will track hold time
- Press 'q' in the camera window to quit early

### Exercise Completion
- Sessions are automatically saved to your profile
- View your progress and statistics in the Profile section
- Provide feedback on exercise difficulty and enjoyment

## 🔍 Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check that no other applications are using the camera
- Try refreshing the page and restarting the exercise

### Python Dependencies
- Run `python setup_python_vr.py` to reinstall dependencies
- Check Python version: `python --version` (should be 3.7+)
- Verify packages: `pip list | grep -E "(opencv|mediapipe|numpy)"`

### Backend Issues
- Check that MongoDB is running
- Verify environment variables are set correctly
- Check backend logs for error messages

### Exercise Not Detected
- Ensure good lighting conditions
- Position yourself 3-6 feet from the camera
- Make sure your full body is visible in the frame
- Try adjusting the camera angle

## 📊 Exercise Data

### Session Tracking
- Exercise type and duration
- Rep count (for rep-based exercises)
- Hold time (for hold-based exercises)
- Form accuracy and quality scores
- Session completion status

### Statistics
- Total sessions completed
- Time spent exercising
- Exercise type distribution
- Progress over time
- Achievement tracking

## 🔒 Privacy & Security

- Camera data is processed locally on your device
- No video is stored or transmitted
- Only exercise metrics and session data are saved
- All data is encrypted and stored securely

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Check the browser console for error messages
4. Ensure your camera is working with other applications
5. Try restarting both the backend and frontend servers

## 🎉 Enjoy Your Workouts!

The VR exercise feature is designed to make fitness fun and engaging. Track your progress, improve your form, and achieve your wellness goals with AI-powered guidance!
