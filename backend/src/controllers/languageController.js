import languageService from "../services/languageService.js";

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
   * Moderate content for inappropriate or harmful content
   */
  async moderateContent(req, res) {
    try {
      const { uid } = req.user;
      const { text, languageCode } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "Text is required",
        });
      }

      const result = await languageService.moderateContent(
        text,
        languageCode || process.env.NLP_LANGUAGE_CODE || "en"
      );

      res.json({
        success: true,
        moderation: {
          approved: result.approved,
          reason: result.reason,
          confidence: result.confidence,
          analysis: result.analysis,
        },
        metadata: {
          textLength: text.length,
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
