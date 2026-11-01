'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useProfileStatus = () => {
  const { user, updateProfile: authUpdateProfile } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Define required fields for profile completion
    const requiredFields = ['name', 'phoneNumber', 'address'];

    const calculateProfileStatus = (userData) => {
      if (!userData) return null;

      const missingFields = [];
      let completedFields = 0;

      requiredFields.forEach(field => {
        const value = userData[field];
        if (!value || value.trim() === '') {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      });

      const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

      return {
        profile: userData,
        missingFields,
        completionPercentage,
        isComplete: completionPercentage === 100
      };
    };

    if (user) {
      const status = calculateProfileStatus(user);
      setProfileStatus(status);
      setShowModal(status && !status.isComplete);
    } else {
      setProfileStatus(null);
      setShowModal(false);
    }
  }, [user]);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      await authUpdateProfile(profileData);
      // Force close modal after successful update
      setShowModal(false);
      // The user state will be updated by AuthContext, which will trigger the useEffect above
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    profileStatus,
    loading,
    error,
    showModal,
    updateProfile,
    closeModal,
  };
};
