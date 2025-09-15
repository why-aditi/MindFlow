import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "../models/Conversation.js";

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.fallbackModel = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    this.conversationHistory = new Map(); // In-memory conversation history
  }

  /**
   * Generate AI response using Gemini 2.0 Flash
   * @param {string} userMessage - The user's message
   * @param {string} sessionId - The conversation session ID
   * @param {string} userId - The user ID
   * @param {string} language - The language preference
   * @param {Object} context - Additional context (user profile, mood, etc.)
   */
  async generateResponse(
    userMessage,
    session,
    userId,
    language = "en",
    context = {}
  ) {
    try {
      // Get conversation history
      const conversationHistory = await this.getConversationHistory(session);

      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(language, context);

      // Prepare the chat history for Gemini
      const chatHistory = this.prepareChatHistory(conversationHistory);

      // Try primary model first (2.5-flash)
      let chat,
        modelUsed = "gemini-2.5-flash";

      try {
        chat = this.model.startChat({
          history: chatHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
        });

        // Generate response
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const aiResponse = response.text();

        // Store the conversation turn
        await this.storeConversationTurn(
          session,
          userId,
          userMessage,
          aiResponse,
          language
        );

        return {
          success: true,
          response: aiResponse,
          model: modelUsed,
          timestamp: new Date(),
          conversationLength: conversationHistory.length + 2,
        };
      } catch (primaryError) {
        // Check if it's an overloaded error (503) and try fallback model
        if (
          primaryError.status === 503 ||
          primaryError.message.includes("overloaded")
        ) {
          console.warn(
            "Primary model overloaded, trying fallback model:",
            primaryError.message
          );

          try {
            // Try fallback model (2.0-flash-exp)
            chat = this.fallbackModel.startChat({
              history: chatHistory,
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const aiResponse = response.text();

            // Store the conversation turn
            await this.storeConversationTurn(
              session,
              userId,
              userMessage,
              aiResponse,
              language
            );

            return {
              success: true,
              response: aiResponse,
              model: "gemini-2.0-flash",
              timestamp: new Date(),
              conversationLength: conversationHistory.length + 2,
            };
          } catch (fallbackError) {
            console.error("Fallback model also failed:", fallbackError);
            throw fallbackError;
          }
        } else {
          throw primaryError;
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);

      // Fallback response
      const fallbackResponse = this.getFallbackResponse(language, error);

      return {
        success: false,
        response: fallbackResponse,
        error: error.message,
        model: "fallback",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Build system prompt for mental wellness support
   */
  buildSystemPrompt(language, context) {
    const basePrompt = `You are MindFlow, an AI mental wellness companion designed to support young people (ages 13-25) with their mental health and emotional well-being. 

Your role:
- Provide empathetic, non-judgmental support
- Offer evidence-based mental health guidance
- Encourage healthy coping strategies
- Help users develop emotional awareness and resilience
- Provide crisis support and appropriate referrals when needed

Guidelines:
- Always prioritize user safety and well-being
- Use age-appropriate language and examples
- Be warm, supportive, and encouraging
- Avoid giving medical diagnoses or treatment advice
- Encourage professional help when appropriate
- Respect user privacy and confidentiality
- Use active listening and validation techniques

Response style:
- Keep responses conversational and engaging
- Use appropriate emojis sparingly
- Ask follow-up questions to show interest
- Provide practical, actionable advice
- Be culturally sensitive and inclusive

Remember: You are not a replacement for professional mental health care, but a supportive companion on their wellness journey.`;

    // Add language-specific instructions
    if (language !== "en") {
      return `${basePrompt}\n\nPlease respond in ${this.getLanguageName(
        language
      )}.`;
    }

    return basePrompt;
  }

  /**
   * Get conversation history for context
   */
  async getConversationHistory(session) {
    try {
      // If session has messages array, use that
      if (session && session.messages && session.messages.length > 0) {
        return session.messages.slice(-20).map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.message }],
        }));
      }

      // Fallback to old Message collection for backward compatibility
      const messages = await Message.find({ sessionId: session._id })
        .sort({ timestamp: 1 })
        .limit(20);

      return messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.message }],
      }));
    } catch (error) {
      console.error("Error getting conversation history:", error);
      return [];
    }
  }

  /**
   * Prepare chat history for Gemini API
   */
  prepareChatHistory(conversationHistory) {
    return conversationHistory.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));
  }

  /**
   * Store conversation turn in session messages array
   */
  async storeConversationTurn(
    session,
    userId,
    userMessage,
    aiResponse,
    language
  ) {
    try {
      // Add user message to session
      session.messages.push({
        message: userMessage,
        sender: "user",
        language,
        timestamp: new Date(),
      });

      // Add AI response to session
      session.messages.push({
        message: aiResponse,
        sender: "ai",
        language,
        timestamp: new Date(),
      });

      // Update message count
      session.messageCount = session.messages.length;

      // Save the session
      await session.save();
    } catch (error) {
      console.error("Error storing conversation turn:", error);
    }
  }

  /**
   * Get fallback response when API fails
   */
  getFallbackResponse(language, error) {
    const fallbackResponses = {
      en: "I'm having trouble connecting right now, but I'm here for you. How are you feeling today?",
      es: "Estoy teniendo problemas para conectarme ahora, pero estoy aquí para ti. ¿Cómo te sientes hoy?",
      fr: "J'ai des difficultés à me connecter en ce moment, mais je suis là pour vous. Comment vous sentez-vous aujourd'hui?",
      de: "Ich habe gerade Verbindungsprobleme, aber ich bin für Sie da. Wie fühlen Sie sich heute?",
      zh: "我现在连接有些问题，但我在这里支持你。你今天感觉怎么样？",
    };

    return fallbackResponses[language] || fallbackResponses.en;
  }

  /**
   * Get language name from code
   */
  getLanguageName(languageCode) {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
    };

    return languages[languageCode] || "English";
  }

  /**
   * Generate mood analysis from conversation
   */
  async analyzeMood(conversationHistory) {
    try {
      const recentMessages = conversationHistory
        .slice(-10)
        .map((msg) => `${msg.role}: ${msg.parts[0].text}`)
        .join("\n");

      const prompt = `Analyze the emotional tone and mood of this conversation. Provide a brief assessment focusing on:
1. Overall emotional state (positive, neutral, negative)
2. Key emotions expressed
3. Stress level (low, medium, high)
4. Suggested supportive responses

Conversation:
${recentMessages}

Respond in JSON format with keys: emotionalState, emotions, stressLevel, suggestions`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
      } catch (primaryError) {
        // Try fallback model if primary is overloaded
        if (
          primaryError.status === 503 ||
          primaryError.message.includes("overloaded")
        ) {
          console.warn(
            "Primary model overloaded for mood analysis, trying fallback"
          );
          try {
            const result = await this.fallbackModel.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
          } catch (fallbackError) {
            console.error(
              "Fallback model also failed for mood analysis:",
              fallbackError
            );
            throw fallbackError;
          }
        } else {
          throw primaryError;
        }
      }
    } catch (error) {
      console.error("Mood analysis error:", error);
      return {
        emotionalState: "neutral",
        emotions: ["uncertainty"],
        stressLevel: "medium",
        suggestions: [
          "Continue the conversation to better understand their needs",
        ],
      };
    }
  }

  /**
   * Generate personalized wellness suggestions
   */
  async generateWellnessSuggestions(userProfile, currentMood) {
    try {
      const prompt = `Based on this user profile and current mood, suggest 3-5 personalized wellness activities:

User Profile: ${JSON.stringify(userProfile)}
Current Mood: ${JSON.stringify(currentMood)}

Suggest activities that are:
- Age-appropriate for young adults
- Evidence-based for mental wellness
- Practical and achievable
- Tailored to their current emotional state

Respond in JSON format with an array of suggestions, each containing: title, description, category, estimatedTime, difficulty.`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
      } catch (primaryError) {
        // Try fallback model if primary is overloaded
        if (
          primaryError.status === 503 ||
          primaryError.message.includes("overloaded")
        ) {
          console.warn(
            "Primary model overloaded for wellness suggestions, trying fallback"
          );
          try {
            const result = await this.fallbackModel.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
          } catch (fallbackError) {
            console.error(
              "Fallback model also failed for wellness suggestions:",
              fallbackError
            );
            throw fallbackError;
          }
        } else {
          throw primaryError;
        }
      }
    } catch (error) {
      console.error("Wellness suggestions error:", error);
      return [
        {
          title: "Deep Breathing Exercise",
          description:
            "Take 5 minutes to practice deep breathing to help center yourself",
          category: "breathing",
          estimatedTime: "5 minutes",
          difficulty: "easy",
        },
      ];
    }
  }

  /**
   * Check for crisis indicators and provide appropriate response
   */
  async checkCrisisIndicators(message) {
    try {
      const crisisKeywords = [
        "suicide",
        "kill myself",
        "end it all",
        "not worth living",
        "hurt myself",
        "self harm",
        "cutting",
        "overdose",
        "crisis",
        "emergency",
        "help me",
        "can't take it anymore",
      ];

      const lowerMessage = message.toLowerCase();
      const hasCrisisIndicators = crisisKeywords.some((keyword) =>
        lowerMessage.includes(keyword)
      );

      if (hasCrisisIndicators) {
        return {
          isCrisis: true,
          response: `I'm really concerned about what you're sharing with me. Your safety is the most important thing right now. Please reach out to a trusted adult, mental health professional, or crisis hotline immediately. In the US, you can call or text 988 for the Suicide & Crisis Lifeline, available 24/7. You're not alone, and there are people who want to help you through this.`,
          resources: [
            {
              name: "Suicide & Crisis Lifeline",
              number: "988",
              available: "24/7",
              description: "Free, confidential support for people in distress",
            },
            {
              name: "Crisis Text Line",
              text: "HOME to 741741",
              available: "24/7",
              description: "Text-based crisis support",
            },
          ],
        };
      }

      return { isCrisis: false };
    } catch (error) {
      console.error("Crisis check error:", error);
      return { isCrisis: false };
    }
  }

  /**
   * Generate conversation summary
   */
  async generateConversationSummary(conversationHistory) {
    try {
      const messages = conversationHistory
        .map((msg) => `${msg.role}: ${msg.parts[0].text}`)
        .join("\n");

      const prompt = `Provide a brief summary of this mental wellness conversation, focusing on:
1. Main topics discussed
2. User's emotional state and concerns
3. Key insights or breakthroughs
4. Suggested follow-up actions

Conversation:
${messages}

Keep the summary concise and focused on mental wellness aspects.`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (primaryError) {
        // Try fallback model if primary is overloaded
        if (
          primaryError.status === 503 ||
          primaryError.message.includes("overloaded")
        ) {
          console.warn(
            "Primary model overloaded for conversation summary, trying fallback"
          );
          try {
            const result = await this.fallbackModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
          } catch (fallbackError) {
            console.error(
              "Fallback model also failed for conversation summary:",
              fallbackError
            );
            return "Conversation summary unavailable at this time.";
          }
        } else {
          throw primaryError;
        }
      }
    } catch (error) {
      console.error("Conversation summary error:", error);
      return "Conversation summary unavailable at this time.";
    }
  }

  /**
   * Generate a short title/summary for chat history display
   */
  async generateChatTitle(session) {
    try {
      // Get messages from session
      const messages = session.messages || [];

      if (messages.length === 0) {
        return "New Chat";
      }

      // Take first few messages to understand the topic
      const conversationText = messages
        .slice(0, 6)
        .map((msg) => `${msg.sender}: ${msg.message}`)
        .join("\n");

      const prompt = `Based on this mental wellness conversation, generate a short, descriptive title (2-6 words) that captures what the chat was about. Focus on the main topic or concern discussed.

Examples of good titles:
- "Feeling anxious about school"
- "Relationship advice needed"
- "Stress management tips"
- "Sleep problems discussion"
- "Building self-confidence"
- "Dealing with loneliness"
- "Career guidance chat"
- "Family issues support"

Conversation:
${conversationText}

Respond with only the title, no additional text.`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (primaryError) {
        // Try fallback model if primary is overloaded
        if (
          primaryError.status === 503 ||
          primaryError.message.includes("overloaded")
        ) {
          console.warn(
            "Primary model overloaded for title generation, trying fallback"
          );
          try {
            const result = await this.fallbackModel.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
          } catch (fallbackError) {
            console.error(
              "Fallback model also failed for title generation:",
              fallbackError
            );
            return "Chat conversation";
          }
        } else {
          throw primaryError;
        }
      }
    } catch (error) {
      console.error("Chat title generation error:", error);
      return "Chat conversation";
    }
  }

  // Analyze journal entry for emotions, themes, and insights
  async analyzeJournalEntry(text, userId) {
    try {
      const prompt = `
        Analyze the following journal entry and provide insights in JSON format:
        
        Journal Entry: "${text}"
        
        Please provide:
        1. Emotion analysis with intensity percentages (0-100)
        2. Key themes and topics
        3. A brief summary of the entry
        4. Any patterns or insights
        
        Return the response as a JSON object with this structure:
        {
          "emotions": [
            {"name": "happiness", "intensity": 75},
            {"name": "anxiety", "intensity": 30}
          ],
          "themes": ["work", "relationships", "personal growth"],
          "summary": "Brief summary of the entry",
          "insights": "Key insights or patterns noticed"
        }
        
        Be empathetic and supportive in your analysis.
      `;

      const result = await this.generateContent(prompt);

      try {
        // Try to parse the JSON response
        const analysis = JSON.parse(result);
        return analysis;
      } catch (parseError) {
        // If JSON parsing fails, return a structured response
        return {
          emotions: [{ name: "neutral", intensity: 50 }],
          themes: ["general reflection"],
          summary: result.substring(0, 200) + "...",
          insights: "Analysis completed successfully",
        };
      }
    } catch (error) {
      console.error("Journal analysis error:", error);
      return {
        emotions: [{ name: "neutral", intensity: 50 }],
        themes: ["general reflection"],
        summary: "Unable to analyze entry at this time",
        insights: "Please try again later",
      };
    }
  }
}

export default new GeminiService();
