'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import StarRating from './StarRating';
import confetti from 'canvas-confetti';
import { apiClient } from '@/lib/api';

interface FeedbackModalProps {
  predictionId: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function FeedbackModal({
  predictionId,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [cameTrue, setCameTrue] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setSubmitting(true);

    try {
      await apiClient.submitFeedback({
        predictionId,
        rating,
        wasHelpful: wasHelpful ?? undefined,
        cameTrue,
        comment: comment.trim() || undefined,
      });

      // Show confetti for 5-star ratings
      if (rating === 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#F59E0B', '#06B6D4'],
        });
      }

      setSubmitted(true);

      // Store in localStorage to prevent re-showing
      const feedbackGiven = JSON.parse(
        localStorage.getItem('feedbackGiven') || '{}'
      );
      feedbackGiven[predictionId] = true;
      localStorage.setItem('feedbackGiven', JSON.stringify(feedbackGiven));

      // Close after 2 seconds
      setTimeout(() => {
        onSubmit?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
          <p className="text-gray-400">Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Rate This Prediction</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Overall Rating *
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                onChange={setRating}
                size="large"
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-400 mt-2">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Very Good'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Was Helpful */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Was this helpful?
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setWasHelpful(true)}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium transition-all
                  ${
                    wasHelpful === true
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                Yes
              </button>
              <button
                onClick={() => setWasHelpful(false)}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium transition-all
                  ${
                    wasHelpful === false
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                No
              </button>
            </div>
          </div>

          {/* Came True */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Did this prediction come true?
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setCameTrue(true)}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
                  ${
                    cameTrue === true
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                Yes
              </button>
              <button
                onClick={() => setCameTrue(false)}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
                  ${
                    cameTrue === false
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                No
              </button>
              <button
                onClick={() => setCameTrue(null)}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
                  ${
                    cameTrue === null
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                Too Early
              </button>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
