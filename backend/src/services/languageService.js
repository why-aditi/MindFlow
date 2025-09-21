import { LanguageServiceClient } from "@google-cloud/language";

class LanguageService {
  constructor() {
    this.languageClient = new LanguageServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  /**
   * Analyze sentiment of text
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(text, languageCode = "en") {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
        language: languageCode,
      };

      const [result] = await this.languageClient.analyzeSentiment({
        document: document,
      });

      const sentiment = result.documentSentiment;

      return {
        success: true,
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          label: this.getSentimentLabel(sentiment.score),
        },
        sentences: result.sentences.map((sentence) => ({
          text: sentence.text.content,
          sentiment: {
            score: sentence.sentiment.score,
            magnitude: sentence.sentiment.magnitude,
            label: this.getSentimentLabel(sentence.sentiment.score),
          },
        })),
        language: languageCode,
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
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Entity analysis result
   */
  async analyzeEntities(text, languageCode = "en") {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
        language: languageCode,
      };

      const [result] = await this.languageClient.analyzeEntities({
        document: document,
      });

      const entities = result.entities.map((entity) => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience,
        mentions: entity.mentions.map((mention) => ({
          text: mention.text.content,
          type: mention.type,
        })),
        metadata: entity.metadata || {},
      }));

      return {
        success: true,
        entities: entities,
        language: languageCode,
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
   * @param {string} text - Text to classify
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Classification result
   */
  async classifyText(text, languageCode = "en") {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
        language: languageCode,
      };

      const [result] = await this.languageClient.classifyText({
        document: document,
      });

      const categories = result.categories.map((category) => ({
        name: category.name,
        confidence: category.confidence,
      }));

      return {
        success: true,
        categories: categories,
        language: languageCode,
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
   * Analyze syntax of text
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Syntax analysis result
   */
  async analyzeSyntax(text, languageCode = "en") {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
        language: languageCode,
      };

      const [result] = await this.languageClient.analyzeSyntax({
        document: document,
      });

      const tokens = result.tokens.map((token) => ({
        text: token.text.content,
        partOfSpeech: token.partOfSpeech,
        lemma: token.lemma,
        dependencyEdge: token.dependencyEdge,
      }));

      return {
        success: true,
        tokens: tokens,
        language: languageCode,
      };
    } catch (error) {
      console.error("Syntax analysis error:", error);
      return {
        success: false,
        tokens: [],
        error: error.message,
      };
    }
  }

  /**
   * Comprehensive text analysis combining multiple features
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Comprehensive analysis result
   */
  async analyzeText(text, languageCode = "en") {
    try {
      const [sentimentResult, entitiesResult, categoriesResult] =
        await Promise.all([
          this.analyzeSentiment(text, languageCode),
          this.analyzeEntities(text, languageCode),
          this.classifyText(text, languageCode),
        ]);

      return {
        success: true,
        sentiment: sentimentResult.sentiment,
        entities: entitiesResult.entities,
        categories: categoriesResult.categories,
        language: languageCode,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
      };
    } catch (error) {
      console.error("Comprehensive text analysis error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Moderate content for inappropriate or harmful content
   * @param {string} text - Text to moderate
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Moderation result
   */
  async moderateContent(text, languageCode = "en") {
    try {
      const analysis = await this.analyzeText(text, languageCode);

      if (!analysis.success) {
        return {
          approved: false,
          reason: "Analysis failed",
          confidence: 0,
          analysis: analysis,
        };
      }

      // Check for negative sentiment and crisis indicators
      const sentiment = analysis.sentiment;
      const crisisKeywords = [
        "suicide",
        "kill myself",
        "end it all",
        "hurt myself",
        "self harm",
        "cutting",
        "overdose",
        "crisis",
        "emergency",
        "can't take it anymore",
        "want to die",
        "not worth living",
      ];

      const lowerText = text.toLowerCase();
      const hasCrisisIndicators = crisisKeywords.some((keyword) =>
        lowerText.includes(keyword)
      );

      // Determine if content should be approved
      const isNegative = sentiment.score < -0.3;
      const isHighMagnitude = sentiment.magnitude > 0.5;
      const isCrisis = hasCrisisIndicators || (isNegative && isHighMagnitude);

      let approved = true;
      let reason = "Content approved";
      let confidence = 0.8;

      if (isCrisis) {
        approved = false;
        reason = "Crisis indicators detected - requires immediate review";
        confidence = 0.9;
      } else if (isNegative && isHighMagnitude) {
        approved = false;
        reason = "Highly negative content - requires moderation review";
        confidence = 0.7;
      } else if (sentiment.score < -0.5) {
        approved = false;
        reason = "Negative sentiment detected - requires review";
        confidence = 0.6;
      }

      return {
        approved: approved,
        reason: reason,
        confidence: confidence,
        analysis: {
          sentiment: sentiment,
          crisisIndicators: hasCrisisIndicators
            ? crisisKeywords.filter((keyword) => lowerText.includes(keyword))
            : [],
          toxicityScore: Math.abs(sentiment.score),
          categories: analysis.categories,
        },
      };
    } catch (error) {
      console.error("Content moderation error:", error);
      return {
        approved: false,
        reason: "Moderation failed",
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Extract key phrases and topics from text
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Promise<Object>} Key phrases result
   */
  async extractKeyPhrases(text, languageCode = "en") {
    try {
      const entities = await this.analyzeEntities(text, languageCode);

      if (!entities.success) {
        return {
          success: false,
          phrases: [],
          error: entities.error,
        };
      }

      // Extract important entities and phrases
      const importantEntities = entities.entities
        .filter((entity) => entity.salience > 0.1)
        .sort((a, b) => b.salience - a.salience)
        .slice(0, 10);

      const phrases = importantEntities.map((entity) => ({
        text: entity.name,
        type: entity.type,
        importance: entity.salience,
        mentions: entity.mentions.length,
      }));

      return {
        success: true,
        phrases: phrases,
        language: languageCode,
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
   * Get sentiment label from score
   * @param {number} score - Sentiment score (-1 to 1)
   * @returns {string} Sentiment label
   */
  getSentimentLabel(score) {
    if (score >= 0.3) return "positive";
    if (score <= -0.3) return "negative";
    return "neutral";
  }

  /**
   * Detect language of text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Language detection result
   */
  async detectLanguage(text) {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
      };

      const [result] = await this.languageClient.detectLanguage({
        document: document,
      });

      return {
        success: true,
        language: result.languages[0].languageCode,
        confidence: result.languages[0].confidence,
      };
    } catch (error) {
      console.error("Language detection error:", error);
      return {
        success: false,
        language: "en",
        confidence: 0,
        error: error.message,
      };
    }
  }
}

export default new LanguageService();
