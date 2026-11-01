import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { feedbackService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/theme/themeConstants';

const Feedback = () => {
  const { user } = useAuth();
  const [feedbackForm, setFeedbackForm] = useState({ 
    student_name: user?.name || '', 
    course: '', 
    rating: 5, 
    message: '' 
  });
  const [feedbackStatus, setFeedbackStatus] = useState({ loading: false, success: false, error: null });

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus({ loading: true, success: false, error: null });
    try {
      await feedbackService.submitFeedback({
        ...feedbackForm,
        student_name: user?.name || feedbackForm.student_name
      });
      setFeedbackStatus({ loading: false, success: true, error: null });
      setFeedbackForm(prev => ({ ...prev, course: '', rating: 5, message: '' }));
      setTimeout(() => setFeedbackStatus({ loading: false, success: false, error: null }), 5000);
    } catch (err) {
      setFeedbackStatus({ loading: false, success: false, error: err.error || 'Failed to submit feedback' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 mt-2">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Share Your Feedback
        </h2>
        <p className="text-gray-600">Your opinion helps us improve our educational experience.</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          {feedbackStatus.success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg mb-6 border border-emerald-200 text-sm sm:text-base font-medium">
              Thank you! Your feedback has been successfully submitted.
            </div>
          )}
          {feedbackStatus.error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6 border border-red-200 text-sm sm:text-base font-medium">
              {feedbackStatus.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                disabled
                value={user?.name || feedbackForm.student_name}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course (Optional)</label>
              <input
                type="text"
                value={feedbackForm.course}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 placeholder-gray-400 transition-shadow"
                placeholder="Which course did you take?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  className={`p-2 transition-transform hover:scale-110 ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star size={32} className={star <= feedbackForm.rating ? 'fill-yellow-400' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              required
              rows="5"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-900 placeholder-gray-400 transition-shadow"
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={feedbackStatus.loading}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
              style={{ backgroundColor: COLORS.secondary }}
            >
              {feedbackStatus.loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
