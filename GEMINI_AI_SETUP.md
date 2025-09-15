# Gemini AI Chatbot Setup Guide

This guide will help you set up the AI-powered chatbot using Google's Gemini 2.0 Flash model for your MindFlow app.

## Prerequisites

- Google Cloud Platform account
- Gemini API access
- Node.js backend running
- MongoDB database

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Environment Configuration

Add the following to your `.env` file:

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Install Dependencies

```bash
cd backend
npm install @google/generative-ai
```

### 4. Test the Integration

```bash
npm run dev
```

## API Endpoints

### Chat with AI
```
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "I'm feeling anxious today",
  "sessionId": "optional-session-id",
  "language": "en",
  "context": {
    "mood": "anxious",
    "age": 18
  }
}
```

### Get Model Information
```
GET /api/ai/model-info
Authorization: Bearer <token>
```

### Analyze Mood
```
GET /api/ai/conversations/:sessionId/mood-analysis
Authorization: Bearer <token>
```

### Get Wellness Suggestions
```
POST /api/ai/conversations/:sessionId/wellness-suggestions
Content-Type: application/json
Authorization: Bearer <token>

{
  "userProfile": {
    "age": 18,
    "interests": ["music", "art"],
    "goals": ["reduce anxiety"]
  }
}
```

### Get Conversation Summary
```
GET /api/ai/conversations/:sessionId/summary
Authorization: Bearer <token>
```

### Update Session Context
```
PUT /api/ai/conversations/:sessionId/context
Content-Type: application/json
Authorization: Bearer <token>

{
  "context": {
    "currentMood": "stressed",
    "recentEvents": ["exam tomorrow"]
  }
}
```

## WebSocket Events

### Client Events
- `authenticate` - Authenticate client with userId and sessionId
- `chat-message` - Send message to AI
- `typing-start` - User started typing
- `typing-stop` - User stopped typing
- `request-mood-analysis` - Request mood analysis
- `request-wellness-suggestions` - Request wellness suggestions

### Server Events
- `chat-response` - AI response
- `ai-typing` - AI is typing indicator
- `user-typing` - User typing indicator
- `mood-analysis-result` - Mood analysis results
- `wellness-suggestions-result` - Wellness suggestions
- `ai-notification` - General notifications
- `chat-error` - Error messages

## Frontend Integration

### WebSocket Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', {
  userId: 'user123',
  sessionId: 'session456'
});

// Send message
socket.emit('chat-message', {
  message: 'I need help with anxiety',
  sessionId: 'session456',
  language: 'en',
  context: { mood: 'anxious' }
});

// Listen for responses
socket.on('chat-response', (data) => {
  console.log('AI Response:', data.message);
  console.log('Model:', data.model);
  console.log('Is Crisis:', data.isCrisis);
});

// Listen for typing indicators
socket.on('ai-typing', (data) => {
  console.log('AI is typing:', data.isTyping);
});
```

### HTTP API Usage
```javascript
// Send message via HTTP
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    message: 'I need help with anxiety',
    language: 'en',
    context: { mood: 'anxious' }
  })
});

const data = await response.json();
console.log('AI Response:', data.response);
```

## Features

### Mental Wellness Support
- Empathetic, non-judgmental responses
- Evidence-based mental health guidance
- Crisis detection and appropriate referrals
- Age-appropriate language for young adults

### Multi-language Support
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Portuguese (pt)
- Russian (ru)
- Arabic (ar)

### Advanced Features
- **Mood Analysis**: Analyze emotional tone from conversations
- **Wellness Suggestions**: Personalized activity recommendations
- **Crisis Detection**: Automatic detection of crisis indicators
- **Conversation Summarization**: Generate conversation summaries
- **Context Awareness**: Maintain conversation context and user profile

### Crisis Support
The AI automatically detects crisis indicators and provides:
- Immediate supportive response
- Crisis hotline information
- Appropriate resource referrals
- Safety prioritization

## Configuration

### Model Settings
```javascript
// In geminiService.js
generationConfig: {
  temperature: 0.7,        // Creativity level (0-1)
  topK: 40,               // Top K sampling
  topP: 0.95,             // Nucleus sampling
  maxOutputTokens: 1024,  // Maximum response length
}
```

### System Prompt Customization
The system prompt can be customized in `geminiService.js` to:
- Adjust personality and tone
- Add specific guidelines
- Include domain-specific knowledge
- Modify response style

## Monitoring and Analytics

### Conversation Tracking
- Message count per session
- Conversation length
- User engagement metrics
- Response time tracking

### Error Handling
- API failure fallbacks
- Rate limiting protection
- Input validation
- Graceful degradation

## Security Considerations

- API key protection
- User authentication required
- Session isolation
- Input sanitization
- Rate limiting
- Privacy protection

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify API key is correct
   - Check API key permissions
   - Ensure billing is enabled

2. **Rate Limiting**
   - Implement request queuing
   - Add retry logic
   - Monitor usage limits

3. **Response Quality**
   - Adjust temperature settings
   - Refine system prompt
   - Add more context

4. **WebSocket Connection Issues**
   - Check CORS settings
   - Verify authentication
   - Monitor connection status

### Debug Mode
Enable debug logging:
```bash
DEBUG=ai:*
```

## Performance Optimization

- Implement response caching
- Use conversation summarization for long chats
- Optimize prompt length
- Monitor API usage and costs
- Implement request batching

## Future Enhancements

- Voice input/output support
- Image analysis capabilities
- Multi-modal responses
- Advanced personalization
- Integration with wearable devices
- Real-time emotion detection
