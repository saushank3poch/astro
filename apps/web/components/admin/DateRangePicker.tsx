'use client';

import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRangePreset } from '@/types/admin';

interface DateRangePickerProps {
  onRangeChange: (startDate: string, endDate: string, preset: DateRangePreset) => void;
  className?: string;
}

export default function DateRangePicker({
  onRangeChange,
  className = '',
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const presets = [
    { value: 'today' as DateRangePreset, label: 'Today' },
    { value: 'last7days' as DateRangePreset, label: 'Last 7 Days' },
    { value: 'last30days' as DateRangePreset, label: 'Last 30 Days' },
    { value: 'custom' as DateRangePreset, label: 'Custom Range' },
  ];

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    setShowCustom(preset === 'custom');

    if (preset !== 'custom') {
      const end = endOfDay(new Date());
      let start;

      switch (preset) {
        case 'today':
          start = startOfDay(new Date());
          break;
        case 'last7days':
          start = startOfDay(subDays(new Date(), 7));
          break;
        case 'last30days':
          start = startOfDay(subDays(new Date(), 30));
          break;
        default:
          start = startOfDay(subDays(new Date(), 7));
      }

      onRangeChange(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd'),
        preset
      );
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onRangeChange(customStart, customEnd, 'custom');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                selectedPreset === preset.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
