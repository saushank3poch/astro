'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
  showPercentage?: boolean;
}

const DEFAULT_COLORS = [
  '#8B5CF6', // purple
  '#F59E0B', // gold
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#10B981', // green
  '#EF4444', // red
  '#6366F1', // indigo
  '#F97316', // orange
];

export default function PieChart({
  data,
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
  height = 300,
  showPercentage = true,
}: PieChartProps) {
  const renderLabel = (entry: any) => {
    if (!showPercentage) return '';
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    const percentage = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6',
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
          }}
          iconType="circle"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
