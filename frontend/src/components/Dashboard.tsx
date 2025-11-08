import { motion } from 'motion/react';
import { StressGauge } from './StressGauge';
import { EmotionChart } from './EmotionChart';
import { TrendingUp, TrendingDown, Brain, Heart, AlertCircle, Lightbulb, ExternalLink, Activity, Sparkles } from 'lucide-react';
import type { FusionResponse } from '../services/api';
import { useState, useEffect, useMemo } from 'react';
import { generateMentalHealthTips, type MentalHealthTipsResponse } from '../services/openai';

interface DashboardProps {
  result: FusionResponse;
}

export function Dashboard({ result }: DashboardProps) {
  // ✅ Prevent undefined properties from crashing UI
  const safeData = {
    success: result?.success ?? false,
    combined_emotion: result?.combined_emotion ?? 'neutral',
    confidence: result?.confidence ?? 0,
    predictions: result?.predictions ?? [],
    sources: {
      text: result?.sources?.text ?? null,
      face: result?.sources?.face ?? null,
      audio: result?.sources?.audio ?? null,
    },
    weights: {
      text: result?.weights?.text ?? 0,
      face: result?.weights?.face ?? 0,
      audio: result?.weights?.audio ?? 0,
    },
    stress: result?.stress ?? 0,
    llm_summary: result?.llm_summary ?? '',
    error: result?.error ?? undefined,
  };

  const formattedPredictions = useMemo(() => {
    if (!safeData.predictions || typeof safeData.predictions !== "object") return [];
    if (Array.isArray(safeData.predictions)) return safeData.predictions;

    return Object.entries(safeData.predictions).map(([label, score]) => ({
      label,
      score: Number(score)
    }));
  }, [safeData.predictions]);

  const negativeEmotions = ["sadness", "fear", "anger", "disgust"];

  const stressScore = useMemo(() => {
    // Use backend-calculated stress if available, otherwise calculate locally
    if (typeof safeData.stress === 'number' && safeData.stress >= 0) {
      return safeData.stress;
    }
    
    // Fallback to local calculation
    if (!formattedPredictions.length) return 0;

    let sum = 0;
    for (const emo of formattedPredictions) {
      const label = emo.label.toLowerCase();
      if (negativeEmotions.includes(label)) {
        sum += emo.score;
      }
    }

    // Convert to 0–1 range for StressGauge
    return Math.min(1, Math.max(0, sum));
  }, [formattedPredictions, safeData.stress]);

  const getTextStress = useMemo(() => {
    if (!safeData.sources.text?.predictions) return 0;
    
    let sum = 0;
    const negativeEmotions = ["sadness", "fear", "anger", "disgust"];
    
    for (const pred of safeData.sources.text.predictions) {
      const label = pred.label.toLowerCase();
      if (negativeEmotions.includes(label)) {
        sum += pred.score;
      }
    }
    
    return Math.min(1, Math.max(0, sum));
  }, [safeData.sources.text?.predictions]);
  
  const getFaceStress = useMemo(() => {
    if (!safeData.sources.face?.predictions) return 0;
    
    let sum = 0;
    const negativeEmotions = ["sadness", "fear", "anger", "disgust"];
    
    for (const pred of safeData.sources.face.predictions) {
      const label = pred.label.toLowerCase();
      if (negativeEmotions.includes(label)) {
        sum += pred.score;
      }
    }
    
    return Math.min(1, Math.max(0, sum));
  }, [safeData.sources.face?.predictions]);
  
  const getAudioStress = useMemo(() => {
    if (!safeData.sources.audio?.predictions) return 0;
    
    let sum = 0;
    const negativeEmotions = ["sadness", "fear", "anger", "disgust"];
    
    for (const pred of safeData.sources.audio.predictions) {
      const label = pred.label.toLowerCase();
      if (negativeEmotions.includes(label)) {
        sum += pred.score;
      }
    }
    
    return Math.min(1, Math.max(0, sum));
  }, [safeData.sources.audio?.predictions]);

  const [mentalHealthTips, setMentalHealthTips] = useState<MentalHealthTipsResponse | null>(null);
  const [loadingTips, setLoadingTips] = useState(true);

  const stressLevel = useMemo(() => {
    const score = stressScore;
    if (score < 0.3) return { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: TrendingDown };
    if (score < 0.6) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: Activity };
    return { label: 'High', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', icon: TrendingUp };
  }, [stressScore]);

  const StressIcon = stressLevel.icon;

  // Generate detailed mental health tips using OpenAI service
  useEffect(() => {
    const fetchTips = async () => {
      setLoadingTips(true);
      try {
        const tipsResponse = await generateMentalHealthTips({
          stressScore: stressScore,
          primaryEmotion: safeData.combined_emotion,
          emotionBreakdown: safeData.predictions,
          hasTextAnalysis: safeData.weights.text > 0,
          hasFaceAnalysis: safeData.weights.face > 0,
          textStress: getTextStress,
          faceStress: getFaceStress,
        });
        setMentalHealthTips(tipsResponse);
      } catch (error) {
        console.error('Error generating mental health tips:', error);
      } finally {
        setLoadingTips(false);
      }
    };

    fetchTips();
  }, [safeData, stressScore]);

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
          {safeData.combined_emotion}
        </h3>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full">
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <span className="text-slate-300 text-sm">
            {(safeData.confidence * 100).toFixed(0)}% confidence
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
            <StressGauge value={stressScore} />
            
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
          
          <EmotionChart emotions={formattedPredictions} />
        </motion.div>
      </div>

      {/* Analysis Breakdown - Show if at least one modality exists */}
      {(safeData.weights.text > 0 || safeData.weights.face > 0 || safeData.weights.audio > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="text-white mb-4">Analysis Sources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {safeData.weights.text > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Text Analysis</span>
                  <span className="text-slate-300">{(safeData.weights.text * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getTextStress * 100}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full bg-blue-500/80"
                  />
                </div>
              </div>
            )}

            {safeData.weights.face > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Facial Analysis</span>
                  <span className="text-slate-300">{(safeData.weights.face * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getFaceStress * 100}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full bg-purple-500/80"
                  />
                </div>
              </div>
            )}

            {safeData.weights.audio > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Audio Analysis</span>
                  <span className="text-slate-300">{(safeData.weights.audio * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getAudioStress * 100}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full bg-green-500/80"
                  />
                </div>
              </div>
            )}
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

      {/* AI Insights */}
      {safeData.llm_summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-slate-400" />
            <h3 className="text-white">AI Insights</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap">{safeData.llm_summary}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}