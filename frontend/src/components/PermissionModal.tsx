import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Shield, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantCamera: () => void;
  onDeny: () => void;
}

export function PermissionModal({ isOpen, onClose, onGrantCamera, onDeny }: PermissionModalProps) {
  const [step, setStep] = useState<'intro' | 'requesting' | 'error'>('intro');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset to intro when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleGrantPermissions = async () => {
    setStep('requesting');
    try {
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

      // Only request camera permission (no audio needed for this app)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      // Stop the stream immediately - we just needed to get permission
      stream.getTracks().forEach(track => track.stop());
      
      onGrantCamera();
      onClose();
    } catch (error: any) {
      console.error('Permission error:', error);
      
      // Set user-friendly error message
      let message = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError') {
        message += 'Permission was denied. Please click the camera icon in your browser\'s address bar and allow camera access.';
      } else if (error.name === 'NotFoundError') {
        message += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        message += 'Camera is already in use by another application. Please close other apps using the camera.';
      } else {
        message += error.message || 'An unknown error occurred.';
      }
      
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleTextOnly = () => {
    onDeny();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 p-8 z-50"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                    className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-white">Camera Access</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-300">
                    NeuroPulse analyzes your emotions through facial expressions for comprehensive results.
                  </p>

                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <Camera className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white">Camera Access</p>
                        <p className="text-slate-400 text-sm">Detect facial expressions in real-time</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white">Privacy First</p>
                        <p className="text-slate-400 text-sm">No data is stored. All processing is ephemeral.</p>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-200 text-sm">
                      Not intended for collecting PII or securing sensitive data.
                    </p>
                  </motion.div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGrantPermissions}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Grant Access
                  </Button>
                  <Button
                    onClick={handleTextOnly}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Text Only Mode
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'requesting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                />
                <p className="text-white">Requesting camera permission...</p>
                <p className="text-slate-400 text-sm text-center">
                  Please allow camera access in your browser
                </p>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h2 className="text-white">Permission Error</h2>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{errorMessage}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-300 text-sm">To enable camera access:</p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-400 text-sm ml-2">
                    <li>Click the camera/lock icon in your browser's address bar</li>
                    <li>Select "Allow" for camera permission</li>
                    <li>Reload the page and try again</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setStep('intro');
                      setErrorMessage('');
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      onDeny();
                      onClose();
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Continue with Text Only
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
