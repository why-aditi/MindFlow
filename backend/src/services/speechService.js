import { SpeechClient } from "@google-cloud/speech";
import fs from "fs";
import path from "path";

class SpeechService {
  constructor() {
    this.speechClient = new SpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.defaultConfig = {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: process.env.SPEECH_LANGUAGE_CODE || "en-US",
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      model: "latest_long",
    };
  }

  /**
   * Convert audio buffer to text using Google Cloud Speech-to-Text
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioBuffer, options = {}) {
    try {
      const config = {
        ...this.defaultConfig,
        ...options.config,
      };

      const request = {
        audio: {
          content: audioBuffer.toString("base64"),
        },
        config: config,
      };

      const [response] = await this.speechClient.recognize(request);

      if (!response.results || response.results.length === 0) {
        return {
          success: false,
          text: "",
          confidence: 0,
          error: "No transcription results found",
        };
      }

      const result = response.results[0];
      const alternative = result.alternatives[0];

      return {
        success: true,
        text: alternative.transcript,
        confidence: alternative.confidence,
        words: alternative.words || [],
        languageCode: config.languageCode,
      };
    } catch (error) {
      console.error("Speech-to-text error:", error);
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Transcribe audio file from file path
   * @param {string} filePath - Path to audio file
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeFile(filePath, options = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      const audioBuffer = fs.readFileSync(filePath);
      return await this.transcribeAudio(audioBuffer, options);
    } catch (error) {
      console.error("File transcription error:", error);
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Streaming transcription for real-time audio
   * @param {Object} options - Configuration options
   * @returns {Object} Streaming recognition request
   */
  createStreamingRecognize(options = {}) {
    const config = {
      ...this.defaultConfig,
      ...options.config,
    };

    return this.speechClient
      .streamingRecognize({
        config: {
          encoding: config.encoding,
          sampleRateHertz: config.sampleRateHertz,
          languageCode: config.languageCode,
          enableAutomaticPunctuation: config.enableAutomaticPunctuation,
          model: config.model,
        },
        interimResults: true,
      })
      .on("error", (error) => {
        console.error("Streaming recognition error:", error);
      });
  }

  /**
   * Detect language from audio content
   * @param {Buffer} audioBuffer - Audio data buffer
   * @returns {Promise<Object>} Language detection result
   */
  async detectLanguage(audioBuffer) {
    try {
      const config = {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US", // Start with English
        alternativeLanguageCodes: ["es-ES", "fr-FR", "de-DE", "zh-CN", "ja-JP"],
      };

      const request = {
        audio: {
          content: audioBuffer.toString("base64"),
        },
        config: config,
      };

      const [response] = await this.speechClient.recognize(request);

      if (!response.results || response.results.length === 0) {
        return {
          success: false,
          languageCode: "en-US",
          confidence: 0,
        };
      }

      const result = response.results[0];
      const alternative = result.alternatives[0];

      return {
        success: true,
        languageCode: config.languageCode,
        confidence: alternative.confidence,
        text: alternative.transcript,
      };
    } catch (error) {
      console.error("Language detection error:", error);
      return {
        success: false,
        languageCode: "en-US",
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get supported languages
   * @returns {Array} List of supported language codes
   */
  getSupportedLanguages() {
    return [
      "en-US",
      "en-GB",
      "en-AU",
      "en-CA",
      "es-ES",
      "es-MX",
      "es-AR",
      "es-CO",
      "fr-FR",
      "fr-CA",
      "de-DE",
      "de-AT",
      "it-IT",
      "pt-BR",
      "pt-PT",
      "zh-CN",
      "zh-TW",
      "ja-JP",
      "ko-KR",
      "ru-RU",
      "ar-SA",
      "hi-IN",
      "th-TH",
      "nl-NL",
      "sv-SE",
      "no-NO",
      "da-DK",
      "fi-FI",
      "pl-PL",
      "tr-TR",
      "cs-CZ",
      "hu-HU",
      "ro-RO",
      "bg-BG",
      "hr-HR",
      "sk-SK",
      "sl-SI",
      "et-EE",
      "lv-LV",
      "lt-LT",
      "uk-UA",
      "el-GR",
      "he-IL",
    ];
  }

  /**
   * Validate audio format and provide conversion suggestions
   * @param {string} mimeType - Audio MIME type
   * @returns {Object} Validation result
   */
  validateAudioFormat(mimeType) {
    const supportedFormats = {
      "audio/webm": { encoding: "WEBM_OPUS", sampleRate: 48000 },
      "audio/mp4": { encoding: "MP4", sampleRate: 48000 },
      "audio/wav": { encoding: "LINEAR16", sampleRate: 16000 },
      "audio/flac": { encoding: "FLAC", sampleRate: 16000 },
      "audio/ogg": { encoding: "OGG_OPUS", sampleRate: 48000 },
    };

    const format = supportedFormats[mimeType];

    if (format) {
      return {
        supported: true,
        encoding: format.encoding,
        sampleRate: format.sampleRate,
        message: "Format is supported",
      };
    }

    return {
      supported: false,
      encoding: "WEBM_OPUS",
      sampleRate: 48000,
      message:
        "Format not supported. Please convert to WebM, MP4, WAV, FLAC, or OGG.",
      suggestedFormats: Object.keys(supportedFormats),
    };
  }
}

export default new SpeechService();
