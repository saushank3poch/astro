'use client';

import React, { useState } from 'react';
import { ErrorLog, ErrorSeverity } from '@/types/admin';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ErrorCardProps {
  error: ErrorLog;
  onMarkResolved: (errorId: string) => void;
}

const severityColors: Record<ErrorSeverity, string> = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ErrorCard({ error, onMarkResolved }: ErrorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const errorDetails = `
Error ID: ${error.id}
Type: ${error.errorType}
Message: ${error.message}
Severity: ${error.severity}
Endpoint: ${error.endpoint || 'N/A'}
User ID: ${error.userId || 'N/A'}
Time: ${error.createdAt}
${error.stack ? `\nStack Trace:\n${error.stack}` : ''}
    `.trim();

    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${
                  severityColors[error.severity]
                }`}
              >
                {error.severity.toUpperCase()}
              </span>

              {error.resolved && (
                <span className="flex items-center space-x-1 text-green-400 text-xs">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Resolved</span>
                </span>
              )}

              <span className="text-xs text-gray-500">
                {format(new Date(error.createdAt), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>

            <h4 className="text-white font-medium mb-1">{error.errorType}</h4>
            <p className="text-gray-400 text-sm mb-2">{error.message}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {error.endpoint && (
                <span>
                  <span className="font-medium">Endpoint:</span> {error.endpoint}
                </span>
              )}
              {error.userId && (
                <span>
                  <span className="font-medium">User:</span> {error.userId.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Copy error details"
            >
              <ClipboardIcon className="w-5 h-5" />
            </button>

            {!error.resolved && (
              <button
                onClick={() => onMarkResolved(error.id)}
                className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
              >
                Mark Resolved
              </button>
            )}

            {error.stack && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {expanded ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {expanded && error.stack && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h5 className="text-sm font-medium text-gray-400 mb-2">Stack Trace:</h5>
            <pre className="bg-gray-950 p-3 rounded-lg text-xs text-gray-400 overflow-x-auto">
              {error.stack}
            </pre>
          </div>
        )}

        {copied && (
          <div className="mt-2 text-sm text-green-400">Copied to clipboard!</div>
        )}
      </div>
    </div>
  );
}
