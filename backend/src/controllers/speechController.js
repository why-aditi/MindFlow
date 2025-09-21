import speechService from "../services/speechService.js";
import multer from "multer";
import path from "path";

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "audio/webm",
      "audio/mp4",
      "audio/wav",
      "audio/flac",
      "audio/ogg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid audio format. Supported formats: WebM, MP4, WAV, FLAC, OGG"
        ),
        false
      );
    }
  },
});

export const speechController = {
  /**
   * Transcribe uploaded audio file
   */
  async transcribeAudio(req, res) {
    try {
      const { uid } = req.user;
      const { languageCode, enablePunctuation } = req.body;

      if (!req.file) {
        return res.status(400).json({
          error: "No audio file provided",
        });
      }

      // Validate audio format
      const formatValidation = speechService.validateAudioFormat(
        req.file.mimetype
      );
      if (!formatValidation.supported) {
        return res.status(400).json({
          error: "Unsupported audio format",
          message: formatValidation.message,
          suggestedFormats: formatValidation.suggestedFormats,
        });
      }

      // Configure transcription options
      const options = {
        config: {
          languageCode:
            languageCode || process.env.SPEECH_LANGUAGE_CODE || "en-US",
          enableAutomaticPunctuation: enablePunctuation !== false,
          encoding: formatValidation.encoding,
          sampleRateHertz: formatValidation.sampleRate,
        },
      };

      // Transcribe audio
      const result = await speechService.transcribeAudio(
        req.file.buffer,
        options
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Transcription failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        transcription: {
          text: result.text,
          confidence: result.confidence,
          languageCode: result.languageCode,
          wordCount: result.text.split(/\s+/).length,
        },
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          processingTime: Date.now() - req.startTime,
        },
      });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({
        error: "Failed to transcribe audio",
        message: error.message,
      });
    }
  },

  /**
   * Detect language from audio
   */
  async detectLanguage(req, res) {
    try {
      const { uid } = req.user;

      if (!req.file) {
        return res.status(400).json({
          error: "No audio file provided",
        });
      }

      const result = await speechService.detectLanguage(req.file.buffer);

      if (!result.success) {
        return res.status(500).json({
          error: "Language detection failed",
          message: result.error,
        });
      }

      res.json({
        success: true,
        language: {
          code: result.languageCode,
          confidence: result.confidence,
          text: result.text,
        },
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
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

  /**
   * Get supported languages
   */
  async getSupportedLanguages(req, res) {
    try {
      const languages = speechService.getSupportedLanguages();

      res.json({
        success: true,
        languages: languages,
        defaultLanguage: process.env.SPEECH_LANGUAGE_CODE || "en-US",
      });
    } catch (error) {
      console.error("Get supported languages error:", error);
      res.status(500).json({
        error: "Failed to get supported languages",
        message: error.message,
      });
    }
  },

  /**
   * Validate audio format
   */
  async validateFormat(req, res) {
    try {
      const { mimeType } = req.body;

      if (!mimeType) {
        return res.status(400).json({
          error: "MIME type is required",
        });
      }

      const validation = speechService.validateAudioFormat(mimeType);

      res.json({
        success: true,
        validation: validation,
      });
    } catch (error) {
      console.error("Format validation error:", error);
      res.status(500).json({
        error: "Failed to validate format",
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

export { upload };
