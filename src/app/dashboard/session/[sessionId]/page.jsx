'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AgoraVideoSession from '@/components/AgoraVideoSession';
import { sessionService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

export default function StudentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        const response = await sessionService.getSessionById(sessionId);

        
        // Handle wrapped response
        const sessionData = response.session || response;

        
        setSession(sessionData);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err.error || err.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const handleLeaveSession = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const channelName = session.channelName || session.channel_name || session.ChannelName;


  return (
    <AgoraVideoSession 
      sessionId={sessionId}
      channelName={channelName}
      userRole="audience"
      onLeave={handleLeaveSession}
      sessionTitle={session.title || session.Title}
      studentId={user?.id || user?.ID}
      studentName={user?.name || user?.Name}
      studentEmail={user?.email || user?.Email}
    />
  );
}
