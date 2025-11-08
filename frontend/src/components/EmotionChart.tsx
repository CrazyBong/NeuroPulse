import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface EmotionChartProps {
  emotions: {
    label: string;
    score: number;
  }[];
}

const EMOTION_COLORS: Record<string, string> = {
  joy: '#FFD93D',
  happiness: '#FFD93D',
  happy: '#FFD93D',
  sadness: '#6A67CE',
  sad: '#6A67CE',
  anger: '#FF6B6B',
  angry: '#FF6B6B',
  fear: '#4D96FF',
  afraid: '#4D96FF',
  surprise: '#00C49F',
  surprised: '#00C49F',
  neutral: '#BFBFBF',
  disgust: '#8E44AD',
  disgusted: '#8E44AD'
};

const EMOTION_EMOJI: Record<string, string> = {
  joy: '😊',
  happiness: '😊',
  happy: '😊',
  sadness: '😢',
  sad: '😢',
  anger: '😠',
  angry: '😠',
  fear: '😨',
  afraid: '😨',
  surprise: '😲',
  surprised: '😲',
  neutral: '😐',
  disgust: '🤢',
  disgusted: '🤢'
};

export function EmotionChart({ emotions }: EmotionChartProps) {
  const data = useMemo(() => {
    // Filter out very low confidence emotions and sort by confidence
    const filteredEmotions = emotions
      .filter(e => e.score > 0.01) // Filter out emotions with less than 1% confidence
      .sort((a, b) => b.score - a.score); // Sort by confidence descending
    
    return filteredEmotions.map(e => ({
      name: e.label.charAt(0).toUpperCase() + e.label.slice(1),
      value: e.score * 100,
      label: e.label,
      emoji: EMOTION_EMOJI[e.label.toLowerCase()] || '😐'
    }));
  }, [emotions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{payload[0].payload.emoji}</span>
            <p className="text-white font-medium">
              {payload[0].name}
            </p>
          </div>
          <p className="text-slate-300">
            Confidence: {payload[0].value.toFixed(1)}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <motion.div
            key={`legend-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300 text-sm">
              {entry.payload.emoji} {entry.value}
            </span>
            <span className="text-slate-500 text-xs">
              ({entry.payload.value.toFixed(1)}%)
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full h-full"
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-500">
          No emotion data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              paddingAngle={2}
              stroke="#1e293b"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={EMOTION_COLORS[entry.label.toLowerCase()] || '#999999'} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
