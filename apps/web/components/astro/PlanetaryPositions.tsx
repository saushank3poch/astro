import React from 'react';
import type { PlanetaryPosition } from '@/types';
import { ZodiacSign } from './ZodiacSign';

interface PlanetaryPositionsProps {
  planets: PlanetaryPosition[];
}

const planetConfig = {
  sun: { name: 'Sun', emoji: '☉', color: 'text-cosmic-gold' },
  moon: { name: 'Moon', emoji: '☽', color: 'text-cosmic-silver' },
  mercury: { name: 'Mercury', emoji: '☿', color: 'text-cosmic-cyan' },
  venus: { name: 'Venus', emoji: '♀', color: 'text-pink-400' },
  mars: { name: 'Mars', emoji: '♂', color: 'text-red-400' },
  jupiter: { name: 'Jupiter', emoji: '♃', color: 'text-orange-400' },
  saturn: { name: 'Saturn', emoji: '♄', color: 'text-yellow-600' },
  uranus: { name: 'Uranus', emoji: '♅', color: 'text-blue-300' },
  neptune: { name: 'Neptune', emoji: '♆', color: 'text-blue-500' },
  pluto: { name: 'Pluto', emoji: '♇', color: 'text-purple-400' },
};

export function PlanetaryPositions({ planets }: PlanetaryPositionsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cosmic-violet/30">
            <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-silver/70">Planet</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-silver/70">Sign</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-silver/70">House</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-silver/70">Degree</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet) => {
            const config = planetConfig[planet.planet];
            return (
              <tr key={planet.planet} className="border-b border-cosmic-violet/10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${config.color}`}>{config.emoji}</span>
                    <span className="font-medium text-cosmic-white">{config.name}</span>
                    {planet.isRetrograde && (
                      <span className="text-xs text-cosmic-silver/60">(R)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ZodiacSign sign={planet.sign} size="sm" />
                </td>
                <td className="px-4 py-3 text-cosmic-white">{planet.house}</td>
                <td className="px-4 py-3 text-cosmic-white">{planet.degree.toFixed(2)}°</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PlanetaryPositions;
