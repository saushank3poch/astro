'use client';

import React, { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal';

interface FeedbackPromptProps {
  predictionId: string;
  delay?: number; // Delay in milliseconds before showing feedback
}

export default function FeedbackPrompt({
  predictionId,
  delay = 10000, // 10 seconds default
}: FeedbackPromptProps) {
  const [showModal, setShowModal] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if feedback already given
    const feedbackGiven = JSON.parse(
      localStorage.getItem('feedbackGiven') || '{}'
    );

    if (feedbackGiven[predictionId]) {
      // Feedback already submitted for this prediction
      return;
    }

    // Wait for delay before showing
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [predictionId, delay]);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {!showModal && (
        <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-2xl max-w-sm">
            <h4 className="text-white font-bold mb-2">How was this prediction?</h4>
            <p className="text-white/90 text-sm mb-4">
              Your feedback helps us improve our accuracy
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Rate It
              </button>
              <button
                onClick={() => setShouldShow(false)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <FeedbackModal
          predictionId={predictionId}
          onClose={() => {
            setShowModal(false);
            setShouldShow(false);
          }}
          onSubmit={() => {
            setShowModal(false);
            setShouldShow(false);
          }}
        />
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
