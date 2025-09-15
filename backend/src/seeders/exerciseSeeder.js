import Exercise from '../models/Exercise.js';

export const seedExercises = async () => {
  try {
    console.log('🌱 Seeding exercises...');

    const exercises = [
      // Rep-based exercises
      {
        name: 'bicep_curl',
        displayName: 'Bicep Curl',
        description: 'Classic bicep strengthening exercise using arm curls',
        category: 'strength',
        type: 'rep',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand with feet shoulder-width apart' },
          { step: 2, text: 'Hold arms at your sides with palms facing forward' },
          { step: 3, text: 'Curl arms up towards shoulders' },
          { step: 4, text: 'Lower arms back to starting position' }
        ],
        repConfig: {
          joints: ['shoulder', 'elbow', 'wrist'],
          upAngle: 30,
          downAngle: 160
        },
        muscleGroups: ['arms'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['strength', 'arms', 'beginner']
      },
      {
        name: 'squat',
        displayName: 'Squat',
        description: 'Full-body exercise targeting legs and glutes',
        category: 'strength',
        type: 'rep',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand with feet shoulder-width apart' },
          { step: 2, text: 'Lower your body as if sitting back into a chair' },
          { step: 3, text: 'Keep your chest up and knees behind toes' },
          { step: 4, text: 'Return to standing position' }
        ],
        repConfig: {
          joints: ['hip', 'knee', 'ankle'],
          upAngle: 90,
          downAngle: 170
        },
        muscleGroups: ['legs', 'glutes'],
        equipment: ['none'],
        spaceRequired: 'medium',
        tags: ['strength', 'legs', 'glutes', 'beginner']
      },
      {
        name: 'pushup',
        displayName: 'Push-up',
        description: 'Upper body strength exercise targeting chest, shoulders, and arms',
        category: 'strength',
        type: 'rep',
        difficulty: 'intermediate',
        duration: 300,
        instructions: [
          { step: 1, text: 'Start in plank position with hands under shoulders' },
          { step: 2, text: 'Lower your body until chest nearly touches floor' },
          { step: 3, text: 'Push back up to starting position' },
          { step: 4, text: 'Keep body straight throughout movement' }
        ],
        repConfig: {
          joints: ['shoulder', 'elbow', 'wrist'],
          upAngle: 70,
          downAngle: 160
        },
        muscleGroups: ['chest', 'shoulders', 'arms', 'core'],
        equipment: ['none'],
        spaceRequired: 'medium',
        tags: ['strength', 'chest', 'arms', 'intermediate']
      },
      {
        name: 'lunge',
        displayName: 'Lunge',
        description: 'Single-leg exercise for leg strength and balance',
        category: 'strength',
        type: 'rep',
        difficulty: 'intermediate',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand with feet hip-width apart' },
          { step: 2, text: 'Step forward with one leg' },
          { step: 3, text: 'Lower your body until both knees are at 90 degrees' },
          { step: 4, text: 'Push back to starting position' }
        ],
        repConfig: {
          joints: ['hip', 'knee', 'ankle'],
          upAngle: 90,
          downAngle: 170
        },
        muscleGroups: ['legs', 'glutes'],
        equipment: ['none'],
        spaceRequired: 'medium',
        tags: ['strength', 'legs', 'balance', 'intermediate']
      },

      // Hold-based exercises (Yoga poses)
      {
        name: 'tree_pose',
        displayName: 'Tree Pose',
        description: 'Balancing yoga pose for stability and focus',
        category: 'yoga',
        type: 'hold',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand on one leg' },
          { step: 2, text: 'Place the sole of other foot on inner thigh' },
          { step: 3, text: 'Bring hands to prayer position at chest' },
          { step: 4, text: 'Hold position and breathe deeply' }
        ],
        holdConfig: {
          joints: ['hip', 'knee', 'ankle'],
          targetAngle: 180,
          tolerance: 20
        },
        muscleGroups: ['legs', 'core'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['yoga', 'balance', 'meditation', 'beginner']
      },
      {
        name: 'warrior_ii',
        displayName: 'Warrior II',
        description: 'Strong standing yoga pose for strength and endurance',
        category: 'yoga',
        type: 'hold',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand with feet wide apart' },
          { step: 2, text: 'Turn one foot out 90 degrees' },
          { step: 3, text: 'Bend front knee over ankle' },
          { step: 4, text: 'Extend arms parallel to floor' }
        ],
        holdConfig: {
          joints: ['hip', 'knee', 'ankle'],
          targetAngle: 100,
          tolerance: 20
        },
        muscleGroups: ['legs', 'glutes', 'shoulders'],
        equipment: ['none'],
        spaceRequired: 'medium',
        tags: ['yoga', 'strength', 'endurance', 'beginner']
      },
      {
        name: 'plank',
        displayName: 'Plank',
        description: 'Core strengthening exercise for stability',
        category: 'strength',
        type: 'hold',
        difficulty: 'intermediate',
        duration: 300,
        instructions: [
          { step: 1, text: 'Start in push-up position' },
          { step: 2, text: 'Lower to forearms' },
          { step: 3, text: 'Keep body straight from head to heels' },
          { step: 4, text: 'Hold position and breathe normally' }
        ],
        holdConfig: {
          joints: ['shoulder', 'hip', 'ankle'],
          targetAngle: 180,
          tolerance: 15
        },
        muscleGroups: ['core', 'shoulders', 'arms'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['strength', 'core', 'stability', 'intermediate']
      },
      {
        name: 'chair_pose',
        displayName: 'Chair Pose',
        description: 'Yoga pose for leg strength and endurance',
        category: 'yoga',
        type: 'hold',
        difficulty: 'intermediate',
        duration: 300,
        instructions: [
          { step: 1, text: 'Stand with feet together' },
          { step: 2, text: 'Bend knees as if sitting in a chair' },
          { step: 3, text: 'Raise arms overhead' },
          { step: 4, text: 'Hold position and breathe deeply' }
        ],
        holdConfig: {
          joints: ['hip', 'knee', 'ankle'],
          targetAngle: 100,
          tolerance: 15
        },
        muscleGroups: ['legs', 'glutes', 'shoulders'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['yoga', 'strength', 'endurance', 'intermediate']
      },
      {
        name: 'cobra_pose',
        displayName: 'Cobra Pose',
        description: 'Back-bending yoga pose for flexibility and strength',
        category: 'yoga',
        type: 'hold',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Lie face down on the floor' },
          { step: 2, text: 'Place hands under shoulders' },
          { step: 3, text: 'Press up lifting chest off floor' },
          { step: 4, text: 'Keep hips on floor and breathe deeply' }
        ],
        holdConfig: {
          joints: ['hip', 'shoulder', 'ear'],
          targetAngle: 200,
          tolerance: 30
        },
        muscleGroups: ['back', 'core'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['yoga', 'flexibility', 'back', 'beginner']
      },

      // Meditation and breathing exercises
      {
        name: 'meditation',
        displayName: 'Meditation',
        description: 'Mindfulness meditation for relaxation and focus',
        category: 'meditation',
        type: 'meditation',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Find a comfortable seated position' },
          { step: 2, text: 'Close your eyes and relax your body' },
          { step: 3, text: 'Focus on your breath' },
          { step: 4, text: 'Let thoughts come and go without judgment' }
        ],
        meditationConfig: {
          pattern: 'natural',
          backgroundMusic: 'nature_sounds',
          environment: 'peaceful'
        },
        muscleGroups: ['full_body'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['meditation', 'mindfulness', 'relaxation', 'beginner']
      },
      {
        name: 'breathing',
        displayName: 'Breathing Exercise',
        description: 'Controlled breathing exercise for stress relief',
        category: 'breathing',
        type: 'breathing',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Sit comfortably with spine straight' },
          { step: 2, text: 'Inhale slowly for 4 counts' },
          { step: 3, text: 'Hold breath for 4 counts' },
          { step: 4, text: 'Exhale slowly for 4 counts' }
        ],
        meditationConfig: {
          pattern: '4-4-4',
          backgroundMusic: 'calm_music',
          environment: 'quiet'
        },
        muscleGroups: ['full_body'],
        equipment: ['none'],
        spaceRequired: 'small',
        tags: ['breathing', 'stress_relief', 'relaxation', 'beginner']
      },
      {
        name: 'stretching',
        displayName: 'Stretching',
        description: 'Gentle stretching routine for flexibility and relaxation',
        category: 'stretching',
        type: 'stretch',
        difficulty: 'beginner',
        duration: 300,
        instructions: [
          { step: 1, text: 'Start with gentle neck rolls' },
          { step: 2, text: 'Move to shoulder stretches' },
          { step: 3, text: 'Include back and spine stretches' },
          { step: 4, text: 'Finish with leg and hip stretches' }
        ],
        muscleGroups: ['full_body'],
        equipment: ['none'],
        spaceRequired: 'medium',
        tags: ['stretching', 'flexibility', 'relaxation', 'beginner']
      }
    ];

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('🗑️  Cleared existing exercises');

    // Insert new exercises
    const insertedExercises = await Exercise.insertMany(exercises);
    console.log(`✅ Seeded ${insertedExercises.length} exercises`);

    return insertedExercises;
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  }
};
