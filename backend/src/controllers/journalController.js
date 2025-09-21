import JournalEntry from "../models/JournalEntry.js";
import geminiService from "../services/geminiService.js";

export const journalController = {
  // Create new journal entry
  async createEntry(req, res) {
    try {
      const { uid } = req.user;
      const { content, mood, tags } = req.body;

      // If no mood is provided, analyze the content to determine mood using Gemini
      let detectedMood = mood;
      if (!mood && content) {
        try {
          const sentimentPrompt = `Analyze the emotional sentiment of this journal entry and determine the primary mood. 

Journal Entry: "${content}"

Respond with ONLY one of these mood values based on the emotional tone:
- happy (for positive, joyful, excited feelings)
- sad (for negative, melancholic, grieving feelings)  
- anxious (for worried, nervous, stressed feelings)
- angry (for frustrated, irritated, mad feelings)
- calm (for peaceful, relaxed, serene feelings)
- tired (for exhausted, drained, fatigued feelings)
- confused (for uncertain, puzzled, lost feelings)
- excited (for enthusiastic, energetic, thrilled feelings)
- neutral (for balanced, neither positive nor negative feelings)

Mood:`;

          const sentimentResult = await geminiService.generateContent(
            sentimentPrompt
          );
          const moodResponse = sentimentResult.trim().toLowerCase();

          // Validate the response is one of our valid moods
          const validMoods = [
            "happy",
            "sad",
            "anxious",
            "angry",
            "calm",
            "tired",
            "confused",
            "excited",
            "neutral",
          ];
          if (validMoods.includes(moodResponse)) {
            detectedMood = moodResponse;
          } else {
            // If response doesn't match exactly, try to extract mood from response
            for (const validMood of validMoods) {
              if (moodResponse.includes(validMood)) {
                detectedMood = validMood;
                break;
              }
            }
            if (!detectedMood) {
              detectedMood = "neutral";
            }
          }
        } catch (analysisError) {
          console.warn(
            "Failed to analyze mood with Gemini, using neutral:",
            analysisError.message
          );
          detectedMood = "neutral";
        }
      }

      const newEntry = new JournalEntry({
        userId: uid,
        content: content,
        mood: detectedMood || "neutral",
        tags: tags || [],
      });

      const savedEntry = await newEntry.save();

      res.status(201).json({
        success: true,
        message: "Journal entry created successfully",
        entryId: savedEntry._id,
        detectedMood: detectedMood,
      });
    } catch (error) {
      console.error("Create entry error:", error);
      res.status(500).json({
        error: "Failed to create journal entry",
        message: error.message,
      });
    }
  },

  // Get journal entries with pagination and filters
  async getEntries(req, res) {
    try {
      const { uid } = req.user;
      const { page = 1, limit = 10, mood, startDate, endDate } = req.query;

      // Build query filter
      const filter = { userId: uid };

      if (mood) {
        filter.mood = mood;
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const entries = await JournalEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await JournalEntry.countDocuments(filter);

      res.json({
        success: true,
        entries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get entries error:", error);
      res.status(500).json({
        error: "Failed to get journal entries",
        message: error.message,
      });
    }
  },

  // Get single journal entry
  async getEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const entry = await JournalEntry.findOne({ _id: id, userId: uid });

      if (!entry) {
        return res.status(404).json({
          error: "Journal entry not found",
        });
      }

      res.json({
        success: true,
        entry,
      });
    } catch (error) {
      console.error("Get entry error:", error);
      res.status(500).json({
        error: "Failed to get journal entry",
        message: error.message,
      });
    }
  },

  // Update journal entry
  async updateEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { content, mood, tags } = req.body;

      const entry = await JournalEntry.findOne({ _id: id, userId: uid });

      if (!entry) {
        return res.status(404).json({
          error: "Journal entry not found",
        });
      }

      if (content) entry.content = content;
      if (mood) entry.mood = mood;
      if (tags) entry.tags = tags;

      await entry.save();

      res.json({
        success: true,
        message: "Journal entry updated successfully",
      });
    } catch (error) {
      console.error("Update entry error:", error);
      res.status(500).json({
        error: "Failed to update journal entry",
        message: error.message,
      });
    }
  },

  // Delete journal entry
  async deleteEntry(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const result = await JournalEntry.deleteOne({ _id: id, userId: uid });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Journal entry not found",
        });
      }

      res.json({
        success: true,
        message: "Journal entry deleted successfully",
      });
    } catch (error) {
      console.error("Delete entry error:", error);
      res.status(500).json({
        error: "Failed to delete journal entry",
        message: error.message,
      });
    }
  },

  // Get journal analytics
  async getAnalytics(req, res) {
    try {
      const { uid } = req.user;

      const entries = await JournalEntry.find({ userId: uid });

      // Calculate mood distribution
      const moodCounts = {};
      entries.forEach((entry) => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      // Calculate entries per month
      const monthlyCounts = {};
      entries.forEach((entry) => {
        const month = entry.createdAt.toISOString().substring(0, 7);
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      });

      res.json({
        success: true,
        analytics: {
          totalEntries: entries.length,
          moodDistribution: moodCounts,
          monthlyCounts,
          averageEntriesPerMonth:
            Object.values(monthlyCounts).reduce((a, b) => a + b, 0) /
              Object.keys(monthlyCounts).length || 0,
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        error: "Failed to get journal analytics",
        message: error.message,
      });
    }
  },
};
