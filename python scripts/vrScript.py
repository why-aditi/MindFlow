import cv2
import mediapipe as mp
import numpy as np
import time
import json
import sys
import os

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


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
    "warrior_ii": {"type": "hold", "joints": ["hip", "knee", "ankle"], "target_angle": 100, "tolerance": 20},
    "plank": {"type": "hold", "joints": ["shoulder", "hip", "ankle"], "target_angle": 180, "tolerance": 15},
    "chair_pose": {"type": "hold", "joints": ["hip", "knee", "ankle"], "target_angle": 100, "tolerance": 15},
    "cobra_pose": {"type": "hold", "joints": ["hip", "shoulder", "ear"], "target_angle": 200, "tolerance": 30},
    
    # Meditation and breathing exercises
    "meditation": {"type": "meditation", "duration": 300},  # 5 minutes default
    "breathing": {"type": "breathing", "pattern": "4-4-4"},  # inhale-hold-exhale
    "stretching": {"type": "stretch", "duration": 120}  # 2 minutes default
}


# ---------- Landmark extraction ----------
def get_landmark_coords(landmarks, name):
    if name == "shoulder":
        return [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    if name == "elbow":
        return [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    if name == "wrist":
        return [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
    if name == "hip":
        return [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
    if name == "knee":
        return [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
    if name == "ankle":
        return [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
    if name == "ear":
        return [landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].y]
    return [0, 0]


# ---------- Main Function ----------
def run_pose_counter(selected_exercise, session_id=None, duration=None):
    cap = cv2.VideoCapture(0)  # Webcam
    
    if not cap.isOpened():
        print(json.dumps({"error": "Could not open camera"}))
        return

    counter, stage, hold_start, hold_time = 0, None, None, 0
    start_time = time.time()
    exercise_duration = duration or exercises[selected_exercise].get("duration", 300)
    
    # Output initial data
    print(json.dumps({
        "type": "session_start",
        "exercise": selected_exercise,
        "session_id": session_id,
        "duration": exercise_duration
    }))

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time = time.time()
            elapsed_time = current_time - start_time
            
            # Check if session duration is reached
            if exercise_duration and elapsed_time >= exercise_duration:
                print(json.dumps({
                    "type": "session_complete",
                    "exercise": selected_exercise,
                    "session_id": session_id,
                    "total_time": elapsed_time,
                    "counter": counter,
                    "hold_time": hold_time
                }))
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)

            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark
                
                if exercises[selected_exercise]["type"] in ["rep", "hold"]:
                    j1 = get_landmark_coords(landmarks, exercises[selected_exercise]["joints"][0])
                    j2 = get_landmark_coords(landmarks, exercises[selected_exercise]["joints"][1])
                    j3 = get_landmark_coords(landmarks, exercises[selected_exercise]["joints"][2])

                    angle = calculate_angle(j1, j2, j3)

                    cv2.putText(image, str(int(angle)),
                                tuple(np.multiply(j2, [640, 480]).astype(int)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

                    if exercises[selected_exercise]["type"] == "rep":
                        if angle > exercises[selected_exercise]["down_angle"]:
                            stage = "down"
                        if angle < exercises[selected_exercise]["up_angle"] and stage == "down":
                            stage = "up"
                            counter += 1
                            print(json.dumps({
                                "type": "rep_completed",
                                "exercise": selected_exercise,
                                "session_id": session_id,
                                "counter": counter,
                                "angle": angle
                            }))

                    elif exercises[selected_exercise]["type"] == "hold":
                        target, tol = exercises[selected_exercise]["target_angle"], exercises[selected_exercise]["tolerance"]
                        if abs(angle - target) < tol:
                            if hold_start is None:
                                hold_start = time.time()
                            else:
                                hold_time = int(time.time() - hold_start)
                        else:
                            hold_start, hold_time = None, 0

            except Exception as e:
                pass

            # Display info box
            cv2.rectangle(image, (0, 0), (350, 120), (245, 117, 16), -1)
            cv2.putText(image, 'MIND FLOW EXERCISE', (10, 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            cv2.putText(image, selected_exercise.upper().replace('_', ' '), (10, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Show elapsed time
            minutes = int(elapsed_time // 60)
            seconds = int(elapsed_time % 60)
            cv2.putText(image, f'TIME: {minutes:02d}:{seconds:02d}', (10, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

            if exercises[selected_exercise]["type"] == "rep":
                cv2.putText(image, 'REPS', (200, 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
                cv2.putText(image, str(counter), (200, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA)
            elif exercises[selected_exercise]["type"] == "hold":
                cv2.putText(image, 'HOLD(s)', (200, 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
                cv2.putText(image, str(hold_time), (200, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA)
            elif exercises[selected_exercise]["type"] in ["meditation", "breathing", "stretch"]:
                remaining = exercise_duration - elapsed_time
                if remaining > 0:
                    minutes = int(remaining // 60)
                    seconds = int(remaining % 60)
                    cv2.putText(image, f'REMAINING: {minutes:02d}:{seconds:02d}', (200, 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

            # Draw landmarks for pose-based exercises
            if exercises[selected_exercise]["type"] in ["rep", "hold"]:
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                          mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                                          mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2))

            cv2.imshow('MindFlow Exercise Tracker', image)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                print(json.dumps({
                    "type": "session_stopped",
                    "exercise": selected_exercise,
                    "session_id": session_id,
                    "total_time": elapsed_time,
                    "counter": counter,
                    "hold_time": hold_time
                }))
                break

    cap.release()
    cv2.destroyAllWindows()


# ---------- Command line interface ----------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called from Node.js with arguments
        exercise = sys.argv[1]
        session_id = sys.argv[2] if len(sys.argv) > 2 else None
        duration = int(sys.argv[3]) if len(sys.argv) > 3 else None
        
        if exercise in exercises:
            run_pose_counter(exercise, session_id, duration)
        else:
            print(json.dumps({"error": f"Exercise '{exercise}' not found"}))
    else:
        # Interactive mode
        print("Available exercises:")
        for name, details in exercises.items():
            print(f"- {name}: {details['type']}")
        
        choice = input("Enter exercise name: ").strip()
        if choice not in exercises:
            print("Invalid choice, defaulting to 'tree_pose'")
            choice = "tree_pose"
        
        run_pose_counter(choice)
