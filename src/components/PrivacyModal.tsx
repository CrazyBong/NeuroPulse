import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Eye, Database, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const privacyPoints = [
    {
      icon: Lock,
      title: 'No Data Storage',
      description: 'Your text, images, and video frames are never stored on our servers.',
      color: 'text-green-400'
    },
    {
      icon: Eye,
      title: 'Ephemeral Processing',
      description: 'All emotion analysis happens in real-time and is immediately discarded.',
      color: 'text-blue-400'
    },
    {
      icon: Database,
      title: 'Local Processing',
      description: 'Face detection runs in your browser. Only minimal cropped images are sent for analysis.',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'You control what data is analyzed. Camera and text analysis can be toggled independently.',
      color: 'text-pink-400'
    }
  ];

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30 p-8 z-50 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-white">Privacy & Data Policy</h2>
                  <p className="text-slate-400">Your privacy is our priority</p>
                </div>
              </div>

              <div className="space-y-4">
                {privacyPoints.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <motion.div
                      key={point.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="flex-shrink-0"
                      >
                        <Icon className={`w-6 h-6 ${point.color}`} />
                      </motion.div>
                      <div>
                        <h3 className="text-white mb-1">{point.title}</h3>
                        <p className="text-slate-400">{point.description}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-auto" />
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl"
              >
                <h3 className="text-amber-300 mb-2">Important Disclaimer</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Not intended for collecting Personally Identifiable Information (PII).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Not suitable for securing highly sensitive or confidential data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Results are for informational purposes and should not be used for medical diagnosis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Always consult healthcare professionals for mental health concerns.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  I Understand
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
