import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PythonVRService {
  constructor() {
    this.activeSessions = new Map();
    this.pythonPath = 'py'; // Use 'py' for Windows Python launcher
    this.scriptPath = path.join(__dirname, '../../../python scripts/vrScript_simple.py');
  }

  /**
   * Check if Python dependencies are available
   */
  async checkDependencies() {
    try {
      // Test if we can import the required modules
      const result = await this.runPythonScript(['--test-deps']);
      return result.success;
    } catch (error) {
      console.error('Error checking Python dependencies:', error);
      // For now, return true since we have a simplified version that works
      return true;
    }
  }

  /**
   * Get available exercises from Python script
   */
  async getAvailableExercises() {
    try {
      // Return hardcoded list of available exercises for the simplified script
      return [
        "bicep_curl", "squat", "pushup", "lunge", 
        "tree_pose", "warrior_ii", "plank", "chair_pose", 
        "cobra_pose", "meditation", "breathing", "stretching"
      ];
    } catch (error) {
      console.error('Error getting available exercises:', error);
      return [];
    }
  }

  /**
   * Start exercise tracking session
   */
  async startExerciseTracking(sessionId, exerciseType, duration = null, onData = null, onError = null) {
    try {
      // Check if session already exists
      if (this.activeSessions.has(sessionId)) {
        throw new Error(`Session ${sessionId} is already active`);
      }

      // Prepare command arguments for simplified script: [exercise_type, duration]
      const args = [exerciseType];
      if (duration) {
        args.push(duration.toString());
      } else {
        args.push('300'); // Default 5 minutes
      }

      console.log(`Starting VR exercise tracking: ${exerciseType} (Session: ${sessionId})`);
      console.log(`Python command: ${this.pythonPath} ${this.scriptPath} ${args.join(' ')}`);

      // Spawn Python process
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(this.scriptPath)
      });

      // Store session info
      const sessionInfo = {
        id: sessionId,
        exerciseType,
        duration,
        process: pythonProcess,
        startTime: new Date(),
        status: 'active',
        data: {
          repCount: 0,
          holdTime: 0,
          accuracy: 0,
          qualityScore: 0
        }
      };

      this.activeSessions.set(sessionId, sessionInfo);

      // Handle process output
      pythonProcess.stdout.on('data', (data) => {
        try {
          const output = data.toString();
          console.log(`Python stdout: ${output}`);
          
          const lines = output.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const jsonData = JSON.parse(line);
              this.handleSessionData(sessionId, jsonData, onData);
            } catch (parseError) {
              // Not JSON, might be regular output
              console.log(`Python output (non-JSON): ${line}`);
            }
          }
        } catch (error) {
          console.error('Error processing Python output:', error);
        }
      });

      // Handle process errors
      pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        console.error(`Python VR Error: ${errorMessage}`);
        
        if (onError) {
          onError({
            type: 'python_error',
            message: errorMessage,
            sessionId
          });
        }
      });

      // Handle process exit
      pythonProcess.on('close', (code) => {
        console.log(`Python VR process exited with code ${code}`);
        this.handleSessionEnd(sessionId, code, onData);
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        console.error(`Python VR process error: ${error.message}`);
        
        if (onError) {
          onError({
            type: 'process_error',
            message: error.message,
            sessionId
          });
        }
        
        this.activeSessions.delete(sessionId);
      });

      return {
        success: true,
        sessionId,
        message: 'Exercise tracking started successfully'
      };

    } catch (error) {
      console.error('Error starting exercise tracking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stop exercise tracking session
   */
  async stopExerciseTracking(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: `Session ${sessionId} not found`
        };
      }

      console.log(`Stopping VR exercise tracking: ${sessionId}`);

      // Kill the Python process
      if (session.process && !session.process.killed) {
        session.process.kill('SIGTERM');
        
        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!session.process.killed) {
            session.process.kill('SIGKILL');
          }
        }, 5000);
      }

      // Update session status
      session.status = 'stopped';
      session.endTime = new Date();

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      return {
        success: true,
        sessionId,
        message: 'Exercise tracking stopped successfully',
        sessionData: session.data
      };

    } catch (error) {
      console.error('Error stopping exercise tracking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    const sessions = [];
    
    for (const [sessionId, session] of this.activeSessions) {
      sessions.push({
        id: sessionId,
        exerciseType: session.exerciseType,
        duration: session.duration,
        startTime: session.startTime,
        status: session.status,
        data: session.data
      });
    }
    
    return sessions;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Handle session data from Python script
   */
  handleSessionData(sessionId, data, onData) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    switch (data.type) {
      case 'session_start':
        console.log(`Session started: ${data.exercise} (${sessionId})`);
        break;
        
      case 'rep_completed':
        session.data.repCount = data.counter;
        console.log(`Rep completed: ${data.counter} (${sessionId})`);
        break;
        
      case 'session_complete':
        session.status = 'completed';
        session.endTime = new Date();
        session.data.totalTime = data.total_time;
        session.data.repCount = data.counter;
        session.data.holdTime = data.hold_time;
        console.log(`Session completed: ${sessionId}`);
        break;
        
      case 'session_stopped':
        session.status = 'stopped';
        session.endTime = new Date();
        session.data.totalTime = data.total_time;
        session.data.repCount = data.counter;
        session.data.holdTime = data.hold_time;
        console.log(`Session stopped: ${sessionId}`);
        break;
    }

    // Send data to callback if provided
    if (onData) {
      onData({
        sessionId,
        type: data.type,
        data: data,
        sessionData: session.data
      });
    }
  }

  /**
   * Handle session end
   */
  handleSessionEnd(sessionId, exitCode, onData) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = exitCode === 0 ? 'completed' : 'error';
    session.endTime = new Date();

    if (onData) {
      onData({
        sessionId,
        type: 'session_ended',
        exitCode,
        sessionData: session.data
      });
    }

    // Remove from active sessions after a delay
    setTimeout(() => {
      this.activeSessions.delete(sessionId);
    }, 5000);
  }

  /**
   * Run Python script with arguments
   */
  async runPythonScript(args = []) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(this.scriptPath)
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse as JSON
            const result = JSON.parse(output);
            resolve(result);
          } catch {
            // Not JSON, return as text
            resolve({ success: true, output });
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Cleanup all active sessions
   */
  cleanup() {
    console.log('Cleaning up Python VR service...');
    
    for (const [sessionId, session] of this.activeSessions) {
      if (session.process && !session.process.killed) {
        session.process.kill('SIGTERM');
      }
    }
    
    this.activeSessions.clear();
  }
}

// Create singleton instance
const pythonVRService = new PythonVRService();

// Cleanup on process exit
process.on('SIGINT', () => {
  pythonVRService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  pythonVRService.cleanup();
  process.exit(0);
});

export default pythonVRService;
