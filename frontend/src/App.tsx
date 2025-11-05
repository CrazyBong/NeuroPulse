import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Shield, Info, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { PermissionModal } from './components/PermissionModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TextAnalyzer } from './components/TextAnalyzer';
import { WebcamAnalyzer } from './components/WebcamAnalyzer';
import { LiveEmotionAnalysis } from './components/LiveEmotionAnalysis';
import { Dashboard } from './components/Dashboard';
import { FeedbackWidget } from './components/FeedbackWidget';
import { analyzeFusion } from './services/api';
import type { TextEmotionResponse, FaceEmotionResponse, FusionResponse } from './services/api';

type AppState = 'welcome' | 'analyzing' | 'live-analysis' | 'results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(() => {
    // Check localStorage for previously granted permissions
    const stored = localStorage.getItem('neuropulse_camera_enabled');
    return stored === 'true';
  });
  const [textResult, setTextResult] = useState<TextEmotionResponse | null>(null);
  const [faceResult, setFaceResult] = useState<FaceEmotionResponse | null>(null);
  const [fusionResult, setFusionResult] = useState<FusionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check camera permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if browser supports permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          // Listen for permission changes
          cameraPermission.addEventListener('change', () => {
            if (cameraPermission.state === 'denied') {
              localStorage.removeItem('neuropulse_camera_enabled');
              setCameraEnabled(false);
            } else if (cameraPermission.state === 'granted' && localStorage.getItem('neuropulse_camera_enabled') === 'true') {
              setCameraEnabled(true);
            }
          });
          
          // If permission is granted and we have it stored, keep it enabled
          if (cameraPermission.state === 'granted' && localStorage.getItem('neuropulse_camera_enabled') === 'true') {
            setCameraEnabled(true);
          } else if (cameraPermission.state === 'denied') {
            // If denied, clear the stored permission
            localStorage.removeItem('neuropulse_camera_enabled');
            setCameraEnabled(false);
          } else if (cameraPermission.state === 'prompt') {
            // Permission not yet requested, clear any stored value
            localStorage.removeItem('neuropulse_camera_enabled');
            setCameraEnabled(false);
          }
        }
      } catch (error) {
        // Permissions API not supported or error occurred
        console.log('Permissions API not supported');
      } finally {
        setPermissionChecked(true);
      }
    };

    checkPermissions();
  }, []);

  // Animated particles background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
  }));

  const handleGetStarted = () => {
    setShowPermissionModal(true);
  };

  const handleCameraGranted = () => {
    setCameraEnabled(true);
    localStorage.setItem('neuropulse_camera_enabled', 'true');
    setAppState('analyzing');
  };

  const handleCameraDenied = () => {
    setCameraEnabled(false);
    localStorage.removeItem('neuropulse_camera_enabled');
    setAppState('analyzing');
  };

  const handleTextAnalysis = async (result: TextEmotionResponse) => {
    setTextResult(result);
    
    if (!cameraEnabled) {
      // Text-only mode
      setIsProcessing(true);
      const fusion = await analyzeFusion('sample text for fusion');
      setFusionResult(fusion);
      setIsProcessing(false);
      setAppState('results');
    }
  };

  const handleFaceCapture = async (result: FaceEmotionResponse) => {
    setFaceResult(result);
    // Transition to live analysis mode
    setAppState('live-analysis');
  };

  const handleStreamReady = (stream: MediaStream) => {
    setCameraStream(stream);
  };

  const handleLiveAnalysisComplete = async (finalResult: FaceEmotionResponse) => {
    setFaceResult(finalResult);
    
    if (textResult) {
      // Run fusion analysis
      setIsProcessing(true);
      const fusion = await analyzeFusion('sample text', new Blob());
      setFusionResult(fusion);
      setIsProcessing(false);
      setAppState('results');
    } else {
      // Face-only mode (no text analysis)
      setIsProcessing(true);
      const fusion = await analyzeFusion('', new Blob());
      setFusionResult(fusion);
      setIsProcessing(false);
      setAppState('results');
    }
  };

  const handleReset = () => {
    setAppState('analyzing');
    setTextResult(null);
    setFaceResult(null);
    setFusionResult(null);
    setIsProcessing(false);
    // Clean up camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleBackToHome = () => {
    setAppState('welcome');
    setTextResult(null);
    setFaceResult(null);
    setFusionResult(null);
    setIsProcessing(false);
    // Clean up camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-purple-500/30 blur-xl"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={handleBackToHome}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white">NeuroPulse</h1>
                  <p className="text-slate-400 text-sm">AI-Powered Emotion Analysis</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPrivacyModal(true)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Privacy Policy"
                >
                  <Shield className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="About"
                >
                  <Info className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {appState === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-4xl mx-auto text-center py-12"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
                >
                  <Brain className="w-16 h-16 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
                >
                  Welcome to NeuroPulse
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300 mb-12 max-w-2xl mx-auto text-lg"
                >
                  Advanced AI-powered emotion and stress detection using text analysis and facial recognition.
                  Privacy-first, real-time processing with explainable AI insights.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    {
                      icon: Brain,
                      title: 'Text Analysis',
                      description: 'Advanced NLP with SHAP explainability',
                      color: 'from-blue-500 to-cyan-500',
                    },
                    {
                      icon: Zap,
                      title: 'Face Detection',
                      description: 'Real-time facial emotion recognition',
                      color: 'from-purple-500 to-pink-500',
                    },
                    {
                      icon: Shield,
                      title: 'Privacy First',
                      description: 'No data stored, all processing ephemeral',
                      color: 'from-green-500 to-emerald-500',
                    },
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3,
                            repeatType: 'reverse',
                          }}
                          className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <h3 className="text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-400 text-sm">{feature.description}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-lg px-8 py-6 shadow-2xl shadow-purple-500/50"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-slate-500 text-sm mt-6"
                >
                  By continuing, you agree to our privacy policy and terms of use
                </motion.p>
              </motion.div>
            )}

            {appState === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-white mb-2">Emotion & Stress Analysis</h2>
                  <p className="text-slate-400">
                    {cameraEnabled
                      ? 'Start with text analysis, then proceed to live facial emotion detection'
                      : 'Text-only analysis mode'}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <TextAnalyzer onAnalysisComplete={handleTextAnalysis} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <WebcamAnalyzer
                      isEnabled={cameraEnabled}
                      onAnalysisComplete={handleFaceCapture}
                      onStartLiveAnalysis={handleStreamReady}
                    />
                  </motion.div>
                </div>

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
                    />
                    <p className="text-white">Processing your analysis...</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {appState === 'live-analysis' && (
              <motion.div
                key="live-analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LiveEmotionAnalysis 
                  onComplete={handleLiveAnalysisComplete}
                  onError={handleReset}
                  initialStream={cameraStream}
                />
              </motion.div>
            )}

            {appState === 'results' && fusionResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <Dashboard data={fusionResult} />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <Button
                    onClick={handleReset}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Again
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t border-slate-800/50 backdrop-blur-sm bg-slate-900/30 mt-12"
        >
          <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm">
            <p>NeuroPulse © 2025 | Developed by Shubhranshuu</p>
            <p className="mt-1">
              Powered by DistilRoBERTa, DeepFace, and SHAP
            </p>
          </div>
        </motion.footer>
      </div>

      {/* Modals */}
      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onGrantCamera={handleCameraGranted}
        onDeny={handleCameraDenied}
      />

      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      {/* Feedback widget */}
      {appState !== 'welcome' && <FeedbackWidget />}
    </div>
  );
}
