import { getApiBaseUrl } from "../utils/config.js";

class LanguageService {
  constructor() {
    this.apiBaseUrl = getApiBaseUrl();
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text, languageCode = "en", authToken) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/language/sentiment`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Sentiment analysis failed");
      }

      const data = await response.json();
      return {
        success: true,
        sentiment: data.sentiment,
        sentences: data.sentences,
        language: data.language,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return {
        success: false,
        sentiment: { score: 0, magnitude: 0, label: "neutral" },
        error: error.message,
      };
    }
  }

  /**
   * Analyze entities in text
   */
  async analyzeEntities(text, languageCode = "en", authToken) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/language/entities`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Entity analysis failed");
      }

      const data = await response.json();
      return {
        success: true,
        entities: data.entities,
        language: data.language,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Entity analysis error:", error);
      return {
        success: false,
        entities: [],
        error: error.message,
      };
    }
  }

  /**
   * Classify text content
   */
  async classifyText(text, languageCode = "en", authToken) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/language/classify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Text classification failed");
      }

      const data = await response.json();
      return {
        success: true,
        categories: data.categories,
        language: data.language,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Text classification error:", error);
      return {
        success: false,
        categories: [],
        error: error.message,
      };
    }
  }

  /**
   * Comprehensive text analysis
   */
  async analyzeText(text, languageCode = "en") {
    try {
      const response = await fetch(`${this.apiBaseUrl}/language/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Text analysis failed");
      }

      const data = await response.json();
      return {
        success: true,
        analysis: data.analysis,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Text analysis error:", error);
      return {
        success: false,
        analysis: null,
        error: error.message,
      };
    }
  }

  /**
   * Moderate content for inappropriate content
   */
  async moderateContent(text, languageCode = "en") {
    try {
      const response = await fetch(`${this.apiBaseUrl}/language/moderate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Content moderation failed");
      }

      const data = await response.json();
      return {
        success: true,
        moderation: data.moderation,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Content moderation error:", error);
      return {
        success: false,
        moderation: { approved: true, reason: "Moderation unavailable" },
        error: error.message,
      };
    }
  }

  /**
   * Extract key phrases from text
   */
  async extractKeyPhrases(text, languageCode = "en") {
    try {
      const response = await fetch(`${this.apiBaseUrl}/language/key-phrases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, languageCode }),
      });

      if (!response.ok) {
        throw new Error("Key phrase extraction failed");
      }

      const data = await response.json();
      return {
        success: true,
        phrases: data.phrases,
        language: data.language,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Key phrase extraction error:", error);
      return {
        success: false,
        phrases: [],
        error: error.message,
      };
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/language/detect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Language detection failed");
      }

      const data = await response.json();
      return {
        success: true,
        language: data.language,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Language detection error:", error);
      return {
        success: false,
        language: { code: "en", confidence: 0 },
        error: error.message,
      };
    }
  }

  /**
   * Get sentiment color based on score
   */
  getSentimentColor(score) {
    if (score >= 0.3) return "#10B981"; // Green for positive
    if (score <= -0.3) return "#EF4444"; // Red for negative
    return "#6B7280"; // Gray for neutral
  }

  /**
   * Get sentiment emoji based on score
   */
  getSentimentEmoji(score) {
    if (score >= 0.3) return "😊";
    if (score >= 0.1) return "🙂";
    if (score <= -0.3) return "😔";
    if (score <= -0.1) return "😐";
    return "😐";
  }

  /**
   * Format sentiment score as percentage
   */
  formatSentimentScore(score) {
    const percentage = Math.round(Math.abs(score) * 100);
    return `${percentage}%`;
  }

  /**
   * Get moderation status color
   */
  getModerationColor(approved) {
    return approved ? "#10B981" : "#EF4444";
  }

  /**
   * Get moderation status text
   */
  getModerationText(approved) {
    return approved ? "Approved" : "Needs Review";
  }

  /**
   * Get authentication token
   */
  async getAuthToken() {
    // This should be implemented based on your auth system
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.accessToken) {
      return user.accessToken;
    }

    // Fallback to Firebase auth if available
    if (window.firebase && window.firebase.auth) {
      const currentUser = window.firebase.auth().currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
    }

    throw new Error("No authentication token available");
  }

  /**
   * Analyze journal entry for mood detection
   */
  async analyzeJournalMood(text, authToken) {
    try {
      const result = await this.analyzeSentiment(text, "en", authToken);
      if (!result.success) {
        return "neutral";
      }

      const score = result.sentiment.score;
      if (score >= 0.3) return "happy";
      if (score >= 0.1) return "excited";
      if (score <= -0.3) return "sad";
      if (score <= -0.1) return "anxious";
      return "neutral";
    } catch (error) {
      console.error("Mood analysis error:", error);
      return "neutral";
    }
  }

  /**
   * Get entity type icon
   */
  getEntityIcon(type) {
    const icons = {
      PERSON: "👤",
      ORGANIZATION: "🏢",
      LOCATION: "📍",
      EVENT: "📅",
      WORK_OF_ART: "🎨",
      CONSUMER_GOOD: "🛍️",
      OTHER: "📝",
    };
    return icons[type] || icons.OTHER;
  }

  /**
   * Get category color
   */
  getCategoryColor(category) {
    const colors = {
      "/Arts & Entertainment": "#8B5CF6",
      "/Business & Industrial": "#F59E0B",
      "/Computers & Electronics": "#3B82F6",
      "/Finance": "#10B981",
      "/Health": "#EF4444",
      "/Hobbies & Leisure": "#F97316",
      "/Home & Garden": "#84CC16",
      "/Internet & Telecom": "#06B6D4",
      "/Law & Government": "#6366F1",
      "/News": "#8B5CF6",
      "/People & Society": "#EC4899",
      "/Pets & Animals": "#F59E0B",
      "/Real Estate": "#10B981",
      "/Reference": "#6B7280",
      "/Science": "#3B82F6",
      "/Shopping": "#F97316",
      "/Sports": "#84CC16",
      "/Travel": "#06B6D4",
    };
    return colors[category] || "#6B7280";
  }
}

export default new LanguageService();
