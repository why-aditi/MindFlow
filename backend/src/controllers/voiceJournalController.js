import voiceJournalingService from "../services/voiceJournalingService.js";
import VoiceJournalEntry from "../models/VoiceJournalEntry.js";
import { AISession } from "../models/Conversation.js";

export const voiceJournalController = {
  /**
   * Generate signed URL for audio upload
   */
  async generateUploadUrl(req, res) {
    try {
      const { uid } = req.user;
      const { fileName, mimeType } = req.body;

      // Validate required fields
      if (!fileName || !mimeType) {
        return res.status(400).json({
          error: "fileName and mimeType are required",
        });
      }

      // Generate upload URL
      const result = await voiceJournalingService.generateUploadUrl(
        uid,
        fileName,
        mimeType
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        uploadUrl: result.uploadUrl,
        fileName: result.fileName,
        bucketName: result.bucketName,
        expiresIn: result.expiresIn,
      });
    } catch (error) {
      console.error("Generate upload URL error:", error);
      res.status(500).json({
        error: "Failed to generate upload URL",
        message: error.message,
      });
    }
  },

  /**
   * Process uploaded audio file and create voice journal entry
   */
  async processAudioFile(req, res) {
    try {
      const { uid } = req.user;
      const { fileName, mimeType, fileSize, sessionId } = req.body;

      // Validate required fields
      if (!fileName || !mimeType || !fileSize) {
        return res.status(400).json({
          error: "fileName, mimeType, and fileSize are required",
        });
      }

      // Process the audio file
      const result = await voiceJournalingService.processAudioFile(
        uid,
        sessionId,
        fileName,
        mimeType,
        fileSize
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        entry: result.entry,
        sessionId: result.sessionId,
        message: "Voice journal entry created successfully",
      });
    } catch (error) {
      console.error("Process audio file error:", error);
      res.status(500).json({
        error: "Failed to process audio file",
        message: error.message,
      });
    }
  },

  /**
   * Get user's voice journal entries
   */
  async getVoiceEntries(req, res) {
    try {
      const { uid } = req.user;
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        moodMin,
        moodMax,
        themes,
        startDate,
        endDate,
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      // Add filters if provided
      if (moodMin !== undefined && moodMax !== undefined) {
        options.moodRange = {
          min: parseInt(moodMin),
          max: parseInt(moodMax),
        };
      }

      if (themes) {
        options.themes = themes.split(",");
      }

      if (startDate && endDate) {
        options.dateRange = {
          start: startDate,
          end: endDate,
        };
      }

      const result = await voiceJournalingService.getUserVoiceEntries(
        uid,
        options
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        entries: result.entries,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get voice entries error:", error);
      res.status(500).json({
        error: "Failed to get voice entries",
        message: error.message,
      });
    }
  },

  /**
   * Get single voice journal entry
   */
  async getVoiceEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const entry = await VoiceJournalEntry.findOne({
        _id: id,
        userId: uid,
      }).populate("sessionId", "summary language");

      if (!entry) {
        return res.status(404).json({
          error: "Voice journal entry not found",
        });
      }

      res.json({
        success: true,
        entry,
      });
    } catch (error) {
      console.error("Get voice entry error:", error);
      res.status(500).json({
        error: "Failed to get voice entry",
        message: error.message,
      });
    }
  },

  /**
   * Get voice journal analytics
   */
  async getVoiceAnalytics(req, res) {
    try {
      const { uid } = req.user;
      const { timeRange = "30d" } = req.query;

      const result = await voiceJournalingService.getVoiceJournalAnalytics(
        uid,
        timeRange
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        analytics: result.analytics,
      });
    } catch (error) {
      console.error("Get voice analytics error:", error);
      res.status(500).json({
        error: "Failed to get voice analytics",
        message: error.message,
      });
    }
  },

  /**
   * Update voice journal entry (tags, privacy settings)
   */
  async updateVoiceEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { tags, privacy, memoryTags } = req.body;

      const entry = await VoiceJournalEntry.findOne({ _id: id, userId: uid });

      if (!entry) {
        return res.status(404).json({
          error: "Voice journal entry not found",
        });
      }

      // Update fields if provided
      if (tags !== undefined) {
        entry.tags = tags;
      }

      if (privacy !== undefined) {
        entry.privacy = privacy;
      }

      if (memoryTags !== undefined) {
        entry.memoryTags = { ...entry.memoryTags, ...memoryTags };
      }

      entry.updatedAt = new Date();
      await entry.save();

      res.json({
        success: true,
        entry,
        message: "Voice journal entry updated successfully",
      });
    } catch (error) {
      console.error("Update voice entry error:", error);
      res.status(500).json({
        error: "Failed to update voice entry",
        message: error.message,
      });
    }
  },

  /**
   * Delete voice journal entry
   */
  async deleteVoiceEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const result = await voiceJournalingService.deleteVoiceEntry(uid, id);

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Delete voice entry error:", error);
      res.status(500).json({
        error: "Failed to delete voice entry",
        message: error.message,
      });
    }
  },

  /**
   * Get voice journal entries by mood range
   */
  async getEntriesByMood(req, res) {
    try {
      const { uid } = req.user;
      const { minMood, maxMood } = req.params;

      const entries = await VoiceJournalEntry.getByMoodRange(
        uid,
        parseInt(minMood),
        parseInt(maxMood)
      );

      res.json({
        success: true,
        entries,
      });
    } catch (error) {
      console.error("Get entries by mood error:", error);
      res.status(500).json({
        error: "Failed to get entries by mood",
        message: error.message,
      });
    }
  },

  /**
   * Get voice journal entries by themes
   */
  async getEntriesByThemes(req, res) {
    try {
      const { uid } = req.user;
      const { themes } = req.query;

      if (!themes) {
        return res.status(400).json({
          error: "Themes parameter is required",
        });
      }

      const themeArray = themes.split(",");
      const entries = await VoiceJournalEntry.getByThemes(uid, themeArray);

      res.json({
        success: true,
        entries,
      });
    } catch (error) {
      console.error("Get entries by themes error:", error);
      res.status(500).json({
        error: "Failed to get entries by themes",
        message: error.message,
      });
    }
  },

  /**
   * Get recent voice journal entries
   */
  async getRecentEntries(req, res) {
    try {
      const { uid } = req.user;
      const { limit = 5 } = req.query;

      const entries = await VoiceJournalEntry.find({ userId: uid })
        .populate("sessionId", "summary language")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        entries,
      });
    } catch (error) {
      console.error("Get recent entries error:", error);
      res.status(500).json({
        error: "Failed to get recent entries",
        message: error.message,
      });
    }
  },

  /**
   * Get voice journal statistics
   */
  async getVoiceStats(req, res) {
    try {
      const { uid } = req.user;

      const [totalEntries, totalDuration, averageMood, recentEntries] =
        await Promise.all([
          VoiceJournalEntry.countDocuments({ userId: uid }),
          VoiceJournalEntry.aggregate([
            { $match: { userId: uid } },
            {
              $group: {
                _id: null,
                totalDuration: { $sum: "$audioFile.duration" },
              },
            },
          ]),
          VoiceJournalEntry.aggregate([
            {
              $match: {
                userId: uid,
                "aiAnalysis.moodScore": { $exists: true },
              },
            },
            {
              $group: {
                _id: null,
                averageMood: { $avg: "$aiAnalysis.moodScore" },
              },
            },
          ]),
          VoiceJournalEntry.find({ userId: uid })
            .sort({ createdAt: -1 })
            .limit(7),
        ]);

      const stats = {
        totalEntries,
        totalDuration: totalDuration[0]?.totalDuration || 0,
        averageMood: averageMood[0]?.averageMood || 0,
        recentEntriesCount: recentEntries.length,
        lastEntryDate: recentEntries[0]?.createdAt || null,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Get voice stats error:", error);
      res.status(500).json({
        error: "Failed to get voice stats",
        message: error.message,
      });
    }
  },
};
