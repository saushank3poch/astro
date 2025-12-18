import React from 'react';
import type { ElementDistribution } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ElementsChartProps {
  elements: ElementDistribution;
}

const ELEMENT_COLORS = {
  fire: '#f59e0b',
  earth: '#a16207',
  air: '#06b6d4',
  water: '#3b82f6',
};

export function ElementsChart({ elements }: ElementsChartProps) {
  const data = [
    { name: 'Fire', value: elements.fire, color: ELEMENT_COLORS.fire },
    { name: 'Earth', value: elements.earth, color: ELEMENT_COLORS.earth },
    { name: 'Air', value: elements.air, color: ELEMENT_COLORS.air },
    { name: 'Water', value: elements.water, color: ELEMENT_COLORS.water },
  ].filter(item => item.value > 0);

  const total = elements.fire + elements.earth + elements.air + elements.water;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) => value ? [`${value} planets`, 'Count'] : ['', '']}
            contentStyle={{
              backgroundColor: 'rgba(26, 11, 46, 0.9)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ElementsChart;
