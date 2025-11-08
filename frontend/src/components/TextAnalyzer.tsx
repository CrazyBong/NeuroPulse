import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Sparkles, AlertCircle } from 'lucide-react';
import { analyzeText } from '../services/api';
import type { TextEmotionResponse } from '../services/api';

interface TextAnalyzerProps {
  onAnalysisComplete: (result: TextEmotionResponse) => void;
}

export function TextAnalyzer({ onAnalysisComplete }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shapData, setShapData] = useState<{ token: string; importance: number }[]>([]);
  const [showShap, setShowShap] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeText(text);

      // ✅ SAFETY: If backend does NOT send shap data, default to empty array
      const shap = Array.isArray(result.shap_explanation)
        ? result.shap_explanation
        : [];

      setShapData(shap);
      setShowShap(shap.length > 0); // ✅ Only show if actual data exists
      onAnalysisComplete(result);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, onAnalysisComplete]);

  const getTokenColor = useCallback((importance: number) => {
    const absImportance = Math.abs(importance);
    const opacity = Math.min(absImportance * 0.8 + 0.2, 1);
    
    if (importance > 0) {
      return `rgba(239, 68, 68, ${opacity})`;
    } else {
      return `rgba(16, 185, 129, ${opacity})`;
    }
  }, []);

  const renderHighlightedText = () => {
    if (!showShap || shapData.length === 0) {
      return text;
    }

    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.trim().toLowerCase().replace(/[.,!?;:]/g, '');
      const shapItem = shapData.find(s => s.token.toLowerCase() === cleanWord);
      
      if (shapItem && word.trim()) {
        return (
          <motion.span
            key={index}
            initial={{ backgroundColor: 'transparent' }}
            animate={{ backgroundColor: getTokenColor(shapItem.importance) }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="px-1 rounded cursor-pointer relative group"
            title={`Impact: ${(shapItem.importance * 100).toFixed(1)}%`}
          >
            {word}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none"
            >
              Impact: {(shapItem.importance * 100).toFixed(1)}%
            </motion.span>
          </motion.span>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </motion.div>
        <h3 className="text-white">Text Emotion Analysis</h3>
      </div>

      <div className="relative">
        {!showShap ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to analyze emotions and stress levels..."
            className="min-h-32 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            disabled={isAnalyzing}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-32 p-3 bg-slate-800/50 border border-slate-700 rounded-md text-white leading-relaxed"
          >
            {renderHighlightedText()}
          </motion.div>
        )}
        
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-md"
          >
            <div className="text-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-white">Analyzing emotions...</p>
            </div>
          </motion.div>
        )}
      </div>

      {showShap && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-300 mb-1">SHAP Explainability Active</p>
            <p className="text-blue-200">
              <span className="inline-block w-4 h-4 bg-red-500/50 rounded mr-1" />
              Red = increases stress
              <span className="inline-block w-4 h-4 bg-green-500/50 rounded ml-3 mr-1" />
              Green = decreases stress
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
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
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Text
            </>
          )}
        </Button>
        
        {showShap && (
          <Button
            onClick={() => {
              setShowShap(false);
              setText('');
              setShapData([]);
            }}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Clear
          </Button>
        )}
      </div>
    </motion.div>
  );
}
