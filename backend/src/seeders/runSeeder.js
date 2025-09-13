import mongoose from "mongoose";
import { seedExercisePlans } from "./exercisePlanSeeder.js";
import { seedExercises } from "./exerciseSeeder.js";
import { seedJournalEntries } from "./journalSeeder.js";
import dotenv from "dotenv";

dotenv.config();

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mindflow"
    );
    console.log("✅ Connected to MongoDB");

    // Run seeders
    await seedExercisePlans();
    await seedExercises();
    await seedJournalEntries();

    console.log("✅ All seeders completed successfully");
  } catch (error) {
    console.error("❌ Seeder error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  }
};

runSeeder();
