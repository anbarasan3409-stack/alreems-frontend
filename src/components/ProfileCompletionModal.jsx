'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin } from 'lucide-react';

const ProfileCompletionModal = ({
  isOpen,
  onClose,
  onComplete,
  profileData,
  missingFields,
  completionPercentage
}) => {
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    phone_number: profileData?.phone_number || '',
    address: profileData?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    // Handle phone number validation
    if (field === 'phone_number') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        [field]: limitedValue
      }));
      
      // Validate phone number length
      if (limitedValue.length > 0 && limitedValue.length < 10) {
        setPhoneError('Phone number must be 10 digits');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPhoneError('');

    // Validate phone number if present in missing fields
    if (missingFields.includes('phone_number')) {
      if (!formData.phone_number) {
        setPhoneError('Phone number is required');
        setLoading(false);
        return;
      }
      if (formData.phone_number.length !== 10) {
        setPhoneError('Phone number must be exactly 10 digits');
        setLoading(false);
        return;
      }
    }

    try {
      await onComplete(formData);
      // Small delay to ensure backend processes the update
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'name':
        return <User size={20} />;
      case 'phone_number':
        return <Phone size={20} />;
      case 'address':
        return <MapPin size={20} />;
      default:
        return <User size={20} />;
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'name':
        return 'Full Name';
      case 'phone_number':
        return 'Phone Number';
      case 'address':
        return 'Address';
      default:
        return field;
    }
  };

  const getFieldPlaceholder = (field) => {
    switch (field) {
      case 'name':
        return 'Enter your full name';
      case 'phone_number':
        return 'Enter your phone number';
      case 'address':
        return 'Enter your address';
      default:
        return `Enter ${field}`;
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {missingFields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getFieldLabel(field)} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
                    {getFieldIcon(field)}
                  </span>
                </div>
                <input
                  type={field === 'phone_number' ? 'tel' : 'text'}
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={getFieldPlaceholder(field)}
                  className={`block text-black w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    field === 'phone_number' && phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  maxLength={field === 'phone_number' ? 10 : undefined}
                  pattern={field === 'phone_number' ? '[0-9]{10}' : undefined}
                />
              </div>
              {field === 'phone_number' && phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>
          ))}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
