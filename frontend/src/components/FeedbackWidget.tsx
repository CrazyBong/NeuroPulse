import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating) {
      // In production, send to backend
      console.log('Feedback submitted:', { rating, feedback });
      setSubmitted(true);
      
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setRating(null);
        setFeedback('');
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-shadow z-40"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>

      {/* Feedback panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-96 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 z-50"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white mb-1">Share Your Feedback</h3>
                    <p className="text-slate-400 text-sm">Help us improve NeuroPulse</p>
                  </div>

                  <div>
                    <p className="text-slate-300 text-sm mb-3">How accurate was the analysis?</p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating('up')}
                        className={`flex-1 p-3 rounded-xl border transition-all ${
                          rating === 'up'
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <ThumbsUp className="w-6 h-6 mx-auto" />
                        <p className="text-sm mt-1">Accurate</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating('down')}
                        className={`flex-1 p-3 rounded-xl border transition-all ${
                          rating === 'down'
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <ThumbsDown className="w-6 h-6 mx-auto" />
                        <p className="text-sm mt-1">Inaccurate</p>
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">
                      Additional comments (optional)
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us more..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!rating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <ThumbsUp className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-white mb-2">Thank You!</h3>
                  <p className="text-slate-400">Your feedback helps us improve</p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
