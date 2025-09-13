import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

class PoseDetectionService {
  constructor() {
    this.poseLandmarker = null;
    this.isInitialized = false;
    this.isDetecting = false;
    this.onPoseDetected = null;
    this.onError = null;
  }

  async initialize() {
    try {
      console.log("Initializing MediaPipe Pose Detection...");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      console.log("MediaPipe Pose Detection initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize MediaPipe Pose Detection:", error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  async detectPose(videoElement) {
    if (!this.isInitialized || !this.poseLandmarker) {
      console.warn("Pose detection not initialized");
      return null;
    }

    try {
      const results = this.poseLandmarker.detectForVideo(
        videoElement,
        performance.now()
      );

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const worldLandmarks = results.worldLandmarks
          ? results.worldLandmarks[0]
          : null;

        // Convert landmarks to normalized coordinates
        const normalizedLandmarks = landmarks.map((landmark) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility || 0,
        }));

        const poseData = {
          landmarks: normalizedLandmarks,
          worldLandmarks: worldLandmarks,
          timestamp: performance.now(),
          confidence: this.calculateOverallConfidence(normalizedLandmarks),
        };

        if (this.onPoseDetected) {
          this.onPoseDetected(poseData);
        }

        return poseData;
      }

      return null;
    } catch (error) {
      console.error("Error detecting pose:", error);
      if (this.onError) {
        this.onError(error);
      }
      return null;
    }
  }

  calculateOverallConfidence(landmarks) {
    if (!landmarks || landmarks.length === 0) return 0;

    const totalConfidence = landmarks.reduce((sum, landmark) => {
      return sum + (landmark.visibility || 0);
    }, 0);

    return totalConfidence / landmarks.length;
  }

  // Calculate angle between three points
  calculateAngle(point1, point2, point3) {
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };

    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y,
    };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    return (angle * 180) / Math.PI;
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Analyze pose against expected exercise landmarks
  analyzeExercisePose(detectedLandmarks, expectedLandmarks) {
    if (!detectedLandmarks || !expectedLandmarks) {
      return { accuracy: 0, feedback: "No pose data available" };
    }

    let totalAccuracy = 0;
    let validLandmarks = 0;
    const feedback = [];

    expectedLandmarks.forEach((expected) => {
      const detected = detectedLandmarks[expected.landmarkId];
      if (detected && detected.visibility > 0.5) {
        const distance = this.calculateDistance(
          { x: detected.x, y: detected.y },
          { x: expected.expectedPosition.x, y: expected.expectedPosition.y }
        );

        const accuracy = Math.max(0, 1 - distance / expected.tolerance);
        totalAccuracy += accuracy;
        validLandmarks++;

        if (accuracy < 0.7) {
          feedback.push(`${expected.name} position needs adjustment`);
        }
      }
    });

    const overallAccuracy =
      validLandmarks > 0 ? (totalAccuracy / validLandmarks) * 100 : 0;

    return {
      accuracy: Math.round(overallAccuracy),
      feedback: feedback.length > 0 ? feedback.join(", ") : "Great form!",
      validLandmarks,
      totalExpectedLandmarks: expectedLandmarks.length,
    };
  }

  // Draw pose landmarks on canvas
  drawPoseLandmarks(canvas, landmarks, exerciseLandmarks = null) {
    if (!landmarks || landmarks.length === 0) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections between landmarks
    const connections = [
      // Face
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 7],
      [0, 4],
      [4, 5],
      [5, 6],
      [6, 8],
      // Torso
      [11, 12],
      [11, 23],
      [12, 24],
      [23, 24],
      // Left arm
      [11, 13],
      [13, 15],
      [15, 17],
      [15, 19],
      [15, 21],
      [17, 19],
      [19, 21],
      // Right arm
      [12, 14],
      [14, 16],
      [16, 18],
      [16, 20],
      [16, 22],
      [18, 20],
      [20, 22],
      // Left leg
      [23, 25],
      [25, 27],
      [27, 29],
      [27, 31],
      [29, 31],
      // Right leg
      [24, 26],
      [26, 28],
      [28, 30],
      [28, 32],
      [30, 32],
    ];

    // Draw connections
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (
        startPoint &&
        endPoint &&
        startPoint.visibility > 0.5 &&
        endPoint.visibility > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * width;
        const y = landmark.y * height;

        // Check if this landmark is important for current exercise
        let isImportant = false;
        if (exerciseLandmarks) {
          isImportant = exerciseLandmarks.some((ex) => ex.landmarkId === index);
        }

        ctx.beginPath();
        ctx.arc(x, y, isImportant ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isImportant ? "#FF0000" : "#00FF00";
        ctx.fill();

        // Draw landmark number for important landmarks
        if (isImportant) {
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(index.toString(), x, y - 8);
        }
      }
    });
  }

  setOnPoseDetected(callback) {
    this.onPoseDetected = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  cleanup() {
    this.isInitialized = false;
    this.poseLandmarker = null;
    this.onPoseDetected = null;
    this.onError = null;
  }
}

export default PoseDetectionService;
