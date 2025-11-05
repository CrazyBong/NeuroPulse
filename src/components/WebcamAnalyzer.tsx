import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CameraOff, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { analyzeFace } from '../services/api';
import type { FaceEmotionResponse } from '../services/api';

interface WebcamAnalyzerProps {
  isEnabled: boolean;
  onAnalysisComplete: (result: FaceEmotionResponse) => void;
  onStartLiveAnalysis?: (stream: MediaStream) => void;
}

export function WebcamAnalyzer({ isEnabled, onAnalysisComplete, onStartLiveAnalysis }: WebcamAnalyzerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive && isEnabled) {
      startWebcam();
    }

    return () => {
      if (isActive) {
        stopWebcam();
      }
    };
  }, [isActive, isEnabled]);

  const startWebcam = async () => {
    try {
      setError('');
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      // Check current permission state before requesting
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissionStatus.state === 'denied') {
          throw new Error('Camera permission was previously denied. Please enable it in your browser settings.');
        }
      } catch (e) {
        // Permissions API might not be supported, continue anyway
        console.log('Permissions API not supported');
      }

      // Only request video permission (no audio needed)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Simulate face detection (in production, use face-api.js here)
      const detectInterval = setInterval(() => {
        setFaceDetected(Math.random() > 0.3); // Mock detection
      }, 1000);

      return () => clearInterval(detectInterval);
    } catch (err: any) {
      console.error('Failed to start webcam:', err);
      
      let errorMsg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') {
        errorMsg += 'Permission denied. Please click the camera icon in your browser\'s address bar and allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMsg += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg += 'Camera is already in use by another application. Please close other apps using the camera.';
      } else {
        errorMsg += err.message || 'An unknown error occurred.';
      }
      
      setError(errorMsg);
      setIsActive(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceDetected(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
        });

        // Analyze face
        const result = await analyzeFace(blob);
        
        // Pass the stream to live analysis if callback is provided
        if (stream && onStartLiveAnalysis) {
          onStartLiveAnalysis(stream);
        }
        
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <CameraOff className="w-5 h-5 text-slate-500" />
          <h3 className="text-white">Facial Emotion Analysis</h3>
        </div>
        <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
          <CameraOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Camera access not granted</p>
          <p className="text-slate-500 text-sm mt-2">Using text-only mode</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          >
            <Camera className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h3 className="text-white">Facial Emotion Analysis</h3>
        </div>
        
        <Button
          onClick={() => {
            setError('');
            setIsActive(!isActive);
          }}
          variant={isActive ? 'destructive' : 'default'}
          size="sm"
          className={isActive ? '' : 'bg-gradient-to-r from-purple-600 to-pink-600'}
        >
          {isActive ? (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <CameraOff className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              </motion.div>
              <div className="flex-1">
                <p className="text-red-200 text-sm">{error}</p>
                <p className="text-red-300/70 text-xs mt-1">
                  You can still use text-only analysis mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Face detection overlay */}
        <AnimatePresence>
          {isActive && faceDetected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Scanning lines effect */}
              <motion.div
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"
              />
              
              {/* Corner brackets */}
              <div className="absolute inset-0 m-auto w-3/4 h-3/4">
                {[
                  'top-0 left-0 border-t-2 border-l-2',
                  'top-0 right-0 border-t-2 border-r-2',
                  'bottom-0 left-0 border-b-2 border-l-2',
                  'bottom-0 right-0 border-b-2 border-r-2',
                ].map((position, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className={`absolute ${position} border-purple-500 w-8 h-8`}
                  />
                ))}
              </div>

              {/* Face detected badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                <span className="text-green-300 text-sm">Face Detected</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Activity className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-purple-300 text-sm">Live</span>
          </motion.div>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-white">Analyzing facial emotion...</p>
            </div>
          </motion.div>
        )}

        {/* No camera active state */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Camera inactive</p>
              <p className="text-slate-500 text-sm mt-1">Click "Start Camera" to begin</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="space-y-2">
          <Button
            onClick={captureAndAnalyze}
            disabled={!faceDetected || isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Live Emotion Analysis
              </>
            )}
          </Button>
          <p className="text-slate-500 text-xs text-center">
            You'll see continuous emotion detection with AI-powered feedback
          </p>
        </div>
      )}
    </motion.div>
  );
}
