import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2 } from 'lucide-react';
import speechService from '../../services/speechService.js';

const AudioRecorder = ({ 
  onRecordingComplete, 
  onError, 
  onTranscriptionComplete,
  maxDuration = 300, // 5 minutes max
  showWaveform = true,
  className = '',
  disabled = false,
  authToken = null // Add authToken prop
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      
      if (!speechService.isRecordingSupported()) {
        throw new Error('Audio recording is not supported in this browser');
      }

      await speechService.startRecording({
        onComplete: (blob) => {
          setAudioBlob(blob);
          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }
        },
        onError: (err) => {
          setError(err.message);
          if (onError) {
            onError(err);
          }
        }
      });

      setIsRecording(true);
      setDuration(0);
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsed = speechService.getRecordingDuration(startTimeRef.current);
        setDuration(elapsed);
        
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      // Start waveform animation
      if (showWaveform) {
        animateWaveform();
      }
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const blob = speechService.stopRecording();
    setAudioBlob(blob);
    setIsRecording(false);
    setIsPaused(false);
    
    if (onRecordingComplete && blob) {
      onRecordingComplete(blob);
    } else if (!blob && onError) {
      onError(new Error('Failed to create audio recording'));
    }
  };

  const pauseRecording = () => {
    if (isRecording) {
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now() - (duration * 1000);
      
      intervalRef.current = setInterval(() => {
        const elapsed = speechService.getRecordingDuration(startTimeRef.current);
        setDuration(elapsed);
        
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      if (showWaveform) {
        animateWaveform();
      }
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      try {
        // Create a new object URL for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setError('Failed to play audio recording');
        });
        setIsPlaying(true);
      } catch (error) {
        console.error('Error creating audio URL:', error);
        setError('Failed to create audio URL for playback');
      }
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    setError('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const transcribeRecording = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    setError('');

    try {
      const result = await speechService.transcribeAudio(audioBlob, {}, authToken);
      
      if (result.success) {
        if (onTranscriptionComplete) {
          onTranscriptionComplete(result);
        }
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const animateWaveform = () => {
    const canvas = waveformRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      if (!isRecording || isPaused) return;

      ctx.clearRect(0, 0, width, height);
      
      // Create animated waveform bars
      const barCount = 20;
      const barWidth = width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.8;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const formatDuration = (seconds) => {
    return speechService.formatDuration(seconds);
  };

  return (
    <div className={`audio-recorder ${className}`}>
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="font-medium">Start Recording</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center space-x-2">
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
            
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center space-x-2">
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <button
              onClick={transcribeRecording}
              disabled={isTranscribing}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              <span>{isTranscribing ? 'Transcribing...' : 'Transcribe'}</span>
            </button>
            
            <button
              onClick={deleteRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Duration Display */}
      {(isRecording || audioBlob) && (
        <div className="text-center mb-4">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatDuration(duration)}
          </div>
          {isRecording && (
            <div className="text-sm text-gray-600 mt-1">
              {isPaused ? 'Paused' : 'Recording...'}
            </div>
          )}
        </div>
      )}
      {/* Transcription Result - Removed to avoid duplication with parent component */}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio playback error:', e);
          setError('Audio playback failed');
        }}
      />

      {/* Recording Status Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {isPaused ? 'Paused' : 'Recording'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
