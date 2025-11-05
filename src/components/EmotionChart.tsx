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
  joy: '#10b981',
  happiness: '#10b981',
  sadness: '#3b82f6',
  anger: '#ef4444',
  fear: '#8b5cf6',
  surprise: '#f59e0b',
  neutral: '#64748b',
  disgust: '#84cc16'
};

const EMOTION_EMOJI: Record<string, string> = {
  joy: '😊',
  happiness: '😊',
  sadness: '😢',
  anger: '😠',
  fear: '😨',
  surprise: '😲',
  neutral: '😐',
  disgust: '🤢'
};

export function EmotionChart({ emotions }: EmotionChartProps) {
  const data = useMemo(() => emotions.map(e => ({
    name: e.label.charAt(0).toUpperCase() + e.label.slice(1),
    value: e.score * 100,
    emoji: EMOTION_EMOJI[e.label.toLowerCase()] || '😐'
  })), [emotions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl"
        >
          <p className="text-white">
            {payload[0].payload.emoji} {payload[0].name}
          </p>
          <p className="text-slate-300">
            {payload[0].value.toFixed(1)}%
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
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={EMOTION_COLORS[emotions[index].label.toLowerCase()] || '#64748b'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
