#!/usr/bin/env python3
"""
Setup script for MindFlow VR Exercise Tracking
This script installs the required Python dependencies for pose detection and exercise tracking.
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages from requirements.txt"""
    try:
        print("🔧 Installing Python dependencies for VR exercise tracking...")
        
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        requirements_file = os.path.join(script_dir, "requirements.txt")
        
        if not os.path.exists(requirements_file):
            print("❌ requirements.txt not found!")
            return False
        
        # Install requirements
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Successfully installed all dependencies!")
            print("📦 Installed packages:")
            print("   - opencv-python: Computer vision and camera handling")
            print("   - mediapipe: Pose detection and landmark tracking")
            print("   - numpy: Numerical computations")
            return True
        else:
            print("❌ Failed to install dependencies:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error during installation: {e}")
        return False

def test_installation():
    """Test if the installation was successful"""
    try:
        print("\n🧪 Testing installation...")
        
        # Test imports
        import cv2
        import mediapipe as mp
        import numpy as np
        
        print("✅ All packages imported successfully!")
        
        # Test camera access
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✅ Camera access working!")
            cap.release()
        else:
            print("⚠️  Camera not accessible (this is normal if no camera is connected)")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 MindFlow VR Exercise Setup")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required!")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Install requirements
    if install_requirements():
        # Test installation
        if test_installation():
            print("\n🎉 Setup completed successfully!")
            print("\n📋 Next steps:")
            print("   1. Start your Node.js backend server")
            print("   2. Open the MindFlow frontend")
            print("   3. Navigate to the Exercise section")
            print("   4. Select an exercise and start tracking!")
            print("\n💡 Available exercises:")
            print("   - Rep-based: bicep_curl, squat, pushup, lunge")
            print("   - Hold-based: tree_pose, warrior_ii, plank, chair_pose, cobra_pose")
            print("   - Meditation: meditation, breathing, stretching")
        else:
            print("\n❌ Setup completed but tests failed!")
            sys.exit(1)
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
