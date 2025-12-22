'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  name?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export default function BarChart({
  data,
  dataKey,
  xAxisKey,
  name = '',
  color = '#8B5CF6',
  height = 300,
  showGrid = true,
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}

        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
          </>
        )}

        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6',
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
          }}
        />
        <Bar
          dataKey={dataKey}
          fill={color}
          name={name}
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
