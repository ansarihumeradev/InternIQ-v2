import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X, Lock, CheckCircle2 } from 'lucide-react';
import { ReviewService, ScamReport } from '../services/reviewService';
import { useNotifications } from './NotificationSystem';

interface ScamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  companyName: string;
  onSuccess: () => void;
}

const REASONS = [
  'Asked for money',
  'No response after selection',
  'Fake/misleading listing',
  'Other'
] as const;

export const ScamReportModal: React.FC<ScamReportModalProps> = ({
  isOpen,
  onClose,
  listingId,
  companyName,
  onSuccess
}) => {
  const [reason, setReason] = useState<typeof REASONS[number]>('Asked for money');
  const [details, setDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { addNotification } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await ReviewService.submitScamReport({
        listingId,
        companyName,
        reason,
        details: details.trim()
      });

      setSubmitted(true);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report.';
      addNotification({
        type: 'error',
        title: 'Report Error',
        message: msg
      });
      setSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setSubmitted(false);
    setDetails('');
    setReason('Asked for money');
    onClose();
  };

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
          <div className="p-6 bg-rose-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Report Listing Issue</h3>
                <p className="text-xs text-rose-200">{companyName}</p>
              </div>
            </div>
            <button
              onClick={handleCloseAll}
              className="p-1.5 text-rose-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!submitted ? (
            /* Form Screen */
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* Privacy Notice */}
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-rose-900">
                <Lock className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Private Trust & Safety Report</p>
                  <p className="text-[11px] text-rose-700 leading-normal">
                    Reports are confidential and reviewed privately by our security team. The recruiter will not be notified of your individual identity.
                  </p>
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Select Reason for Reporting <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Additional Details & Evidence (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what happened (e.g. asked for upfront payment, false promises, non-responsive after selection...)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Screen */
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-slate-900">Report Submitted Privately</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you for keeping the InternIQ community safe. Our Trust & Safety team will review this report against recruiter activity logs.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleCloseAll}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 shadow-md"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScamReportModal;
