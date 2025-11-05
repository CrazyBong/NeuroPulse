import { motion } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';

interface StressGaugeProps {
  value: number; // 0 to 1
  label?: string;
}

export function StressGauge({ value, label = 'Stress Level' }: StressGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = useMemo(() => displayValue * 100, [displayValue]);
  const rotation = useMemo(() => (displayValue * 180) - 90, [displayValue]);

  const color = useMemo(() => {
    if (displayValue < 0.3) return '#10b981';
    if (displayValue < 0.6) return '#f59e0b';
    return '#ef4444';
  }, [displayValue]);

  const gradient = useMemo(() => {
    if (displayValue < 0.3) return 'from-emerald-500 to-green-500';
    if (displayValue < 0.6) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  }, [displayValue]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          
          {/* Background track */}
          <motion.path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Animated progress arc */}
          <motion.path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ 
              strokeDashoffset: 251.2 - (251.2 * displayValue)
            }}
            transition={{ 
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          />
        </svg>

        {/* Animated needle */}
        <motion.div
          className="absolute left-1/2 bottom-0 origin-bottom"
          style={{ width: '4px', height: '70px' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </motion.div>

        {/* Center dot */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />

        {/* Value labels */}
        <div className="absolute left-2 bottom-0 text-xs text-slate-500">0%</div>
        <div className="absolute right-2 bottom-0 text-xs text-slate-500">100%</div>
      </div>

      {/* Percentage display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <div
          className={`text-4xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {percentage.toFixed(0)}%
        </div>
        <div className="text-slate-400 mt-1 text-sm">{label}</div>
      </motion.div>
    </div>
  );
}
