'use client';

import React from 'react';
import { PredictionFeedback } from '@/types/admin';
import StarRating from './StarRating';
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface FeedbackCardProps {
  feedback: PredictionFeedback;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-400 text-sm font-medium">
                {feedback.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {feedback.username || 'Anonymous'}
              </p>
              <p className="text-gray-500 text-xs">
                {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <StarRating rating={feedback.rating} readonly size="small" />
        </div>

        <div className="flex items-center space-x-2">
          {feedback.wasHelpful !== null && (
            <span
              className={`
                px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1
                ${
                  feedback.wasHelpful
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-gray-800 text-gray-400'
                }
              `}
            >
              {feedback.wasHelpful ? (
                <>
                  <CheckCircleIcon className="w-3 h-3" />
                  <span>Helpful</span>
                </>
              ) : (
                <span>Not Helpful</span>
              )}
            </span>
          )}

          {feedback.cameTrue !== null && (
            <span
              className={`
                px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1
                ${
                  feedback.cameTrue === true
                    ? 'bg-green-500/10 text-green-400'
                    : feedback.cameTrue === false
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-gray-800 text-gray-400'
                }
              `}
            >
              {feedback.cameTrue === true ? (
                <>
                  <CheckCircleIcon className="w-3 h-3" />
                  <span>Came True</span>
                </>
              ) : feedback.cameTrue === false ? (
                <>
                  <XCircleIcon className="w-3 h-3" />
                  <span>Did Not</span>
                </>
              ) : (
                <>
                  <QuestionMarkCircleIcon className="w-3 h-3" />
                  <span>Too Early</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {feedback.comment && (
        <p className="text-gray-400 text-sm mt-3 pl-11">{feedback.comment}</p>
      )}

      <div className="flex items-center space-x-2 mt-3 pl-11">
        <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-md text-xs">
          {feedback.predictionType}
        </span>
      </div>
    </div>
  );
}
