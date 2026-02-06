'use client';

import React, { useState, useTransition } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import MentionTextarea from '@/components/ui/MentionTextarea';

interface EditReviewModalProps {
  reviewId: string;
  currentText: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditReviewModal({
  reviewId,
  currentText,
  onClose,
  onSuccess,
}: EditReviewModalProps) {
  const [text, setText] = useState(currentText);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/reviews/actions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId,
            text: text.trim(),
          }),
        });

        const data = await res.json();

        if (! res.ok) {
          setError(data.error || 'Failed to update review');
          return;
        }

        onSuccess();
      } catch (err) {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Edit Review</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <MentionTextarea
              value={text}
              onChange={setText}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none min-h-[200px]"
            />

            <div className="flex items-center justify-between mt-2">
              <span className={`text-sm ${text.trim().length < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                {text.trim().length} characters {text.trim().length < 10 && '(minimum 10 required)'}
              </span>
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2. 5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || text.trim().length < 10}
                className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPending ?  (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}