import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Github, FileText, Sparkles, Award } from 'lucide-react';
import { SkillSuggestion } from '../services/skillGraphService';

interface SkillSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SkillSuggestion[];
  onAcceptSelected: (accepted: SkillSuggestion[]) => Promise<void>;
}

export const SkillSuggestionsModal: React.FC<SkillSuggestionsModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onAcceptSelected
}) => {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    suggestions.forEach(s => {
      initial[`${s.skillId}_${s.source}`] = true;
    });
    return initial;
  });

  const [proficiencyMap, setProficiencyMap] = useState<Record<string, 'beginner' | 'intermediate' | 'advanced'>>(() => {
    const initial: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {};
    suggestions.forEach(s => {
      initial[`${s.skillId}_${s.source}`] = s.proficiencyLevel;
    });
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (key: string) => {
    setSelectedMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProficiencyChange = (key: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setProficiencyMap(prev => ({ ...prev, [key]: level }));
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const accepted: SkillSuggestion[] = [];
      suggestions.forEach(s => {
        const key = `${s.skillId}_${s.source}`;
        if (selectedMap[key]) {
          accepted.push({
            ...s,
            proficiencyLevel: proficiencyMap[key] || s.proficiencyLevel
          });
        }
      });

      await onAcceptSelected(accepted);
      onClose();
    } catch (err) {
      console.error('Failed to accept skills:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-2xl w-full overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Auto-Detected Skill Suggestions</h3>
                <p className="text-sm text-emerald-50">
                  Review and select skills to add to your official Skill Graph profile.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-panel p-4 text-xs text-slate-700 flex items-start space-x-2">
              <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Student Consent Notice:</strong> We extracted these skills based on your connected GitHub repository activity or uploaded resume. Select which skills you want to accept into your profile. Unchecked items will NOT be added.
              </span>
            </div>

            {suggestions.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm">No new skills detected.</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const key = `${suggestion.skillId}_${suggestion.source}`;
                  const isChecked = !!selectedMap[key];
                  const currentProf = proficiencyMap[key] || suggestion.proficiencyLevel;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-panel border transition-all ${
                        isChecked ? 'bg-white border-teal-200 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(key)}
                            className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-slate-800">{suggestion.skillName}</span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-tag">
                                {suggestion.category}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-tag font-medium ${
                                suggestion.source === 'github' 
                                  ? 'bg-slate-100 text-slate-700' 
                                  : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {suggestion.source === 'github' ? (
                                  <><Github className="w-3 h-3 mr-1" /> GitHub (Weight 0.6)</>
                                ) : (
                                  <><FileText className="w-3 h-3 mr-1" /> Resume (Weight 0.25)</>
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{suggestion.evidence}</p>
                          </div>
                        </div>

                        {/* Proficiency Level Selector */}
                        {isChecked && (
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="text-slate-500 mr-1">Level:</span>
                            {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleProficiencyChange(key, lvl)}
                                className={`px-2 py-1 rounded-tag capitalize text-xs transition-colors ${
                                  currentProf === lvl
                                    ? 'bg-teal-500 text-white font-medium'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || suggestions.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium text-sm rounded-btn hover:shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Applying...' : 'Accept Selected Skills'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
