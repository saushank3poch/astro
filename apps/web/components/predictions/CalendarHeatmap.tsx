'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DayScore {
  date: string;
  score: number;
}

interface CalendarHeatmapProps {
  data: DayScore[];
  startDate?: Date;
  endDate?: Date;
}

export function CalendarHeatmap({ data, startDate, endDate }: CalendarHeatmapProps) {
  const getColorForScore = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    if (score >= 2) return 'bg-red-500';
    return 'bg-cosmic-deep';
  };

  const getIntensity = (score: number) => {
    const intensity = Math.floor((score / 10) * 100);
    return `opacity-${Math.max(20, intensity)}`;
  };

  // Group data by week
  const weeks: DayScore[][] = [];
  let currentWeek: DayScore[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Week labels */}
        <div className="flex gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="w-8 h-8 flex items-center justify-center text-xs text-cosmic-silver/60"
            >
              {day.charAt(0)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                className="group relative"
              >
                <div
                  className={`w-8 h-8 rounded ${getColorForScore(
                    day.score
                  )} transition-all cursor-pointer hover:ring-2 hover:ring-cosmic-violet`}
                  title={`${day.date}: ${day.score.toFixed(1)}/10`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-cosmic-deep border border-cosmic-violet rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="text-cosmic-silver/70">Score: {day.score.toFixed(1)}/10</div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-cosmic-silver/60">
          <span>Less favorable</span>
          <div className="flex gap-1">
            {[2, 4, 6, 8, 10].map((score) => (
              <div
                key={score}
                className={`w-4 h-4 rounded ${getColorForScore(score)}`}
              />
            ))}
          </div>
          <span>More favorable</span>
        </div>
      </div>
    </div>
  );
}
