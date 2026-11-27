'use client';

import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import AgoraVideoSession from './AgoraVideoSession';
import { sessionService } from '../services/apiService.jsx';
import { useAuth } from '../context/AuthContext';

const LiveSession = ({ sessionId, onLeave }) => {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await sessionService.getSessionById(sessionId);
        if (cancelled) return;
        const sessionData = response?.session || response;
        if (!sessionData) {
          setError('Session not found');
        } else {
          setSession(sessionData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            (typeof err === 'string' ? err : err?.error || err?.message) ||
              'Failed to load session'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Joining Live Session</h2>
          <p className="text-gray-300 text-sm">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-300 mb-6 text-sm">{error || 'Session not found'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => onLeave?.()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const channelName =
    session.channelName || session.channel_name || session.ChannelName || `session_${sessionId}`;
  const teacherName =
    session.teacher?.name ||
    session.Teacher?.Name ||
    session.teacher_name ||
    session.TeacherName ||
    '';
  const teacherId = session.teacher_id || session.TeacherID || session.teacher?.id;

  return (
    <AgoraVideoSession
      sessionId={sessionId}
      channelName={channelName}
      userRole="audience"
      teacherName={teacherName}
      teacherId={teacherId}
      onLeave={onLeave}
      sessionTitle={session.title || session.Title}
      studentId={user?.id || user?.ID}
      studentName={user?.name || user?.Name}
      studentEmail={user?.email || user?.Email}
    />
  );
};

export default LiveSession;
