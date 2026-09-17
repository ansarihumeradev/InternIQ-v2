import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReviewService, CompanyReview } from '../services/reviewService';
import { useNotifications } from './NotificationSystem';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  companyName: string;
  onSuccess: (newReview: CompanyReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor - Not Recommended',
  2: 'Fair - Below Expectations',
  3: 'Good - Decent Experience',
  4: 'Very Good - Recommended',
  5: 'Excellent - Outstanding Workplace'
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  listingId,
  companyName,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { addNotification } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      addNotification({
        type: 'warning',
        title: 'Rating Required',
        message: 'Please select a star rating between 1 and 5.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await ReviewService.submitReview({
        listingId,
        companyName,
        rating,
        reviewText: reviewText.trim()
      });

      addNotification({
        type: 'success',
        title: 'Review Published!',
        message: `Thank you for sharing your authentic feedback for ${companyName}.`
      });

      onSuccess(created);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review.';
      addNotification({
        type: 'error',
        title: 'Submission Error',
        message: msg
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeDisplayRating = hoverRating || rating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Write a Student Review</h3>
                <p className="text-xs text-indigo-200">{companyName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
            {/* Applicant Badge Notice */}
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center space-x-2 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Verified Applicant Review (only students who applied can post).</span>
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-2 text-center py-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Overall Rating
              </label>

              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 transition-transform transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= activeDisplayRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold text-indigo-600 h-4">
                {RATING_LABELS[activeDisplayRating] || ''}
              </p>
            </div>

            {/* Review Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Your Feedback & Work Experience (Optional)
              </label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your interview experience, work culture, stipend timeliness, mentorship quality..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition-all flex items-center space-x-1.5"
              >
                {submitting ? 'Publishing...' : 'Publish Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
