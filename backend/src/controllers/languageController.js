import languageService from "../services/languageService.js";
import geminiService from "../services/geminiService.js";

export const languageController = {
  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.analyzeSentiment(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Sentiment analysis failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        sentiment: result.sentiment,
        sentences: result.sentences,
        language: result.language,
        metadata: {
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze sentiment",
        message: error.message,
      });
    }
  },

  /**
   * Analyze entities in text
   */
  async analyzeEntities(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.analyzeEntities(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Entity analysis failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        entities: result.entities,
        language: result.language,
        metadata: {
          textLength: text.length,
          entityCount: result.entities.length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Entity analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze entities",
        message: error.message,
      });
    }
  },

  /**
   * Classify text content
   */
  async classifyText(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.classifyText(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Text classification failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        categories: result.categories,
        language: result.language,
        metadata: {
          textLength: text.length,
          categoryCount: result.categories.length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Text classification error:", error);
      res.status(500).json({
        error: "Failed to classify text",
        message: error.message,
      });
    }
  },

  /**
   * Comprehensive text analysis
   */
  async analyzeText(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.analyzeText(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Text analysis failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        analysis: {
          sentiment: result.sentiment,
          entities: result.entities,
          categories: result.categories,
          language: result.language,
          textLength: result.textLength,
          wordCount: result.wordCount,
        },
        metadata: {
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Text analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze text",
        message: error.message,
      });
    }
  },

  /**
   * Moderate content for inappropriate or harmful content using Gemini API
   */
  async moderateContent(req, res) {
    try {
      const { uid } = req.user;
      const { text, contentType, context } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      // Use Gemini API for content moderation
      const result = await geminiService.moderateContent(
        text,
        contentType || "general",
        { ...context, userId: uid }
      );

      res.json({
        success: result.success,
        moderation: {
          approved: result.approved,
          confidence: result.confidence,
          riskLevel: result.riskLevel,
          categories: result.categories,
          reason: result.reason,
          flaggedContent: result.flaggedContent,
          suggestions: result.suggestions,
          crisisDetected: result.crisisDetected,
          requiresHumanReview: result.requiresHumanReview,
          actionRequired: result.actionRequired,
        },
        metadata: {
          textLength: text.length,
          contentType: contentType || "general",
          model: result.model,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Content moderation error:", error);
      res.status(500).json({
        error: "Failed to moderate content",
        message: error.message,
      });
    }
  },

  /**
   * Moderate multiple pieces of content in batch
   */
  async moderateContentBatch(req, res) {
    try {
      const { uid } = req.user;
      const { contentItems } = req.body;

      if (
        !contentItems ||
        !Array.isArray(contentItems) ||
        contentItems.length === 0
      ) {
        return res.status(400).json({
          error: "Content items array is required",
        });
      }

      // Validate each content item
      for (const item of contentItems) {
        if (!item.text || item.text.trim().length === 0) {
          return res.status(400).json({
            error: "Each content item must have text",
          });
        }
      }

      // Add user context to each item
      const itemsWithContext = contentItems.map((item) => ({
        ...item,
        context: { ...item.context, userId: uid },
      }));

      const results = await geminiService.moderateContentBatch(
        itemsWithContext
      );

      res.json({
        success: true,
        moderationResults: results,
        metadata: {
          totalItems: contentItems.length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Batch content moderation error:", error);
      res.status(500).json({
        error: "Failed to moderate content batch",
        message: error.message,
      });
    }
  },

  /**
   * Get content moderation statistics
   */
  async getModerationStats(req, res) {
    try {
      const { uid } = req.user;
      const { moderationResults } = req.body;

      if (!moderationResults || !Array.isArray(moderationResults)) {
        return res.status(400).json({
          error: "Moderation results array is required",
        });
      }

      const stats = geminiService.getModerationStats(moderationResults);

      res.json({
        success: true,
        statistics: stats,
        metadata: {
          userId: uid,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Moderation stats error:", error);
      res.status(500).json({
        error: "Failed to generate moderation statistics",
        message: error.message,
      });
    }
  },

  /**
   * Extract key phrases from text
   */
  async extractKeyPhrases(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.extractKeyPhrases(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Key phrase extraction failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        phrases: result.phrases,
        language: result.language,
        metadata: {
          textLength: text.length,
          phraseCount: result.phrases.length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Key phrase extraction error:", error);
      res.status(500).json({
        error: "Failed to extract key phrases",
        message: error.message,
      });
    }
  },

  /**
   * Detect language of text
   */
  async detectLanguage(req, res) {
    try {
      const { uid } = req.user;
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.detectLanguage(text);

      if (!result.success) {
        return res.status(500).json({
          error: "Language detection failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        language: {
          code: result.language,
          confidence: result.confidence,
        },
        metadata: {
          textLength: text.length,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Language detection error:", error);
      res.status(500).json({
        error: "Failed to detect language",
        message: error.message,
      });
    }
  },
};

// Middleware to add timing
export const addTiming = (req, res, next) => {
  req.startTime = Date.now();
  next();
};
