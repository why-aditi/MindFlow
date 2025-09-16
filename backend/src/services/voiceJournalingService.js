import { Storage } from "@google-cloud/storage";
import speech from "@google-cloud/speech";
import language from "@google-cloud/language";
import geminiService from "./geminiService.js";
import VoiceJournalEntry from "../models/VoiceJournalEntry.js";
import { AISession } from "../models/Conversation.js";

class VoiceJournalingService {
  constructor() {
    // Initialize Google Cloud services with error handling
    try {
      this.storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      this.speechClient = new speech.SpeechClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      this.languageClient = new language.LanguageServiceClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    } catch (error) {
      console.warn(
        "Google Cloud services initialization failed:",
        error.message
      );
      this.storage = null;
      this.speechClient = null;
      this.languageClient = null;
    }

    // Configuration
    this.bucketName =
      process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "mindflow-voice-journals";
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/webm",
      "audio/ogg",
      "audio/flac",
    ];
  }

  /**
   * Generate signed URL for audio upload
   */
  async generateUploadUrl(userId, fileName, mimeType) {
    try {
      // Validate file type
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`Unsupported audio format: ${mimeType}`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `voice-journals/${userId}/${timestamp}_${sanitizedFileName}`;

      // Get signed URL for upload
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(uniqueFileName);

      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: mimeType,
        extensionHeaders: {
          "x-goog-content-length-range": `0,${this.maxFileSize}`,
        },
      });

      return {
        success: true,
        uploadUrl: signedUrl,
        fileName: uniqueFileName,
        bucketName: this.bucketName,
        expiresIn: 15 * 60 * 1000, // 15 minutes
      };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process uploaded audio file and create voice journal entry
   */
  async processAudioFile(userId, sessionId, fileName, mimeType, fileSize) {
    try {
      // Get audio file from Cloud Storage
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("Audio file not found in storage");
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      const duration = await this.getAudioDuration(file);

      // Transcribe audio
      const transcription = await this.transcribeAudio(file);

      // Analyze with Natural Language API
      const nlpAnalysis = await this.analyzeText(transcription.text);

      // Get or create AI session
      let session = await AISession.findById(sessionId);
      if (!session) {
        session = new AISession({
          userId,
          language: "en",
          context: { type: "voice-journaling" },
        });
        await session.save();
      }

      // Analyze with Gemini AI
      const aiAnalysis = await geminiService.analyzeJournalEntry(
        transcription.text,
        userId
      );

      // Extract memory tags
      const memoryTags = await this.extractMemoryTags(
        transcription.text,
        nlpAnalysis,
        aiAnalysis
      );

      // Create voice journal entry
      const voiceEntry = new VoiceJournalEntry({
        userId,
        sessionId: session._id,
        audioFile: {
          bucketName: this.bucketName,
          fileName,
          fileSize,
          duration,
          mimeType,
          uploadUrl: `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
        },
        transcription,
        nlpAnalysis,
        aiAnalysis,
        memoryTags,
        tags: this.generateTags(nlpAnalysis, aiAnalysis),
      });

      await voiceEntry.save();

      // Update session with voice entry reference
      if (!session.voiceEntries) {
        session.voiceEntries = [];
      }
      session.voiceEntries.push(voiceEntry._id);
      session.lastActivity = new Date();
      await session.save();

      return {
        success: true,
        entry: voiceEntry,
        sessionId: session._id,
      };
    } catch (error) {
      console.error("Error processing audio file:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transcribe audio using Google Cloud Speech-to-Text
   */
  async transcribeAudio(file) {
    try {
      if (!this.speechClient) {
        throw new Error(
          "Speech-to-Text service not available. Please check Google Cloud configuration."
        );
      }

      const audio = {
        uri: `gs://${this.bucketName}/${file.name}`,
      };

      const config = {
        encoding: this.getAudioEncoding(file.name),
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: "latest_long",
      };

      const request = {
        audio,
        config,
      };

      const [response] = await this.speechClient.recognize(request);
      const result = response.results[0];

      if (!result) {
        throw new Error("No transcription results found");
      }

      const alternative = result.alternatives[0];

      return {
        text: alternative.transcript,
        confidence: alternative.confidence,
        language: config.languageCode,
        alternatives: result.alternatives.map((alt) => ({
          text: alt.transcript,
          confidence: alt.confidence,
        })),
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }

  /**
   * Analyze text using Google Cloud Natural Language API
   */
  async analyzeText(text) {
    try {
      if (!this.languageClient) {
        throw new Error(
          "Natural Language API service not available. Please check Google Cloud configuration."
        );
      }

      const document = {
        content: text,
        type: "PLAIN_TEXT",
      };

      // Sentiment analysis
      const [sentimentResult] = await this.languageClient.analyzeSentiment({
        document,
      });

      // Entity analysis
      const [entityResult] = await this.languageClient.analyzeEntities({
        document,
        encodingType: "UTF8",
      });

      // Classification
      const [classificationResult] = await this.languageClient.classifyText({
        document,
      });

      return {
        sentiment: {
          score: sentimentResult.documentSentiment.score,
          magnitude: sentimentResult.documentSentiment.magnitude,
        },
        entities: entityResult.entities.map((entity) => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience,
          mentions: entity.mentions.map((mention) => ({
            text: mention.text.content,
            beginOffset: mention.text.beginOffset,
            endOffset: mention.text.beginOffset + mention.text.content.length,
          })),
        })),
        categories: classificationResult.categories.map((category) => ({
          name: category.name,
          confidence: category.confidence,
        })),
      };
    } catch (error) {
      console.error("Error analyzing text:", error);
      throw error;
    }
  }

  /**
   * Extract memory tags for episodic and semantic memory
   */
  async extractMemoryTags(text, nlpAnalysis, aiAnalysis) {
    const tags = {
      episodic: [],
      semantic: [],
      contextual: [],
    };

    // Extract episodic memory tags (breakthrough moments, significant events)
    const breakthroughKeywords = [
      "breakthrough",
      "realized",
      "understood",
      "learned",
      "discovered",
      "epiphany",
      "moment",
      "turning point",
      "changed my mind",
    ];

    breakthroughKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        tags.episodic.push(keyword);
      }
    });

    // Extract semantic memory tags (coping strategies, recurring triggers)
    const copingKeywords = [
      "breathing",
      "meditation",
      "exercise",
      "walk",
      "music",
      "journal",
      "talk",
      "therapy",
      "counselor",
      "friend",
      "family",
      "support",
    ];

    copingKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        tags.semantic.push(keyword);
      }
    });

    // Extract contextual tags (stress periods, calendar events)
    const contextualKeywords = [
      "exam",
      "test",
      "deadline",
      "project",
      "work",
      "school",
      "holiday",
      "birthday",
      "anniversary",
      "vacation",
      "trip",
    ];

    contextualKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        tags.contextual.push(keyword);
      }
    });

    // Add themes from AI analysis
    if (aiAnalysis.themes) {
      tags.semantic.push(...aiAnalysis.themes);
    }

    return tags;
  }

  /**
   * Generate tags based on analysis
   */
  generateTags(nlpAnalysis, aiAnalysis) {
    const tags = [];

    // Add emotion tags
    if (aiAnalysis.emotions) {
      aiAnalysis.emotions.forEach((emotion) => {
        if (emotion.intensity > 0.7) {
          tags.push(emotion.name);
        }
      });
    }

    // Add sentiment tags
    if (nlpAnalysis.sentiment.score > 0.3) {
      tags.push("positive");
    } else if (nlpAnalysis.sentiment.score < -0.3) {
      tags.push("negative");
    } else {
      tags.push("neutral");
    }

    // Add theme tags
    if (aiAnalysis.themes) {
      tags.push(...aiAnalysis.themes.slice(0, 3)); // Limit to top 3 themes
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Get audio duration using ffprobe (if available) or estimate
   */
  async getAudioDuration(file) {
    try {
      // For now, we'll estimate duration based on file size
      // In production, you might want to use ffprobe or similar tool
      const [metadata] = await file.getMetadata();
      const fileSizeBytes = parseInt(metadata.size);

      // Rough estimation: assume 16kHz, 16-bit audio
      const estimatedDuration = fileSizeBytes / (16000 * 2); // 2 bytes per sample
      return Math.round(estimatedDuration);
    } catch (error) {
      console.error("Error getting audio duration:", error);
      return 0; // Default duration
    }
  }

  /**
   * Get audio encoding from file extension
   */
  getAudioEncoding(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();

    const encodingMap = {
      wav: "LINEAR16",
      mp3: "MP3",
      webm: "WEBM_OPUS",
      ogg: "OGG_OPUS",
      flac: "FLAC",
    };

    return encodingMap[extension] || "LINEAR16";
  }

  /**
   * Get user's voice journal entries
   */
  async getUserVoiceEntries(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        moodRange,
        themes,
        dateRange,
      } = options;

      const query = { userId };

      // Add mood range filter
      if (
        moodRange &&
        moodRange.min !== undefined &&
        moodRange.max !== undefined
      ) {
        query["aiAnalysis.moodScore"] = {
          $gte: moodRange.min,
          $lte: moodRange.max,
        };
      }

      // Add themes filter
      if (themes && themes.length > 0) {
        query["aiAnalysis.themes"] = { $in: themes };
      }

      // Add date range filter
      if (dateRange && dateRange.start && dateRange.end) {
        query.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end),
        };
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const entries = await VoiceJournalEntry.find(query)
        .populate("sessionId", "summary language")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await VoiceJournalEntry.countDocuments(query);

      return {
        success: true,
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting voice entries:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get voice journal analytics
   */
  async getVoiceJournalAnalytics(userId, timeRange = "30d") {
    try {
      const now = new Date();
      const timeRangeMs = this.getTimeRangeMs(timeRange);
      const startDate = new Date(now.getTime() - timeRangeMs);

      const entries = await VoiceJournalEntry.find({
        userId,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: 1 });

      if (entries.length === 0) {
        return {
          success: true,
          analytics: {
            totalEntries: 0,
            totalDuration: 0,
            averageDuration: 0,
            moodTrends: [],
            emotionDistribution: {},
            themeFrequency: {},
            speakingPatterns: {},
          },
        };
      }

      // Calculate analytics
      const totalDuration = entries.reduce(
        (sum, entry) => sum + entry.audioFile.duration,
        0
      );
      const averageDuration = totalDuration / entries.length;

      // Mood trends
      const moodTrends = entries.map((entry) => ({
        date: entry.createdAt,
        mood: entry.aiAnalysis.moodScore || 5,
        duration: entry.audioFile.duration,
      }));

      // Emotion distribution
      const emotionDistribution = {};
      entries.forEach((entry) => {
        if (entry.aiAnalysis.emotions) {
          entry.aiAnalysis.emotions.forEach((emotion) => {
            emotionDistribution[emotion.name] =
              (emotionDistribution[emotion.name] || 0) + emotion.intensity;
          });
        }
      });

      // Theme frequency
      const themeFrequency = {};
      entries.forEach((entry) => {
        if (entry.aiAnalysis.themes) {
          entry.aiAnalysis.themes.forEach((theme) => {
            themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
          });
        }
      });

      // Speaking patterns (time of day, day of week)
      const speakingPatterns = {
        timeOfDay: {},
        dayOfWeek: {},
      };

      entries.forEach((entry) => {
        const hour = entry.createdAt.getHours();
        const dayOfWeek = entry.createdAt.getDay();

        speakingPatterns.timeOfDay[hour] =
          (speakingPatterns.timeOfDay[hour] || 0) + 1;
        speakingPatterns.dayOfWeek[dayOfWeek] =
          (speakingPatterns.dayOfWeek[dayOfWeek] || 0) + 1;
      });

      return {
        success: true,
        analytics: {
          totalEntries: entries.length,
          totalDuration,
          averageDuration: Math.round(averageDuration),
          moodTrends,
          emotionDistribution,
          themeFrequency,
          speakingPatterns,
        },
      };
    } catch (error) {
      console.error("Error getting voice journal analytics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get time range in milliseconds
   */
  getTimeRangeMs(timeRange) {
    const ranges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    };
    return ranges[timeRange] || ranges["30d"];
  }

  /**
   * Delete voice journal entry and associated files
   */
  async deleteVoiceEntry(userId, entryId) {
    try {
      const entry = await VoiceJournalEntry.findOne({ _id: entryId, userId });

      if (!entry) {
        throw new Error("Voice journal entry not found");
      }

      // Delete audio file from Cloud Storage
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(entry.audioFile.fileName);

      try {
        await file.delete();
      } catch (error) {
        console.warn("Error deleting audio file:", error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete database entry
      await VoiceJournalEntry.findByIdAndDelete(entryId);

      return {
        success: true,
        message: "Voice journal entry deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting voice entry:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new VoiceJournalingService();
