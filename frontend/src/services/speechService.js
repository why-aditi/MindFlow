import { getApiBaseUrl } from "../utils/config.js";

class SpeechService {
  constructor() {
    this.apiBaseUrl = getApiBaseUrl();
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  /**
   * Get supported languages from backend
   */
  async getSupportedLanguages(authToken) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/speech/languages`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch supported languages");
      }

      const data = await response.json();
      return data.languages || [];
    } catch (error) {
      console.error("Error fetching supported languages:", error);
      return ["en-US", "es-ES", "fr-FR", "de-DE", "zh-CN", "ja-JP"];
    }
  }

  /**
   * Validate audio format
   */
  async validateFormat(mimeType, authToken) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/speech/validate-format`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ mimeType }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to validate format");
      }

      const data = await response.json();
      return data.validation;
    } catch (error) {
      console.error("Error validating format:", error);
      return { supported: false, message: "Validation failed" };
    }
  }

  /**
   * Transcribe audio file using Google Cloud Speech-to-Text
   */
  async transcribeAudio(audioBlob, options = {}, authToken) {
    try {
      // Validate that audioBlob is a proper Blob
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new Error("Invalid audio blob provided for transcription");
      }

      // Check if blob has content
      if (audioBlob.size === 0) {
        throw new Error("Audio blob is empty - no audio data recorded");
      }

      // Log blob info for debugging
      console.log("Audio blob info:", {
        size: audioBlob.size,
        type: audioBlob.type,
        lastModified: audioBlob.lastModified,
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      if (options.languageCode) {
        formData.append("languageCode", options.languageCode);
      }
      if (options.enablePunctuation !== undefined) {
        formData.append("enablePunctuation", options.enablePunctuation);
      }

      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/speech/transcribe`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Transcription failed");
      }

      const data = await response.json();
      return {
        success: true,
        text: data.transcription.text,
        confidence: data.transcription.confidence,
        languageCode: data.transcription.languageCode,
        wordCount: data.transcription.wordCount,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Detect language from audio
   */
  async detectLanguage(audioBlob, authToken) {
    try {
      // Validate that audioBlob is a proper Blob
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new Error("Invalid audio blob provided for language detection");
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/speech/detect-language`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

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
        language: { code: "en-US", confidence: 0 },
        error: error.message,
      };
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(options = {}) {
    try {
      if (this.isRecording) {
        throw new Error("Recording is already in progress");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log("Audio chunk received:", event.data.size, "bytes");
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        console.log(
          "Recording stopped. Total chunks:",
          this.audioChunks.length,
          "Total size:",
          audioBlob.size,
          "bytes"
        );
        if (options.onComplete) {
          options.onComplete(audioBlob);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        if (options.onError) {
          options.onError(event.error);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop audio recording
   */
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return null;
    }

    this.mediaRecorder.stop();
    this.isRecording = false;

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    return new Blob(this.audioChunks, { type: "audio/webm" });
  }

  /**
   * Check if recording is supported
   */
  isRecordingSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      MediaRecorder
    );
  }

  /**
   * Get available audio formats
   */
  getSupportedMimeTypes() {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/wav",
      "audio/ogg;codecs=opus",
    ];

    return types.filter((type) => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Get authentication token
   */
  async getAuthToken() {
    // This should be implemented based on your auth system
    // For now, we'll assume it's available in localStorage or context
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
   * Create journal entry from speech
   */
  async createJournalEntryFromSpeech(audioBlob, options = {}, authToken) {
    try {
      // Validate that audioBlob is a proper Blob
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new Error(
          "Invalid audio blob provided for journal entry creation"
        );
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      if (options.languageCode) {
        formData.append("languageCode", options.languageCode);
      }
      if (options.mood) {
        formData.append("mood", options.mood);
      }
      if (options.tags) {
        formData.append("tags", JSON.stringify(options.tags));
      }

      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/journal/entries/speech`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create journal entry");
      }

      const data = await response.json();
      return {
        success: true,
        entry: data.entry,
        transcription: data.transcription,
        aiInsights: data.aiInsights,
        message: data.message,
      };
    } catch (error) {
      console.error("Error creating journal entry from speech:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get recording duration
   */
  getRecordingDuration(startTime) {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }

  /**
   * Format duration in MM:SS format
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}

export default new SpeechService();
