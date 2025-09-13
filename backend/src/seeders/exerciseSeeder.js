import Exercise from "../models/Exercise.js";

// MediaPipe Pose Landmark IDs (0-32)
const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

const exercises = [
  // Push-ups
  {
    name: "Push-ups",
    description:
      "Classic upper body strength exercise targeting chest, shoulders, and triceps",
    category: "strength",
    difficulty: "intermediate",
    duration: 60,
    instructions: [
      {
        step: 1,
        text: "Start in a plank position with hands shoulder-width apart",
        imageUrl: "/images/pushup-start.jpg",
      },
      {
        step: 2,
        text: "Lower your body until chest nearly touches the floor",
        imageUrl: "/images/pushup-down.jpg",
      },
      {
        step: 3,
        text: "Push back up to starting position",
        imageUrl: "/images/pushup-up.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_SHOULDER,
          name: "left_shoulder",
          expectedPosition: { x: 0.3, y: 0.2, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_SHOULDER,
          name: "right_shoulder",
          expectedPosition: { x: 0.7, y: 0.2, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_ELBOW,
          name: "left_elbow",
          expectedPosition: { x: 0.25, y: 0.4, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_ELBOW,
          name: "right_elbow",
          expectedPosition: { x: 0.75, y: 0.4, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.4, y: 0.6, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.6, y: 0.6, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
      ],
      transitions: [
        {
          name: "down_motion",
          fromLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_ELBOW,
              position: { x: 0.25, y: 0.3, z: 0.0 },
            },
          ],
          toLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_ELBOW,
              position: { x: 0.25, y: 0.5, z: 0.0 },
            },
          ],
          duration: 2,
        },
      ],
      validationRules: {
        minConfidence: 0.7,
        requiredLandmarks: [
          LANDMARKS.LEFT_SHOULDER,
          LANDMARKS.RIGHT_SHOULDER,
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
        ],
        angleConstraints: [
          {
            name: "elbow_angle",
            landmarks: [
              LANDMARKS.LEFT_SHOULDER,
              LANDMARKS.LEFT_ELBOW,
              LANDMARKS.LEFT_WRIST,
            ],
            minAngle: 90,
            maxAngle: 180,
          },
        ],
        distanceConstraints: [
          {
            name: "shoulder_width",
            landmarks: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
            minDistance: 0.3,
            maxDistance: 0.5,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 8,
      muscleGroups: ["chest", "shoulders", "arms", "core"],
      equipment: ["none"],
      spaceRequired: "medium",
    },
    scoring: {
      poseAccuracyWeight: 0.8,
      timingWeight: 0.1,
      consistencyWeight: 0.1,
      perfectScoreThreshold: 85,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    },
    tags: ["upper_body", "strength", "bodyweight", "chest"],
  },

  // Squats
  {
    name: "Squats",
    description:
      "Lower body strength exercise targeting quadriceps, glutes, and hamstrings",
    category: "strength",
    difficulty: "beginner",
    duration: 45,
    instructions: [
      {
        step: 1,
        text: "Stand with feet shoulder-width apart",
        imageUrl: "/images/squat-start.jpg",
      },
      {
        step: 2,
        text: "Lower your body by bending knees and hips",
        imageUrl: "/images/squat-down.jpg",
      },
      {
        step: 3,
        text: "Return to standing position",
        imageUrl: "/images/squat-up.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.4, y: 0.5, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.6, y: 0.5, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_KNEE,
          name: "left_knee",
          expectedPosition: { x: 0.4, y: 0.7, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_KNEE,
          name: "right_knee",
          expectedPosition: { x: 0.6, y: 0.7, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_ANKLE,
          name: "left_ankle",
          expectedPosition: { x: 0.4, y: 0.9, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_ANKLE,
          name: "right_ankle",
          expectedPosition: { x: 0.6, y: 0.9, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
      ],
      transitions: [
        {
          name: "squat_down",
          fromLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_HIP,
              position: { x: 0.4, y: 0.4, z: 0.0 },
            },
          ],
          toLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_HIP,
              position: { x: 0.4, y: 0.6, z: 0.0 },
            },
          ],
          duration: 2,
        },
      ],
      validationRules: {
        minConfidence: 0.6,
        requiredLandmarks: [
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
          LANDMARKS.LEFT_KNEE,
          LANDMARKS.RIGHT_KNEE,
        ],
        angleConstraints: [
          {
            name: "knee_angle",
            landmarks: [
              LANDMARKS.LEFT_HIP,
              LANDMARKS.LEFT_KNEE,
              LANDMARKS.LEFT_ANKLE,
            ],
            minAngle: 60,
            maxAngle: 180,
          },
        ],
        distanceConstraints: [
          {
            name: "hip_width",
            landmarks: [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
            minDistance: 0.15,
            maxDistance: 0.25,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 6,
      muscleGroups: ["legs", "glutes", "core"],
      equipment: ["none"],
      spaceRequired: "small",
    },
    scoring: {
      poseAccuracyWeight: 0.7,
      timingWeight: 0.2,
      consistencyWeight: 0.1,
      perfectScoreThreshold: 80,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    },
    tags: ["lower_body", "strength", "bodyweight", "legs"],
  },

  // Plank
  {
    name: "Plank",
    description:
      "Core strengthening exercise that targets the entire core and improves stability",
    category: "strength",
    difficulty: "intermediate",
    duration: 30,
    instructions: [
      {
        step: 1,
        text: "Start in push-up position",
        imageUrl: "/images/plank-start.jpg",
      },
      {
        step: 2,
        text: "Hold position with straight body alignment",
        imageUrl: "/images/plank-hold.jpg",
      },
      {
        step: 3,
        text: "Keep core tight and breathe steadily",
        imageUrl: "/images/plank-breathe.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_SHOULDER,
          name: "left_shoulder",
          expectedPosition: { x: 0.3, y: 0.2, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_SHOULDER,
          name: "right_shoulder",
          expectedPosition: { x: 0.7, y: 0.2, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.4, y: 0.5, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.6, y: 0.5, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_ANKLE,
          name: "left_ankle",
          expectedPosition: { x: 0.4, y: 0.8, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_ANKLE,
          name: "right_ankle",
          expectedPosition: { x: 0.6, y: 0.8, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
      ],
      transitions: [],
      validationRules: {
        minConfidence: 0.7,
        requiredLandmarks: [
          LANDMARKS.LEFT_SHOULDER,
          LANDMARKS.RIGHT_SHOULDER,
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
        ],
        angleConstraints: [],
        distanceConstraints: [
          {
            name: "body_alignment",
            landmarks: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
            minDistance: 0.25,
            maxDistance: 0.35,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 4,
      muscleGroups: ["core", "shoulders", "arms"],
      equipment: ["none"],
      spaceRequired: "small",
    },
    scoring: {
      poseAccuracyWeight: 0.9,
      timingWeight: 0.05,
      consistencyWeight: 0.05,
      perfectScoreThreshold: 90,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    },
    tags: ["core", "strength", "bodyweight", "stability"],
  },

  // Jumping Jacks
  {
    name: "Jumping Jacks",
    description:
      "Cardiovascular exercise that improves coordination and burns calories",
    category: "cardio",
    difficulty: "beginner",
    duration: 60,
    instructions: [
      {
        step: 1,
        text: "Start standing with feet together and arms at sides",
        imageUrl: "/images/jumping-jack-start.jpg",
      },
      {
        step: 2,
        text: "Jump up spreading feet shoulder-width apart and raising arms overhead",
        imageUrl: "/images/jumping-jack-up.jpg",
      },
      {
        step: 3,
        text: "Jump back to starting position",
        imageUrl: "/images/jumping-jack-down.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_SHOULDER,
          name: "left_shoulder",
          expectedPosition: { x: 0.2, y: 0.1, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_SHOULDER,
          name: "right_shoulder",
          expectedPosition: { x: 0.8, y: 0.1, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.3, y: 0.5, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.7, y: 0.5, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.LEFT_ANKLE,
          name: "left_ankle",
          expectedPosition: { x: 0.3, y: 0.8, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_ANKLE,
          name: "right_ankle",
          expectedPosition: { x: 0.7, y: 0.8, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
      ],
      transitions: [
        {
          name: "jump_spread",
          fromLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_HIP,
              position: { x: 0.5, y: 0.5, z: 0.0 },
            },
          ],
          toLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_HIP,
              position: { x: 0.3, y: 0.5, z: 0.0 },
            },
          ],
          duration: 0.5,
        },
      ],
      validationRules: {
        minConfidence: 0.5,
        requiredLandmarks: [
          LANDMARKS.LEFT_SHOULDER,
          LANDMARKS.RIGHT_SHOULDER,
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
        ],
        angleConstraints: [],
        distanceConstraints: [
          {
            name: "arm_spread",
            landmarks: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
            minDistance: 0.4,
            maxDistance: 0.8,
          },
          {
            name: "leg_spread",
            landmarks: [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
            minDistance: 0.2,
            maxDistance: 0.6,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 10,
      muscleGroups: ["legs", "arms", "core"],
      equipment: ["none"],
      spaceRequired: "medium",
    },
    scoring: {
      poseAccuracyWeight: 0.6,
      timingWeight: 0.3,
      consistencyWeight: 0.1,
      perfectScoreThreshold: 75,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.4,
    },
    tags: ["cardio", "coordination", "full_body", "warm_up"],
  },

  // Mountain Climbers
  {
    name: "Mountain Climbers",
    description:
      "High-intensity cardio exercise that targets core and improves agility",
    category: "cardio",
    difficulty: "intermediate",
    duration: 45,
    instructions: [
      {
        step: 1,
        text: "Start in plank position",
        imageUrl: "/images/mountain-climber-start.jpg",
      },
      {
        step: 2,
        text: "Bring right knee toward chest",
        imageUrl: "/images/mountain-climber-right.jpg",
      },
      {
        step: 3,
        text: "Quickly switch legs, bringing left knee toward chest",
        imageUrl: "/images/mountain-climber-left.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_SHOULDER,
          name: "left_shoulder",
          expectedPosition: { x: 0.3, y: 0.2, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_SHOULDER,
          name: "right_shoulder",
          expectedPosition: { x: 0.7, y: 0.2, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.4, y: 0.4, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.6, y: 0.4, z: 0.0 },
          tolerance: 0.15,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_KNEE,
          name: "left_knee",
          expectedPosition: { x: 0.4, y: 0.3, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_KNEE,
          name: "right_knee",
          expectedPosition: { x: 0.6, y: 0.3, z: 0.0 },
          tolerance: 0.2,
          importance: "important",
        },
      ],
      transitions: [
        {
          name: "knee_switch",
          fromLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_KNEE,
              position: { x: 0.4, y: 0.5, z: 0.0 },
            },
          ],
          toLandmarks: [
            {
              landmarkId: LANDMARKS.LEFT_KNEE,
              position: { x: 0.4, y: 0.3, z: 0.0 },
            },
          ],
          duration: 0.3,
        },
      ],
      validationRules: {
        minConfidence: 0.6,
        requiredLandmarks: [
          LANDMARKS.LEFT_SHOULDER,
          LANDMARKS.RIGHT_SHOULDER,
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
        ],
        angleConstraints: [],
        distanceConstraints: [
          {
            name: "knee_chest_distance",
            landmarks: [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_SHOULDER],
            minDistance: 0.1,
            maxDistance: 0.3,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 12,
      muscleGroups: ["core", "legs", "shoulders", "arms"],
      equipment: ["none"],
      spaceRequired: "medium",
    },
    scoring: {
      poseAccuracyWeight: 0.7,
      timingWeight: 0.2,
      consistencyWeight: 0.1,
      perfectScoreThreshold: 80,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    },
    tags: ["cardio", "core", "high_intensity", "agility"],
  },

  // Downward Dog (Yoga)
  {
    name: "Downward Dog",
    description: "Yoga pose that stretches the entire body and builds strength",
    category: "yoga",
    difficulty: "beginner",
    duration: 30,
    instructions: [
      {
        step: 1,
        text: "Start on hands and knees",
        imageUrl: "/images/downward-dog-start.jpg",
      },
      {
        step: 2,
        text: "Tuck toes and lift hips up and back",
        imageUrl: "/images/downward-dog-pose.jpg",
      },
      {
        step: 3,
        text: "Straighten legs and press heels toward floor",
        imageUrl: "/images/downward-dog-stretch.jpg",
      },
    ],
    poseLandmarks: {
      expectedLandmarks: [
        {
          landmarkId: LANDMARKS.LEFT_SHOULDER,
          name: "left_shoulder",
          expectedPosition: { x: 0.3, y: 0.3, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_SHOULDER,
          name: "right_shoulder",
          expectedPosition: { x: 0.7, y: 0.3, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_HIP,
          name: "left_hip",
          expectedPosition: { x: 0.4, y: 0.6, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.RIGHT_HIP,
          name: "right_hip",
          expectedPosition: { x: 0.6, y: 0.6, z: 0.0 },
          tolerance: 0.1,
          importance: "critical",
        },
        {
          landmarkId: LANDMARKS.LEFT_ANKLE,
          name: "left_ankle",
          expectedPosition: { x: 0.4, y: 0.9, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
        {
          landmarkId: LANDMARKS.RIGHT_ANKLE,
          name: "right_ankle",
          expectedPosition: { x: 0.6, y: 0.9, z: 0.0 },
          tolerance: 0.1,
          importance: "important",
        },
      ],
      transitions: [],
      validationRules: {
        minConfidence: 0.7,
        requiredLandmarks: [
          LANDMARKS.LEFT_SHOULDER,
          LANDMARKS.RIGHT_SHOULDER,
          LANDMARKS.LEFT_HIP,
          LANDMARKS.RIGHT_HIP,
        ],
        angleConstraints: [
          {
            name: "body_angle",
            landmarks: [
              LANDMARKS.LEFT_SHOULDER,
              LANDMARKS.LEFT_HIP,
              LANDMARKS.LEFT_ANKLE,
            ],
            minAngle: 150,
            maxAngle: 180,
          },
        ],
        distanceConstraints: [
          {
            name: "hip_height",
            landmarks: [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_SHOULDER],
            minDistance: 0.2,
            maxDistance: 0.4,
          },
        ],
      },
    },
    metrics: {
      caloriesPerMinute: 3,
      muscleGroups: ["core", "arms", "legs", "back"],
      equipment: ["yoga_mat"],
      spaceRequired: "small",
    },
    scoring: {
      poseAccuracyWeight: 0.8,
      timingWeight: 0.1,
      consistencyWeight: 0.1,
      perfectScoreThreshold: 85,
    },
    mediapipeConfig: {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    },
    tags: ["yoga", "flexibility", "strength", "stretch"],
  },
];

export const seedExercises = async () => {
  try {
    console.log("Starting exercise seeding...");

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log("Cleared existing exercises");

    // Insert new exercises
    const insertedExercises = await Exercise.insertMany(exercises);
    console.log(`Successfully seeded ${insertedExercises.length} exercises`);

    return insertedExercises;
  } catch (error) {
    console.error("Error seeding exercises:", error);
    throw error;
  }
};

export default exercises;
