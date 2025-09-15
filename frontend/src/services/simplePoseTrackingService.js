class SimplePoseTrackingService {
  constructor() {
    this.isTracking = false;
    this.onResults = null;
    this.onError = null;
    
    // Exercise tracking variables
    this.repCount = 0;
    this.holdTime = 0;
    this.meditationCycle = 0;
    this.breathingCycle = 0;
    this.lastPoseTime = Date.now();
    this.exerciseType = null;
    this.exerciseConfig = null;
    
    // Pose tracking variables
    this.isUp = false;
    this.isDown = false;
    this.lastHoldCheck = Date.now();
    this.lastBreathTime = Date.now();
    
    // Animation frame ID for tracking
    this.animationFrameId = null;
  }

  async initialize() {
    try {
      console.log('Simple pose tracking initialized');
      return true;
    } catch (error) {
      console.error('Error initializing simple pose tracking:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  startTracking(videoElement, exerciseType, onResults, onError) {
    if (!videoElement) {
      console.error('Video element not provided');
      return false;
    }

    this.isTracking = true;
    this.onResults = onResults;
    this.onError = onError;
    this.exerciseType = exerciseType;
    this.exerciseConfig = this.getExerciseConfig(exerciseType);
    
    // Reset tracking variables
    this.repCount = 0;
    this.holdTime = 0;
    this.meditationCycle = 0;
    this.breathingCycle = 0;
    this.isUp = false;
    this.isDown = false;
    this.lastPoseTime = Date.now();
    this.lastHoldCheck = Date.now();
    this.lastBreathTime = Date.now();

    console.log(`Starting simple pose tracking for: ${exerciseType}`);

    // Start the tracking loop
    this.startTrackingLoop();

    return true;
  }

  stopTracking() {
    this.isTracking = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('Simple pose tracking stopped');
  }

  startTrackingLoop() {
    if (!this.isTracking) return;

    const currentTime = Date.now();
    this.updateExerciseTracking(currentTime);

    // Send results to callback
    if (this.onResults) {
      this.onResults({
        repCount: this.repCount,
        holdTime: this.holdTime,
        meditationCycle: this.meditationCycle,
        breathingCycle: this.breathingCycle,
        exerciseType: this.exerciseType,
        accuracy: this.calculateAccuracy(),
        qualityScore: this.calculateQualityScore()
      });
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(() => this.startTrackingLoop());
  }

  updateExerciseTracking(currentTime) {
    if (!this.exerciseConfig) return;

    switch (this.exerciseConfig.type) {
      case 'rep':
        this.updateRepExercise(currentTime);
        break;
      case 'hold':
        this.updateHoldExercise(currentTime);
        break;
      case 'meditation':
        this.updateMeditation(currentTime);
        break;
      case 'breathing':
        this.updateBreathing(currentTime);
        break;
      case 'stretch':
        this.updateStretchExercise(currentTime);
        break;
    }
  }

  updateRepExercise(currentTime) {
    // Simulate rep counting based on time and exercise type
    const repInterval = this.getRepInterval();
    const timeSinceStart = currentTime - this.lastPoseTime;
    const expectedReps = Math.floor(timeSinceStart / repInterval);
    
    if (expectedReps > this.repCount) {
      this.repCount = expectedReps;
    }
  }

  updateHoldExercise(currentTime) {
    // Simulate hold time tracking
    const timeSinceLastCheck = (currentTime - this.lastHoldCheck) / 1000;
    this.holdTime += timeSinceLastCheck;
    this.lastHoldCheck = currentTime;
  }

  updateMeditation(currentTime) {
    // Simple meditation cycle based on time
    const cycleDuration = 12000; // 12 seconds per cycle (4-4-4 breathing)
    this.meditationCycle = Math.floor((currentTime - this.lastPoseTime) / cycleDuration);
  }

  updateBreathing(currentTime) {
    // Simple breathing cycle based on time
    const cycleDuration = 12000; // 12 seconds per cycle (4-4-4 breathing)
    this.breathingCycle = Math.floor((currentTime - this.lastBreathTime) / cycleDuration);
  }

  updateStretchExercise(currentTime) {
    // Similar to hold exercise but with different feedback
    this.updateHoldExercise(currentTime);
  }

  getRepInterval() {
    // Different rep intervals for different exercises
    const intervals = {
      bicep_curl: 3000,    // 3 seconds per rep
      squat: 4000,         // 4 seconds per rep
      pushup: 3500,        // 3.5 seconds per rep
      lunge: 4500,         // 4.5 seconds per rep
    };
    
    return intervals[this.exerciseType] || 3000;
  }

  getExerciseConfig(exerciseType) {
    const configs = {
      bicep_curl: { type: 'rep', joints: ['shoulder', 'elbow', 'wrist'] },
      squat: { type: 'rep', joints: ['hip', 'knee', 'ankle'] },
      pushup: { type: 'rep', joints: ['shoulder', 'elbow', 'wrist'] },
      lunge: { type: 'rep', joints: ['hip', 'knee', 'ankle'] },
      tree_pose: { type: 'hold', joints: ['hip', 'knee', 'ankle'] },
      warrior_ii: { type: 'hold', joints: ['hip', 'knee', 'ankle'] },
      plank: { type: 'hold', joints: ['shoulder', 'hip', 'ankle'] },
      chair_pose: { type: 'hold', joints: ['hip', 'knee', 'ankle'] },
      cobra_pose: { type: 'hold', joints: ['shoulder', 'elbow', 'wrist'] },
      meditation: { type: 'meditation', pattern: '4-4-4' },
      breathing: { type: 'breathing', pattern: '4-4-4' },
      stretching: { type: 'stretch', joints: ['shoulder', 'elbow', 'wrist'] }
    };

    return configs[exerciseType] || configs.bicep_curl;
  }

  calculateAccuracy() {
    // Simulate accuracy based on exercise type and time
    const baseAccuracy = 85;
    const timeBonus = Math.min(10, Math.floor((Date.now() - this.lastPoseTime) / 10000));
    return Math.min(100, baseAccuracy + timeBonus);
  }

  calculateQualityScore() {
    // Simulate quality score based on accuracy and consistency
    const accuracy = this.calculateAccuracy();
    const consistencyBonus = Math.min(15, this.repCount * 2);
    return Math.min(100, accuracy + consistencyBonus);
  }
}

export default new SimplePoseTrackingService();
