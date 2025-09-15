# MindFlow Troubleshooting Guide

This guide will help you resolve common issues with the MindFlow application.

## 🚨 Backend Connection Issues

### Error: `net::ERR_CONNECTION_REFUSED`

This error means the backend server is not running or not accessible.

#### Quick Fix - Start Backend:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not done):**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   # Option 1: Quick start (minimal backend for testing)
   node quick-start.js
   
   # Option 2: Full backend with all features
   npm run dev
   
   # Option 3: Simple backend without Babel
   node start-simple.js
   ```

4. **Verify backend is running:**
   - Open http://localhost:8000/health in your browser
   - You should see: `{"status":"OK","message":"Backend is running!"}`

#### Environment Setup:

1. **Create .env file in backend directory:**
   ```bash
   # Copy the example file
   cp env.example .env
   ```

2. **Add required environment variables:**
   ```env
   # Basic configuration
   PORT=8000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5174
   
   # MongoDB (for full backend)
   MONGODB_URI=mongodb://localhost:27017/mindflow
   
   # Firebase (for authentication)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   
   # Gemini AI (for AI features)
   GEMINI_API_KEY=your-gemini-api-key
   ```

## 🎨 Frontend Issues

### Error: `motion is not defined`

This error occurs when framer-motion is not properly imported.

#### Fix:
1. **Check if framer-motion is installed:**
   ```bash
   cd frontend
   npm list framer-motion
   ```

2. **Install framer-motion if missing:**
   ```bash
   npm install framer-motion
   ```

3. **Verify import in AICompanion.jsx:**
   ```javascript
   import { AnimatePresence, motion } from 'framer-motion';
   ```

### Error: `Backend not available, using mock data`

This is a warning, not an error. It means the frontend is falling back to mock data when the backend is unavailable.

#### Fix:
1. **Start the backend server** (see Backend Connection Issues above)
2. **Check the backend URL** in your frontend code
3. **Verify CORS settings** in the backend

## 🔧 Development Setup

### Complete Setup Process:

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup (Optional):**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # Update MONGODB_URI in .env file
   ```

### Testing Backend Connection:

1. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **API Test:**
   ```bash
   curl http://localhost:8000/api/test
   ```

3. **Journal API Test:**
   ```bash
   curl http://localhost:8000/api/journal/entries
   ```

## 🐛 Common Issues & Solutions

### Issue: Babel/ES6 Module Errors

**Error:** `SyntaxError: Cannot use import statement outside a module`

**Solution:**
```bash
# Use the simple backend without Babel
node start-simple.js

# Or install Babel dependencies
npm install @babel/core @babel/preset-env @babel/register
```

### Issue: MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. **Install MongoDB locally:**
   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Or use MongoDB Atlas (cloud)
   ```

2. **Use mock data mode:**
   ```bash
   # Start with quick-start.js for testing without database
   node quick-start.js
   ```

### Issue: Firebase Authentication Errors

**Error:** `Firebase: Error (auth/invalid-api-key)`

**Solution:**
1. **Check Firebase configuration in .env**
2. **Verify Firebase project settings**
3. **Ensure service account has proper permissions**

### Issue: Gemini AI API Errors

**Error:** `API key not valid`

**Solution:**
1. **Get API key from Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Create new API key
   - Add to .env file: `GEMINI_API_KEY=your-key-here`

2. **Test API key:**
   ```bash
   node test-gemini-integration.js
   ```

## 🚀 Quick Start Commands

### Minimal Backend (for testing):
```bash
cd backend
node quick-start.js
```

### Full Backend (with all features):
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm run dev
```

### Test Everything:
```bash
# Backend health check
curl http://localhost:8000/health

# Frontend should be at
http://localhost:5174
```

## 📊 Debugging Tips

### Backend Debugging:
1. **Check console logs** for error messages
2. **Verify environment variables** are loaded
3. **Test individual endpoints** with curl or Postman
4. **Check port availability** (8000 should be free)

### Frontend Debugging:
1. **Open browser developer tools** (F12)
2. **Check Network tab** for failed requests
3. **Look for console errors** in the Console tab
4. **Verify API endpoints** are correct

### Database Debugging:
1. **Check MongoDB connection** string
2. **Verify database exists** and is accessible
3. **Check user permissions** for database access

## 🔍 Log Analysis

### Backend Logs:
- Look for `🚀 MindFlow Backend Server running on port 8000`
- Check for `✅ Connected to MongoDB`
- Watch for `❌` error messages

### Frontend Logs:
- Check for `Backend not available, using mock data`
- Look for `net::ERR_CONNECTION_REFUSED`
- Verify API response status codes

## 📞 Getting Help

If you're still having issues:

1. **Check the console logs** for specific error messages
2. **Verify all dependencies** are installed
3. **Test with minimal setup** first (quick-start.js)
4. **Check network connectivity** and firewall settings
5. **Ensure ports 8000 and 5174** are available

## 🎯 Success Indicators

You'll know everything is working when:

✅ Backend shows: `🚀 MindFlow Backend Server running on port 8000`
✅ Frontend loads without console errors
✅ API calls return data instead of connection errors
✅ No `motion is not defined` errors
✅ No `net::ERR_CONNECTION_REFUSED` errors
