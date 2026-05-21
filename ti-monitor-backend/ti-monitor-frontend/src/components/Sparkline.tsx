import React from 'react';

interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  height = 20,
  width = 100,
  color = '#10b981',
}) => {
  if (!data || data.length < 2) {
    return <span className="text-xs text-slate-500">-</span>;
  }

  const min = Math.min(...data.filter(v => v !== 9999));
  const max = Math.max(...data.filter(v => v !== 9999));
  const range = max - min || 1;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding;
    const normalized = value === 9999 ? max : (value - min) / range;
    const y = chartHeight - normalized * chartHeight + padding;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="1.5" fill={color} />
    </svg>
  );
};
