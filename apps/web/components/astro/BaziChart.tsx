import React from 'react';
import type { BaziPillars } from '@/types';
import { ElementIndicator } from './ElementIndicator';

interface BaziChartProps {
  bazi: BaziPillars;
}

export function BaziChart({ bazi }: BaziChartProps) {
  const pillars = [
    { label: 'Hour', pillar: bazi.hour },
    { label: 'Day', pillar: bazi.day },
    { label: 'Month', pillar: bazi.month },
    { label: 'Year', pillar: bazi.year },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-cosmic-violet/30">
            <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-silver/70">Pillar</th>
            {pillars.map(({ label }) => (
              <th key={label} className="px-4 py-3 text-center text-sm font-semibold text-cosmic-gold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-cosmic-violet/20">
            <td className="px-4 py-3 text-sm font-medium text-cosmic-silver/70">Heavenly Stem</td>
            {pillars.map(({ label, pillar }) => (
              <td key={`stem-${label}`} className="px-4 py-3 text-center">
                <div className="text-lg font-bold text-cosmic-white">{pillar.heavenlyStem}</div>
              </td>
            ))}
          </tr>
          <tr className="border-b border-cosmic-violet/20">
            <td className="px-4 py-3 text-sm font-medium text-cosmic-silver/70">Earthly Branch</td>
            {pillars.map(({ label, pillar }) => (
              <td key={`branch-${label}`} className="px-4 py-3 text-center">
                <div className="text-lg font-bold text-cosmic-white">{pillar.earthlyBranch}</div>
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm font-medium text-cosmic-silver/70">Element</td>
            {pillars.map(({ label, pillar }) => (
              <td key={`element-${label}`} className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  <ElementIndicator element={pillar.element} size="sm" />
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BaziChart;
