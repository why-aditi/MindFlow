import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

class PoseTrackingService {
  constructor() {
    this.pose = null;
    this.camera = null;
    this.isTracking = false;
    this.onResults = null;
    this.onError = null;
    
    // Exercise tracking variables
    this.repCount = 0;
    this.holdTime = 0;
    this.meditationCycle = 0;
    this.lastPoseTime = 0;
    this.exerciseType = null;
    this.exerciseConfig = null;
    
    // Pose tracking variables
    this.isUp = false;
    this.isDown = false;
    this.lastHoldCheck = 0;
    this.breathingCycle = 0;
    this.lastBreathTime = 0;
  }

  async initialize() {
    try {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => {
        if (this.isTracking && this.onResults) {
          this.processPoseResults(results);
        }
      });

      return true;
    } catch (error) {
      console.error('Error initializing pose tracking:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  startTracking(videoElement, exerciseType, onResults, onError) {
    if (!this.pose) {
      console.error('Pose tracking not initialized');
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

    try {
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.isTracking) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      this.camera.start();
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      this.isTracking = false;
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  stopTracking() {
    this.isTracking = false;
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
  }

  getExerciseConfig(exerciseType) {
    const configs = {
      bicep_curl: {
        type: 'rep',
        joints: ['shoulder', 'elbow', 'wrist'],
        upAngle: 30,
        downAngle: 160,
        keyPoints: [11, 13, 15] // MediaPipe pose landmarks
      },
      squat: {
        type: 'rep',
        joints: ['hip', 'knee', 'ankle'],
        upAngle: 90,
        downAngle: 170,
        keyPoints: [23, 25, 27] // MediaPipe pose landmarks
      },
      pushup: {
        type: 'rep',
        joints: ['shoulder', 'elbow', 'wrist'],
        upAngle: 70,
        downAngle: 160,
        keyPoints: [11, 13, 15] // MediaPipe pose landmarks
      },
      lunge: {
        type: 'rep',
        joints: ['hip', 'knee', 'ankle'],
        upAngle: 90,
        downAngle: 170,
        keyPoints: [23, 25, 27] // MediaPipe pose landmarks
      },
      tree_pose: {
        type: 'hold',
        joints: ['hip', 'knee', 'ankle'],
        targetAngle: 180,
        tolerance: 20,
        keyPoints: [23, 25, 27]
      },
      warrior_ii: {
        type: 'hold',
        joints: ['hip', 'knee', 'ankle'],
        targetAngle: 90,
        tolerance: 15,
        keyPoints: [23, 25, 27]
      },
      plank: {
        type: 'hold',
        joints: ['shoulder', 'hip', 'ankle'],
        targetAngle: 180,
        tolerance: 10,
        keyPoints: [11, 23, 27]
      },
      chair_pose: {
        type: 'hold',
        joints: ['hip', 'knee', 'ankle'],
        targetAngle: 90,
        tolerance: 15,
        keyPoints: [23, 25, 27]
      },
      cobra_pose: {
        type: 'hold',
        joints: ['shoulder', 'elbow', 'wrist'],
        targetAngle: 160,
        tolerance: 20,
        keyPoints: [11, 13, 15]
      },
      meditation: {
        type: 'meditation',
        pattern: '4-4-4',
        keyPoints: [0, 1, 2] // Head landmarks for stillness detection
      },
      breathing: {
        type: 'breathing',
        pattern: '4-4-4',
        keyPoints: [11, 12, 23, 24] // Shoulder and hip landmarks for breathing detection
      },
      stretching: {
        type: 'stretch',
        joints: ['shoulder', 'elbow', 'wrist'],
        targetAngle: 180,
        tolerance: 15,
        keyPoints: [11, 13, 15]
      }
    };

    return configs[exerciseType] || configs.bicep_curl;
  }

  processPoseResults(results) {
    if (!results.poseLandmarks || !this.exerciseConfig) return;

    const landmarks = results.poseLandmarks;
    const currentTime = Date.now();

    // Process based on exercise type
    switch (this.exerciseConfig.type) {
      case 'rep':
        this.processRepExercise(landmarks, currentTime);
        break;
      case 'hold':
        this.processHoldExercise(landmarks, currentTime);
        break;
      case 'meditation':
        this.processMeditation(landmarks, currentTime);
        break;
      case 'breathing':
        this.processBreathing(landmarks, currentTime);
        break;
      case 'stretch':
        this.processStretchExercise(landmarks, currentTime);
        break;
    }

    // Send results to callback
    if (this.onResults) {
      this.onResults({
        landmarks: results.poseLandmarks,
        worldLandmarks: results.poseWorldLandmarks,
        repCount: this.repCount,
        holdTime: this.holdTime,
        meditationCycle: this.meditationCycle,
        breathingCycle: this.breathingCycle,
        exerciseType: this.exerciseType,
        accuracy: this.calculateAccuracy(landmarks),
        qualityScore: this.calculateQualityScore(landmarks)
      });
    }
  }

  processRepExercise(landmarks, currentTime) {
    const keyPoints = this.exerciseConfig.keyPoints;
    if (keyPoints.length < 3) return;

    const point1 = landmarks[keyPoints[0]];
    const point2 = landmarks[keyPoints[1]];
    const point3 = landmarks[keyPoints[2]];

    if (!point1 || !point2 || !point3) return;

    const angle = this.calculateAngle(point1, point2, point3);

    // Check for rep completion
    if (angle < this.exerciseConfig.upAngle && !this.isUp) {
      this.isUp = true;
      this.isDown = false;
    } else if (angle > this.exerciseConfig.downAngle && this.isUp && !this.isDown) {
      this.isDown = true;
      this.repCount++;
      this.isUp = false;
    }
  }

  processHoldExercise(landmarks, currentTime) {
    const keyPoints = this.exerciseConfig.keyPoints;
    if (keyPoints.length < 3) return;

    const point1 = landmarks[keyPoints[0]];
    const point2 = landmarks[keyPoints[1]];
    const point3 = landmarks[keyPoints[2]];

    if (!point1 || !point2 || !point3) return;

    const angle = this.calculateAngle(point1, point2, point3);
    const targetAngle = this.exerciseConfig.targetAngle;
    const tolerance = this.exerciseConfig.tolerance;

    // Check if holding the pose
    if (Math.abs(angle - targetAngle) <= tolerance) {
      this.holdTime += (currentTime - this.lastHoldCheck) / 1000;
    }

    this.lastHoldCheck = currentTime;
  }

  processMeditation(landmarks, currentTime) {
    // Simple meditation cycle based on time
    const cycleDuration = 12000; // 12 seconds per cycle (4-4-4 breathing)
    this.meditationCycle = Math.floor((currentTime - this.lastPoseTime) / cycleDuration);
  }

  processBreathing(landmarks, currentTime) {
    // Simple breathing cycle based on time
    const cycleDuration = 12000; // 12 seconds per cycle (4-4-4 breathing)
    this.breathingCycle = Math.floor((currentTime - this.lastBreathTime) / cycleDuration);
  }

  processStretchExercise(landmarks, currentTime) {
    // Similar to hold exercise but with different feedback
    this.processHoldExercise(landmarks, currentTime);
  }

  calculateAngle(point1, point2, point3) {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  calculateAccuracy(landmarks) {
    // Simple accuracy calculation based on landmark visibility
    let visibleLandmarks = 0;
    let totalLandmarks = landmarks.length;

    landmarks.forEach(landmark => {
      if (landmark.visibility > 0.5) {
        visibleLandmarks++;
      }
    });

    return Math.round((visibleLandmarks / totalLandmarks) * 100);
  }

  calculateQualityScore(landmarks) {
    // Simple quality score based on pose stability
    // This is a placeholder - in a real implementation, you'd analyze pose quality
    return Math.min(100, Math.max(0, this.calculateAccuracy(landmarks) + 20));
  }
}

export default new PoseTrackingService();
