import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Settings, 
  Loader,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MessageCircle
} from 'lucide-react';
import { useStudentProfile } from '../hooks/useStudentAPI.js';
import { sessionService } from '../services/apiService.jsx';

const LiveSession = ({ sessionId, onLeave }) => {
  const { profile } = useStudentProfile();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  // Audio/Video controls
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Start muted for students
  const [isVideoEnabled, setIsVideoEnabled] = useState(false); // Start with video off for students
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  
  // Agora client and tracks
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  
  // Refs for video containers
  const localVideoRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);

  // Initialize Agora and join session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');

        // Get session data and token
        const response = await sessionService.joinLiveSession(sessionId, profile?.id || profile?.ID);
        setSessionData(response);

        // Initialize Agora client (mock for now since we don't have agora-rtc-sdk)
        await initializeAgoraClient(response);
        
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setError(err.message || 'Failed to join session');
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && profile) {
      initializeSession();
    }

    // Cleanup on unmount
    return () => {
      leaveSession();
    };
  }, [sessionId, profile]);

  const initializeAgoraClient = async (sessionData) => {
    try {
      // Import Agora RTC SDK
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // Set up event listeners
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        
        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          const remotePlayerContainer = document.createElement('div');
          remotePlayerContainer.id = `remote-player-${user.uid}`;
          remotePlayerContainer.style.width = '100%';
          remotePlayerContainer.style.height = '100%';
          
          if (remoteVideoContainerRef.current) {
            remoteVideoContainerRef.current.appendChild(remotePlayerContainer);
            remoteVideoTrack.play(remotePlayerContainer);
          }
        }
        
        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack.play();
        }
        
        // Update remote users state
        setRemoteUsers(prev => {
          const existingUser = prev.find(u => u.uid === user.uid);
          if (existingUser) {
            return prev.map(u => 
              u.uid === user.uid 
                ? { ...u, [mediaType + 'Track']: user[mediaType + 'Track'] }
                : u
            );
          } else {
            return [...prev, { 
              uid: user.uid, 
              [mediaType + 'Track']: user[mediaType + 'Track'] 
            }];
          }
        });
      });

      client.on('user-unpublished', (user, mediaType) => {

        if (mediaType === 'video') {
          const playerContainer = document.getElementById(`remote-player-${user.uid}`);
          if (playerContainer) {
            playerContainer.remove();
          }
        }
      });

      client.on('user-left', (user) => {

        const playerContainer = document.getElementById(`remote-player-${user.uid}`);
        if (playerContainer) {
          playerContainer.remove();
        }
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      // Join the channel
      await client.join(
        sessionData.appId,
        sessionData.channelName,
        sessionData.token,
        parseInt(sessionData.uid)
      );

      setAgoraClient(client);
      return client;
    } catch (error) {
      console.error('Agora initialization failed:', error);
      throw error;
    }
  };

  const toggleAudio = async () => {
    try {
      if (isAudioEnabled) {
        // Disable audio
        if (localAudioTrack) {
          await localAudioTrack.setEnabled(false);
          await agoraClient.unpublish([localAudioTrack]);
        }
        setIsAudioEnabled(false);
      } else {
        // Enable audio
        if (!localAudioTrack) {
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          setLocalAudioTrack(audioTrack);
          await agoraClient.publish([audioTrack]);
        } else {
          await localAudioTrack.setEnabled(true);
          await agoraClient.publish([localAudioTrack]);
        }
        setIsAudioEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoEnabled) {
        // Disable video
        if (localVideoTrack) {
          await localVideoTrack.setEnabled(false);
          await agoraClient.unpublish([localVideoTrack]);
          localVideoTrack.stop();
        }
        setIsVideoEnabled(false);
      } else {
        // Enable video
        if (!localVideoTrack) {
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          setLocalVideoTrack(videoTrack);
          
          // Play local video
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
          
          await agoraClient.publish([videoTrack]);
        } else {
          await localVideoTrack.setEnabled(true);
          if (localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }
          await agoraClient.publish([localVideoTrack]);
        }
        setIsVideoEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const leaveSession = async () => {
    try {
      // Unpublish and close local tracks
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }

      // Leave the channel
      if (agoraClient) {
        await agoraClient.leave();
        setAgoraClient(null);
      }

      // Clear remote users
      setRemoteUsers([]);
      
      // Clean up DOM elements
      if (remoteVideoContainerRef.current) {
        remoteVideoContainerRef.current.innerHTML = '';
      }
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    if (onLeave) {
      onLeave();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const adjustVolume = (newVolume) => {
    setVolume(newVolume);
    // Apply volume to remote audio tracks
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(newVolume);
      }
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    adjustVolume(isMuted ? volume : 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="mb-6">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Joining Live Session</h2>
            <p className="text-gray-300">
              {connectionStatus === 'connecting' && 'Connecting to session...'}
              {connectionStatus === 'connected' && 'Connected! Loading video...'}
            </p>
          </div>
          <div className="w-64 mx-auto">
            <div className="bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: connectionStatus === 'connecting' ? '60%' : '100%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleLeaveSession}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? '' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 text-white p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">{sessionData?.session?.title || 'Live Session'}</h1>
            <p className="text-sm text-gray-400">{sessionData?.session?.teacher_name || 'Teacher'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-lg">
            <Users className="w-4 h-4" />
            <span className="text-sm">{remoteUsers.length + 1}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video Container */}
        <div ref={remoteVideoContainerRef} className="w-full h-full">
          {remoteUsers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full p-2">
              {remoteUsers.map((user, index) => (
                <div key={user.uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-sm">Remote User {index + 1}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
                    Teacher
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Waiting for teacher...</h3>
                <p className="text-gray-400">The session will start when the teacher joins</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {isVideoEnabled && (
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <div ref={localVideoRef} className="w-full h-full">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs">You</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 px-1 py-0.5 rounded text-white text-xs">
              You
            </div>
          </div>
        )}

        {/* Volume Control */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} className="text-white hover:text-blue-400">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => adjustVolume(parseInt(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-all duration-200 ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all duration-200 ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Leave Session */}
          <button
            onClick={handleLeaveSession}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200">
            <Settings className="w-5 h-5" />
          </button>

          {/* Chat */}
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Session Info */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>Session ID: {sessionId} | Status: {connectionStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;