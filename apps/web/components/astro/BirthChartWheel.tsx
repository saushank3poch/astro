import React from 'react';
import type { WesternBirthChart } from '@/types';

interface BirthChartWheelProps {
  chart: WesternBirthChart;
}

// Simple circular birth chart representation
export function BirthChartWheel({ chart }: BirthChartWheelProps) {
  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  const zodiacSymbols: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
  };

  const planetSymbols = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
    jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇'
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Outer circle - Zodiac signs */}
      <div className="absolute inset-0 rounded-full border-4 border-cosmic-violet/30">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Draw zodiac wheel */}
          <circle cx="200" cy="200" r="195" fill="none" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="2" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(124, 58, 237, 0.3)" strokeWidth="1" />
          <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(124, 58, 237, 0.3)" strokeWidth="1" />

          {/* Draw zodiac sign divisions */}
          {zodiacSigns.map((sign, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x1 = 200 + 120 * Math.cos(angle);
            const y1 = 200 + 120 * Math.sin(angle);
            const x2 = 200 + 195 * Math.cos(angle);
            const y2 = 200 + 195 * Math.sin(angle);

            const textAngle = (index * 30 - 75) * (Math.PI / 180);
            const textX = 200 + 177 * Math.cos(textAngle);
            const textY = 200 + 177 * Math.sin(textAngle);

            return (
              <g key={sign}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(124, 58, 237, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#cbd5e1"
                  fontSize="20"
                  className="font-bold"
                >
                  {zodiacSymbols[sign]}
                </text>
              </g>
            );
          })}

          {/* Draw planets */}
          {chart.planets.map((planet) => {
            const signIndex = zodiacSigns.indexOf(planet.sign);
            const totalDegree = signIndex * 30 + planet.degree;
            const angle = (totalDegree - 90) * (Math.PI / 180);
            const radius = 140;
            const x = 200 + radius * Math.cos(angle);
            const y = 200 + radius * Math.sin(angle);

            return (
              <g key={planet.planet}>
                <circle cx={x} cy={y} r="12" fill="rgba(124, 58, 237, 0.8)" />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="14"
                  className="font-bold"
                >
                  {planetSymbols[planet.planet]}
                </text>
              </g>
            );
          })}

          {/* Center point */}
          <circle cx="200" cy="200" r="3" fill="#7c3aed" />
        </svg>
      </div>

      {/* Center info */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-cosmic-violet mb-1">
            {zodiacSymbols[chart.sunSign]}
          </div>
          <div className="text-xs text-cosmic-silver/70">Sun Sign</div>
        </div>
      </div>
    </div>
  );
}

export default BirthChartWheel;
