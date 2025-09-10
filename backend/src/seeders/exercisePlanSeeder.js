import ExercisePlan from "../models/ExercisePlan.js";

const sampleExercisePlans = [
  {
    name: "Morning Yoga Flow",
    description:
      "A gentle 15-minute yoga flow perfect for starting your day with energy and mindfulness",
    type: "yoga",
    difficulty: "beginner",
    duration: 15,
    exercises: [
      {
        name: "Mountain Pose (Tadasana)",
        description: "Stand tall with feet hip-width apart, arms at sides",
        duration: 60,
        instructions: [
          {
            step: 1,
            text: "Stand with feet hip-width apart",
            audioFile: null,
          },
          {
            step: 2,
            text: "Engage your core and lengthen your spine",
            audioFile: null,
          },
          {
            step: 3,
            text: "Relax your shoulders and breathe deeply",
            audioFile: null,
          },
        ],
        poseData: {
          keyPoints: [
            { name: "left_shoulder", x: 0.3, y: 0.2, confidence: 0.9 },
            { name: "right_shoulder", x: 0.7, y: 0.2, confidence: 0.9 },
            { name: "left_hip", x: 0.4, y: 0.5, confidence: 0.9 },
            { name: "right_hip", x: 0.6, y: 0.5, confidence: 0.9 },
          ],
          expectedPose: "mountain_pose",
        },
        breathingPattern: {
          inhaleDuration: 4,
          exhaleDuration: 4,
          holdDuration: 0,
          pattern: "4-0-4",
        },
      },
      {
        name: "Downward Dog (Adho Mukha Svanasana)",
        description: "Inverted V-shape pose to stretch and strengthen",
        duration: 90,
        instructions: [
          {
            step: 1,
            text: "Start on hands and knees",
            audioFile: null,
          },
          {
            step: 2,
            text: "Tuck toes and lift hips up and back",
            audioFile: null,
          },
          {
            step: 3,
            text: "Straighten legs and press heels down",
            audioFile: null,
          },
        ],
        poseData: {
          keyPoints: [
            { name: "left_shoulder", x: 0.3, y: 0.3, confidence: 0.9 },
            { name: "right_shoulder", x: 0.7, y: 0.3, confidence: 0.9 },
            { name: "left_hip", x: 0.4, y: 0.6, confidence: 0.9 },
            { name: "right_hip", x: 0.6, y: 0.6, confidence: 0.9 },
          ],
          expectedPose: "downward_dog",
        },
        breathingPattern: {
          inhaleDuration: 4,
          exhaleDuration: 6,
          holdDuration: 0,
          pattern: "4-0-6",
        },
      },
    ],
    environment: "studio",
    backgroundMusic: null,
  },
  {
    name: "Breathing Meditation",
    description:
      "A calming 10-minute breathing meditation to reduce stress and improve focus",
    type: "meditation",
    difficulty: "beginner",
    duration: 10,
    exercises: [
      {
        name: "4-4-4 Breathing",
        description: "Equal breathing pattern for relaxation",
        duration: 300,
        instructions: [
          {
            step: 1,
            text: "Sit comfortably with spine straight",
            audioFile: null,
          },
          {
            step: 2,
            text: "Inhale for 4 counts",
            audioFile: null,
          },
          {
            step: 3,
            text: "Hold for 4 counts",
            audioFile: null,
          },
          {
            step: 4,
            text: "Exhale for 4 counts",
            audioFile: null,
          },
        ],
        poseData: {
          keyPoints: [
            { name: "left_shoulder", x: 0.3, y: 0.2, confidence: 0.9 },
            { name: "right_shoulder", x: 0.7, y: 0.2, confidence: 0.9 },
            { name: "nose", x: 0.5, y: 0.15, confidence: 0.9 },
          ],
          expectedPose: "seated_meditation",
        },
        breathingPattern: {
          inhaleDuration: 4,
          exhaleDuration: 4,
          holdDuration: 4,
          pattern: "4-4-4",
        },
      },
    ],
    environment: "ocean",
    backgroundMusic: null,
  },
  {
    name: "Advanced Warrior Flow",
    description: "An intense 25-minute yoga flow for experienced practitioners",
    type: "yoga",
    difficulty: "advanced",
    duration: 25,
    exercises: [
      {
        name: "Warrior I (Virabhadrasana I)",
        description: "Strong standing pose with arms raised",
        duration: 120,
        instructions: [
          {
            step: 1,
            text: "Step forward into a lunge position",
            audioFile: null,
          },
          {
            step: 2,
            text: "Raise arms overhead and gaze up",
            audioFile: null,
          },
          {
            step: 3,
            text: "Hold the pose with strong legs",
            audioFile: null,
          },
        ],
        poseData: {
          keyPoints: [
            { name: "left_shoulder", x: 0.3, y: 0.2, confidence: 0.9 },
            { name: "right_shoulder", x: 0.7, y: 0.2, confidence: 0.9 },
            { name: "left_hip", x: 0.4, y: 0.5, confidence: 0.9 },
            { name: "right_hip", x: 0.6, y: 0.5, confidence: 0.9 },
            { name: "left_knee", x: 0.4, y: 0.7, confidence: 0.9 },
            { name: "right_knee", x: 0.6, y: 0.7, confidence: 0.9 },
          ],
          expectedPose: "warrior_1",
        },
        breathingPattern: {
          inhaleDuration: 4,
          exhaleDuration: 4,
          holdDuration: 0,
          pattern: "4-0-4",
        },
      },
    ],
    environment: "mountain",
    backgroundMusic: null,
  },
];

export const seedExercisePlans = async () => {
  try {
    // Clear existing exercise plans
    await ExercisePlan.deleteMany({});

    // Insert sample exercise plans
    const createdPlans = await ExercisePlan.insertMany(sampleExercisePlans);

    console.log(`✅ Seeded ${createdPlans.length} exercise plans`);
    return createdPlans;
  } catch (error) {
    console.error("❌ Error seeding exercise plans:", error);
    throw error;
  }
};

export default seedExercisePlans;
