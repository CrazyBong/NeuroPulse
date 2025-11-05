import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Activity, Brain, Lightbulb, TrendingUp, TrendingDown, AlertCircle, Heart, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { analyzeFace } from '../services/api';
import { generateMentalHealthTips } from '../services/openai';
import type { FaceEmotionResponse } from '../services/api';

interface LiveEmotionAnalysisProps {
  onComplete: (finalResult: FaceEmotionResponse) => void;
  onError?: () => void;
  initialStream?: MediaStream | null;
}

interface LiveFeedback {
  emotion: string;
  confidence: number;
  aiComment: string;
  timestamp: number;
}

export function LiveEmotionAnalysis({ onComplete, onError, initialStream }: LiveEmotionAnalysisProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<FaceEmotionResponse | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState<{ label: string; count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    startLiveAnalysis();
    
    // Update session duration every second
    const durationInterval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);

    return () => {
      stopLiveAnalysis();
      clearInterval(durationInterval);
    };
  }, []);

  const startLiveAnalysis = async () => {
    try {
      let mediaStream: MediaStream;

      // Use the initial stream if provided (from WebcamAnalyzer)
      if (initialStream) {
        mediaStream = initialStream;
        setStream(mediaStream);
      } else {
        // Only request new permission if no stream provided
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media devices not supported in this browser');
        }

        // Check if we already have permission
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          if (permissionStatus.state === 'denied') {
            setPermissionDenied(true);
            setError('Camera permission was denied. Please enable camera access in your browser settings and refresh the page.');
            return;
          }
        } catch (e) {
          // Permission API might not be supported, continue anyway
          console.log('Permissions API not supported, proceeding with getUserMedia');
        }

        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });

        setStream(mediaStream);
      }

      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Analyze every 3 seconds for real-time feedback
      analyzeIntervalRef.current = setInterval(() => {
        captureAndAnalyze();
      }, 3000);
    } catch (error: any) {
      console.error('Failed to start live analysis:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera access was denied. Please click the camera icon in your browser\'s address bar and allow camera access, then refresh the page.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        setError('Camera is already in use by another application. Please close other apps using the camera and try again.');
      } else {
        setError(error.message || 'Unable to access camera. Please check your browser settings and try again.');
      }
    }
  };

  const stopLiveAnalysis = () => {
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
    }
    // Only stop the stream if we created it (not if it was passed as initialStream)
    if (stream && !initialStream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !isAnalyzing) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
        });

        const result = await analyzeFace(blob);
        setCurrentEmotion(result);
        
        // Update emotion history
        setEmotionHistory(prev => {
          const existing = prev.find(e => e.label === result.emotion);
          if (existing) {
            return prev.map(e => 
              e.label === result.emotion ? { ...e, count: e.count + 1 } : e
            );
          }
          return [...prev, { label: result.emotion, count: 1 }];
        });

        // Generate AI feedback
        const aiComment = generateAIComment(result);
        setLiveFeedback(prev => [
          {
            emotion: result.emotion,
            confidence: result.confidence,
            aiComment,
            timestamp: Date.now()
          },
          ...prev.slice(0, 4) // Keep last 5 feedbacks
        ]);
      }
    } catch (error) {
      console.error('Live analysis failed:', error);
    }
  };

  const generateAIComment = (emotion: FaceEmotionResponse): string => {
    const comments: Record<string, string[]> = {
      joy: [
        "Your smile is radiating positive energy! Keep up this wonderful mood.",
        "Happiness detected! This emotional state is great for productivity and creativity.",
        "You're in a great mood! Consider sharing this positive energy with others."
      ],
      sadness: [
        "I notice you might be feeling down. Remember, it's okay to take a moment for yourself.",
        "Your expression suggests some sadness. Consider taking deep breaths or reaching out to someone.",
        "Feeling low is natural. Perhaps a short break or a walk could help lift your spirits."
      ],
      anger: [
        "I detect some tension. Try the 4-7-8 breathing technique to help calm your nervous system.",
        "Your expression shows frustration. Taking a brief pause before reacting can be helpful.",
        "High stress detected. Consider stepping away momentarily to regain composure."
      ],
      fear: [
        "Anxiety detected. Ground yourself by focusing on 5 things you can see around you.",
        "You seem worried. Remember to breathe deeply - you've got this.",
        "I notice some nervousness. Try progressive muscle relaxation to ease tension."
      ],
      surprise: [
        "Unexpected emotion detected! Surprises can be energizing.",
        "Your expression shows surprise. Take a moment to process what you're experiencing.",
        "Something caught your attention! Stay present with this moment."
      ],
      neutral: [
        "You appear calm and centered. This is a great state for focused work.",
        "Balanced emotional state detected. Maintain this equilibrium.",
        "Your expression is neutral and composed - a sign of good emotional regulation."
      ]
    };

    const emotionComments = comments[emotion.emotion.toLowerCase()] || comments.neutral;
    return emotionComments[Math.floor(Math.random() * emotionComments.length)];
  };

  const handleFinishAnalysis = () => {
    setIsAnalyzing(false);
    if (currentEmotion) {
      onComplete(currentEmotion);
    } else {
      // If no emotion detected yet, create a default one
      onComplete({
        emotion: 'neutral',
        confidence: 0.5,
        detailed_emotions: { neutral: 0.5 }
      });
    }
  };

  const handleGoBack = () => {
    if (onError) {
      onError();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If there's an error, show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-700/30 rounded-2xl p-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="w-8 h-8 text-red-400" />
            </motion.div>
            
            <h3 className="text-white text-xl mb-3">Camera Access Issue</h3>
            <p className="text-red-200 mb-6 leading-relaxed max-w-lg mx-auto">
              {error}
            </p>

            {permissionDenied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-red-700/20 rounded-lg p-4 mb-6 text-left max-w-lg mx-auto"
              >
                <h4 className="text-red-300 mb-2">How to fix this:</h4>
                <ol className="text-red-200/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Click the camera icon in your browser's address bar</li>
                  <li>Select "Always allow" for camera access</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </motion.div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-red-700/30 text-red-300 hover:bg-red-900/20"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white mb-2">Live Emotion Detection</h2>
        <p className="text-slate-400">Real-time facial emotion analysis with AI-powered insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Video Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Video Container */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-5 h-5 text-purple-400" />
                </motion.div>
                <h3 className="text-white">Live Feed</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <span className="text-purple-300 text-sm">Live</span>
                </div>
                <div className="text-slate-400 text-sm">
                  {formatTime(sessionDuration)}
                </div>
              </div>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Current Emotion Overlay */}
              {currentEmotion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4"
                >
                  <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Current Emotion</p>
                        <motion.h3
                          key={currentEmotion.emotion}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-white text-2xl capitalize"
                        >
                          {currentEmotion.emotion}
                        </motion.h3>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm mb-1">Confidence</p>
                        <motion.p
                          key={currentEmotion.confidence}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-purple-300 text-2xl"
                        >
                          {(currentEmotion.confidence * 100).toFixed(0)}%
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scanning Effect */}
              <motion.div
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleFinishAnalysis}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
          >
            <Brain className="w-5 h-5 mr-2" />
            Complete Analysis & View Results
          </Button>
        </motion.div>

        {/* Live Feedback Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </motion.div>
              <h3 className="text-white">AI Insights</h3>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {liveFeedback.map((feedback, index) => (
                  <motion.div
                    key={feedback.timestamp}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-slate-900/50 border border-amber-700/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        className="w-2 h-2 bg-amber-400 rounded-full"
                      />
                      <span className="text-amber-200 text-sm capitalize">
                        {feedback.emotion}
                      </span>
                      <span className="text-amber-300/60 text-xs ml-auto">
                        {new Date(feedback.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-amber-100/80 text-sm leading-relaxed">
                      {feedback.aiComment}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Emotion Statistics */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-400" />
              <h3 className="text-white">Session Stats</h3>
            </div>

            <div className="space-y-3">
              {emotionHistory
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((emotion, index) => {
                  const total = emotionHistory.reduce((sum, e) => sum + e.count, 0);
                  const percentage = (emotion.count / total) * 100;
                  
                  return (
                    <motion.div
                      key={emotion.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm capitalize">{emotion.label}</span>
                        <span className="text-slate-400 text-xs">{emotion.count}x</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
