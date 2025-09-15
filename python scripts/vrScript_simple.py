import cv2
import numpy as np
import time
import json
import sys
import os

# ---------- Utility function ----------
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

# ---------- Exercise & Pose Definitions ----------
exercises = {
    "bicep_curl": {"type": "rep", "joints": ["shoulder", "elbow", "wrist"], "up_angle": 30, "down_angle": 160},
    "squat": {"type": "rep", "joints": ["hip", "knee", "ankle"], "up_angle": 90, "down_angle": 170},
    "pushup": {"type": "rep", "joints": ["shoulder", "elbow", "wrist"], "up_angle": 70, "down_angle": 160},
    "lunge": {"type": "rep", "joints": ["hip", "knee", "ankle"], "up_angle": 90, "down_angle": 170},
    "tree_pose": {"type": "hold", "joints": ["hip", "knee", "ankle"], "target_angle": 180, "tolerance": 20},
    "warrior_ii": {"type": "hold", "joints": ["hip", "knee", "ankle"], "target_angle": 90, "tolerance": 15},
    "plank": {"type": "hold", "joints": ["shoulder", "hip", "ankle"], "target_angle": 180, "tolerance": 10},
    "chair_pose": {"type": "hold", "joints": ["hip", "knee", "ankle"], "target_angle": 90, "tolerance": 15},
    "cobra_pose": {"type": "hold", "joints": ["shoulder", "elbow", "wrist"], "target_angle": 160, "tolerance": 20},
    "meditation": {"type": "meditation", "pattern": "4-4-4"},
    "breathing": {"type": "breathing", "pattern": "4-4-4"},
    "stretching": {"type": "stretch", "joints": ["shoulder", "elbow", "wrist"], "target_angle": 180, "tolerance": 15}
}

# ---------- Exercise Tracking Class ----------
class ExerciseTracker:
    def __init__(self, exercise_type, duration=300):
        self.exercise_type = exercise_type
        self.duration = duration
        self.start_time = time.time()
        self.reps = 0
        self.current_rep = 0
        self.is_up = False
        self.is_down = False
        self.hold_time = 0
        self.last_hold_check = time.time()
        self.meditation_cycle = 0
        self.breathing_cycle = 0
        self.last_breath_time = time.time()
        
        if exercise_type in exercises:
            self.config = exercises[exercise_type]
        else:
            self.config = {"type": "rep", "joints": ["shoulder", "elbow", "wrist"], "up_angle": 30, "down_angle": 160}
    
    def update(self, landmarks=None):
        current_time = time.time()
        elapsed = current_time - self.start_time
        remaining = max(0, self.duration - elapsed)
        
        # For demo purposes, simulate exercise tracking
        if self.config["type"] == "rep":
            # Simulate rep counting
            if int(elapsed) % 3 == 0 and int(elapsed) != getattr(self, 'last_rep_time', -1):
                self.reps += 1
                self.last_rep_time = int(elapsed)
        elif self.config["type"] == "hold":
            # Simulate hold tracking
            self.hold_time = min(elapsed, self.duration)
        elif self.config["type"] == "meditation":
            # Simulate meditation cycles
            self.meditation_cycle = int(elapsed / 12)  # 12 seconds per cycle
        elif self.config["type"] == "breathing":
            # Simulate breathing cycles
            self.breathing_cycle = int(elapsed / 12)  # 12 seconds per cycle
        
        return {
            "elapsed_time": elapsed,
            "remaining_time": remaining,
            "reps": self.reps,
            "hold_time": self.hold_time,
            "meditation_cycle": self.meditation_cycle,
            "breathing_cycle": self.breathing_cycle,
            "is_complete": remaining <= 0
        }

# ---------- Main VR Exercise Function ----------
def run_vr_exercise(exercise_type="bicep_curl", duration=300):
    print(f"Starting VR exercise: {exercise_type} for {duration} seconds")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return {"success": False, "error": "Camera not available"}
    
    # Set camera properties
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Initialize exercise tracker
    tracker = ExerciseTracker(exercise_type, duration)
    
    print("Camera opened successfully. Press 'q' to quit.")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame")
                break
            
            # Update exercise tracking
            stats = tracker.update()
            
            # Draw exercise info on frame
            cv2.putText(frame, f"Exercise: {exercise_type}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Time: {int(stats['elapsed_time'])}s / {duration}s", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            if tracker.config["type"] == "rep":
                cv2.putText(frame, f"Reps: {stats['reps']}", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            elif tracker.config["type"] == "hold":
                cv2.putText(frame, f"Hold Time: {int(stats['hold_time'])}s", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            elif tracker.config["type"] == "meditation":
                cv2.putText(frame, f"Cycle: {stats['meditation_cycle']}", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            elif tracker.config["type"] == "breathing":
                cv2.putText(frame, f"Breath Cycle: {stats['breathing_cycle']}", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('VR Exercise Tracking', frame)
            
            # Check for completion
            if stats['is_complete']:
                print(f"Exercise completed! Final stats: {stats}")
                break
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("Exercise stopped by user")
                break
                
    except Exception as e:
        print(f"Error during exercise: {e}")
        return {"success": False, "error": str(e)}
    
    finally:
        cap.release()
        cv2.destroyAllWindows()
    
    return {
        "success": True,
        "exercise_type": exercise_type,
        "duration": duration,
        "final_stats": stats
    }

# ---------- Command Line Interface ----------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vrScript_simple.py <exercise_type> [duration]")
        print("Available exercises:", list(exercises.keys()))
        sys.exit(1)
    
    exercise_type = sys.argv[1]
    duration = int(sys.argv[2]) if len(sys.argv) > 2 else 300
    
    if exercise_type not in exercises:
        print(f"Unknown exercise: {exercise_type}")
        print("Available exercises:", list(exercises.keys()))
        sys.exit(1)
    
    result = run_vr_exercise(exercise_type, duration)
    print(json.dumps(result, indent=2))
