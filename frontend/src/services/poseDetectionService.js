// Frontend Pose Detection Service using MediaPipe
class PoseDetectionService {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.pose = null;
    this.isDetecting = false;
    this.callbacks = {
      onPoseDetected: null,
      onBreathingDetected: null,
    };
    this.breathingHistory = [];
    this.chestYHistory = [];
  }

  /**
   * Initialize pose detection with camera
   */
  async initialize(videoElement, canvasElement, callbacks) {
    try {
      this.video = videoElement;
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext("2d");
      this.callbacks = callbacks;

      // Import MediaPipe Tasks Vision dynamically
      const { PoseLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      // Initialize MediaPipe Pose Landmarker
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      this.pose = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Start camera stream
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        this.video.srcObject = stream;
        this.video.play();

        // Start pose detection loop
        this.startDetectionLoop();
      } else {
        throw new Error("Camera access not supported");
      }
      this.isDetecting = true;

      return { success: true, message: "Pose detection initialized" };
    } catch (error) {
      console.error("Error initializing pose detection:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start the pose detection loop
   */
  startDetectionLoop() {
    const detectPose = async () => {
      if (
        !this.isDetecting ||
        !this.video.videoWidth ||
        !this.video.videoHeight
      ) {
        requestAnimationFrame(detectPose);
        return;
      }

      try {
        const results = this.pose.detectForVideo(this.video, performance.now());
        this.onResults(results);
      } catch (error) {
        console.error("Error during pose detection:", error);
      }

      requestAnimationFrame(detectPose);
    };

    detectPose();
  }

  /**
   * Handle pose detection results
   */
  onResults(results) {
    if (!this.isDetecting) return;

    // Draw pose landmarks on canvas
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0]; // Get first pose
      this.drawPoseLandmarks(landmarks);

      // Extract key points
      const keyPoints = this.extractKeyPoints(landmarks);

      // Detect breathing pattern
      const breathingData = this.detectBreathingPattern(landmarks);

      // Call callbacks
      if (this.callbacks.onPoseDetected) {
        this.callbacks.onPoseDetected({
          keyPoints,
          timestamp: new Date(),
        });
      }

      if (breathingData && this.callbacks.onBreathingDetected) {
        this.callbacks.onBreathingDetected({
          breathingData,
          timestamp: new Date(),
        });
      }
    }

    this.ctx.restore();
  }

  /**
   * Draw pose landmarks on canvas
   */
  drawPoseLandmarks(landmarks) {
    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [15, 17],
      [15, 19],
      [15, 21],
      [12, 14],
      [14, 16],
      [16, 18],
      [16, 20],
      [16, 22],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [24, 26],
      [25, 27],
      [26, 28],
      [27, 29],
      [28, 30],
      [29, 31],
      [30, 32],
    ];

    // Draw connections
    this.ctx.strokeStyle = "#00FF00";
    this.ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      if (
        startPoint &&
        endPoint &&
        startPoint.visibility > 0.5 &&
        endPoint.visibility > 0.5
      ) {
        this.ctx.beginPath();
        this.ctx.moveTo(
          startPoint.x * this.canvas.width,
          startPoint.y * this.canvas.height
        );
        this.ctx.lineTo(
          endPoint.x * this.canvas.width,
          endPoint.y * this.canvas.height
        );
        this.ctx.stroke();
      }
    });

    // Draw landmarks
    this.ctx.fillStyle = "#FF0000";
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        this.ctx.beginPath();
        this.ctx.arc(
          landmark.x * this.canvas.width,
          landmark.y * this.canvas.height,
          3,
          0,
          2 * Math.PI
        );
        this.ctx.fill();
      }
    });
  }

  /**
   * Extract key points from pose landmarks
   */
  extractKeyPoints(landmarks) {
    const keyPointNames = {
      0: "nose",
      11: "left_shoulder",
      12: "right_shoulder",
      13: "left_elbow",
      14: "right_elbow",
      15: "left_wrist",
      16: "right_wrist",
      23: "left_hip",
      24: "right_hip",
      25: "left_knee",
      26: "right_knee",
      27: "left_ankle",
      28: "right_ankle",
    };

    return landmarks
      .map((landmark, index) => {
        if (keyPointNames[index] && landmark.visibility > 0.5) {
          return {
            name: keyPointNames[index],
            x: landmark.x,
            y: landmark.y,
            confidence: landmark.visibility,
          };
        }
        return null;
      })
      .filter((point) => point !== null);
  }

  /**
   * Detect breathing pattern from chest movement
   */
  detectBreathingPattern(landmarks) {
    if (!landmarks[11] || !landmarks[12] || !landmarks[23] || !landmarks[24]) {
      return null;
    }

    // Calculate chest center Y position
    const chestY =
      (landmarks[11].y + landmarks[12].y + landmarks[23].y + landmarks[24].y) /
      4;
    this.chestYHistory.push(chestY);

    // Keep only last 30 frames
    if (this.chestYHistory.length > 30) {
      this.chestYHistory.shift();
    }

    if (this.chestYHistory.length < 10) {
      return null;
    }

    // Calculate breathing variance
    const recentY = this.chestYHistory.slice(-10);
    const mean = recentY.reduce((sum, y) => sum + y, 0) / recentY.length;
    const variance =
      recentY.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) /
      recentY.length;

    // Detect breathing if variance is significant
    if (variance > 0.0001) {
      const breathingData = {
        phase: this.detectBreathingPhase(),
        phase_duration: this.getPhaseDuration(),
        inhale_duration: 4.0,
        exhale_duration: 4.0,
        hold_duration: 4.0,
        confidence: Math.min(1.0, variance * 1000),
      };

      return breathingData;
    }

    return null;
  }

  /**
   * Detect current breathing phase
   */
  detectBreathingPhase() {
    if (this.chestYHistory.length < 5) return "inhale";

    const recent = this.chestYHistory.slice(-5);
    const trend = recent[recent.length - 1] - recent[0];

    if (trend > 0.001) return "exhale";
    if (trend < -0.001) return "inhale";
    return "hold";
  }

  /**
   * Get current phase duration
   */
  getPhaseDuration() {
    // Simple implementation - in real app, track phase changes
    return Math.random() * 4;
  }

  /**
   * Stop pose detection
   */
  stop() {
    this.isDetecting = false;
    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  /**
   * Get detection status
   */
  getStatus() {
    return {
      isDetecting: this.isDetecting,
      hasVideo: !!this.video,
      hasCanvas: !!this.canvas,
    };
  }
}

export default PoseDetectionService;
