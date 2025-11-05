import { motion } from 'motion/react';
import { StressGauge } from './StressGauge';
import { EmotionChart } from './EmotionChart';
import { TrendingUp, TrendingDown, Brain, Heart, AlertCircle, Lightbulb, ExternalLink, Activity } from 'lucide-react';
import type { FusionResponse } from '../services/api';
import { useMemo, useState, useEffect } from 'react';
import { generateMentalHealthTips, type MentalHealthTipsResponse } from '../services/openai';

interface DashboardProps {
  data: FusionResponse;
}

export function Dashboard({ data }: DashboardProps) {
  const [mentalHealthTips, setMentalHealthTips] = useState<MentalHealthTipsResponse | null>(null);
  const [loadingTips, setLoadingTips] = useState(true);

  const stressLevel = useMemo(() => {
    const score = data.combined_stress_score;
    if (score < 0.3) return { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: TrendingDown };
    if (score < 0.6) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: Activity };
    return { label: 'High', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', icon: TrendingUp };
  }, [data.combined_stress_score]);

  const StressIcon = stressLevel.icon;

  // Generate detailed mental health tips using OpenAI service
  useEffect(() => {
    const fetchTips = async () => {
      setLoadingTips(true);
      try {
        const tipsResponse = await generateMentalHealthTips({
          stressScore: data.combined_stress_score,
          primaryEmotion: data.primary_emotion,
          emotionBreakdown: data.emotions,
          hasTextAnalysis: data.breakdown.text_weight > 0,
          hasFaceAnalysis: data.breakdown.face_weight > 0,
          textStress: data.breakdown.text_stress,
          faceStress: data.breakdown.face_stress,
        });
        setMentalHealthTips(tipsResponse);
      } catch (error) {
        console.error('Error generating mental health tips:', error);
      } finally {
        setLoadingTips(false);
      }
    };

    fetchTips();
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-white">Analysis Complete</h2>
        <p className="text-slate-400">Here's what we found based on your emotional state</p>
      </motion.div>

      {/* Primary Emotion - Featured at top */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 text-center"
      >
        <p className="text-slate-400 text-sm mb-3">Primary Emotion</p>
        <h3 className="text-white capitalize text-4xl mb-3">
          {data.primary_emotion}
        </h3>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full">
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <span className="text-slate-300 text-sm">
            {(data.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </motion.div>

      {/* Stress Level & Emotion Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stress Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-slate-400" />
            <h3 className="text-white">Stress Level</h3>
          </div>
          
          <div className="flex flex-col items-center py-4">
            <StressGauge value={data.combined_stress_score} />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`mt-6 flex items-center gap-2 px-4 py-2 ${stressLevel.bgColor} ${stressLevel.borderColor} border rounded-full`}
            >
              <StressIcon className={`w-4 h-4 ${stressLevel.color}`} />
              <span className={`text-sm ${stressLevel.color}`}>{stressLevel.label}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-slate-400" />
            <h3 className="text-white">Emotions Detected</h3>
          </div>
          
          <EmotionChart emotions={data.emotions} />
        </motion.div>
      </div>

      {/* Analysis Breakdown - Only show if both modalities used */}
      {data.breakdown.face_weight > 0 && data.breakdown.text_weight > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="text-white mb-4">Analysis Sources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Text Analysis</span>
                <span className="text-slate-300">{(data.breakdown.text_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.breakdown.text_stress * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-blue-500/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Facial Analysis</span>
                <span className="text-slate-300">{(data.breakdown.face_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.breakdown.face_stress * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-purple-500/80"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mental Health Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-slate-400" />
          <h3 className="text-white">Recommendations</h3>
        </div>

        {loadingTips ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-slate-600 border-t-slate-400 rounded-full"
            />
            <span className="ml-3 text-slate-400">Generating recommendations...</span>
          </div>
        ) : mentalHealthTips ? (
          <div className="space-y-6">
            {/* Summary */}
            <p className="text-slate-300 leading-relaxed">{mentalHealthTips.summary}</p>

            {/* Tips */}
            <div className="space-y-3">
              {mentalHealthTips.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>

            {/* Resources */}
            {mentalHealthTips.resources.length > 0 && (
              <div className="pt-4 border-t border-slate-700/50 space-y-3">
                <h4 className="text-slate-400 text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Professional Resources
                </h4>
                <div className="space-y-2">
                  {mentalHealthTips.resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="p-3 bg-slate-800/30 rounded-lg"
                    >
                      <p className="text-slate-300 text-sm mb-1">{resource.title}</p>
                      <p className="text-slate-500 text-xs">{resource.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-slate-500 text-xs pt-4 border-t border-slate-700/50">
              These recommendations are AI-generated and not a substitute for professional medical advice. 
              If you're experiencing a mental health crisis, please contact emergency services or a crisis helpline immediately.
            </p>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">Unable to generate recommendations at this time.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
