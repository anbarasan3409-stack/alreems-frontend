import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Users, 
  Settings,
  Volume2,
  VolumeX,
  PenTool
} from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import dynamic from 'next/dynamic';

// Import Agora RTC SDK dynamically to avoid SSR issues
const AgoraRTC = dynamic(
  () => import('agora-rtc-sdk-ng').then(mod => mod.default),
  { ssr: false }
);

// Import Whiteboard wrapper dynamically
const WhiteboardWrapper = dynamic(
  () => import('./WhiteboardWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    )
  }
);

// Import token service
import { agoraTokenService } from '../services/agoraTokenService';

const AgoraVideoSession = ({ 
  sessionId, 
  channelName, 
  userRole = 'host', // Teachers are typically hosts
  onLeave,
  sessionTitle,
  studentId,
  studentName,
  studentEmail
}) => {
  // State management
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());

  // Whiteboard states
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardRoomUUID, setWhiteboardRoomUUID] = useState(null);
  const [remoteStroke, setRemoteStroke] = useState(null);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [initialStrokes, setInitialStrokes] = useState([]);
  
  // Refs
  const localVideoRef = useRef(null);
  const clientRef = useRef(null); // Use ref to avoid closure issues
  const strokesHistoryRef = useRef([]);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const [controlNotice, setControlNotice] = useState(null);

  localVideoTrackRef.current = localVideoTrack;
  localAudioTrackRef.current = localAudioTrack;
  
  // Control states
  const [isVideoEnabled, setIsVideoEnabled] = useState(false); // Default OFF
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Default OFF
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(50);
  const [videoReady, setVideoReady] = useState(false);
  
  // Force video playback on user interaction
  const forceVideoPlayback = async () => {
    if (localVideoRef.current && localVideoTrack) {


      try {
        // Ensure video element is properly configuredN
        const videoElement = localVideoRef.current;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        const playPromise = localVideoTrack.play(videoElement);

        playPromise.then(() => {

          setVideoReady(true);
        }).catch((error) => {
          console.error('Force video playback failed:', error);
        });

      } catch (error) {
        console.error('Error in force video playback:', error);
      }
    } else {

    }
  };
  
    // Separate effect to handle video element mounting
  useEffect(() => {
    if (localVideoRef.current) {

    }
  }, [localVideoRef.current]);
  
  // Fallback: try to play video whenever both element and track are available
  useEffect(() => {
    if (localVideoRef.current && localVideoTrack && !videoReady) {

      
      const attemptPlayback = async () => {
        try {
          const videoElement = localVideoRef.current;
          if (videoElement) {
            videoElement.muted = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            
            await localVideoTrack.play(videoElement);

            setVideoReady(true);
          }
        } catch (error) {
          console.error('Fallback video playback failed:', error);
        }
      };
      
      // Small delay to ensure DOM is fully ready
      setTimeout(attemptPlayback, 500);
    }
  }, [localVideoRef.current, localVideoTrack, videoReady]);

  // Ensure video element is ready when component mounts  // Ensure video element is ready when component mounts
  useEffect(() => {


    if (localVideoRef.current && isJoined && localVideoTrack) {


      try {
        // Ensure video element is properly configured
        const videoElement = localVideoRef.current;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;



        // Always try to play, regardless of paused state
        const playPromise = localVideoTrack.play(videoElement);

        playPromise.then(() => {

          setVideoReady(true);
        }).catch((playError) => {
          console.error('Failed to play video track:', playError);

          // Try again after a delay
          setTimeout(() => {
            if (localVideoRef.current && localVideoTrack) {

              localVideoTrack.play(localVideoRef.current).catch(retryError => {
                console.error('Retry failed:', retryError);
              });
            }
          }, 1000);
        });

      } catch (error) {
        console.error('Error ensuring video playback:', error);
      }
    } else {

    }
  }, [isJoined, localVideoTrack]);  // Agora configuration
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  // Handle page reload/navigation to cleanup Agora session
  useEffect(() => {
    const handleBeforeUnload = async (e) => {

      
      // Synchronous cleanup for beforeunload
      try {
        if (localVideoTrack) {
          localVideoTrack.close();
        }
        if (localAudioTrack) {
          localAudioTrack.close();
        }
        if (clientRef.current) {
          clientRef.current.leave();
          clientRef.current.removeAllListeners();
        }
      } catch (error) {
        console.error('Error in beforeunload cleanup:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [localVideoTrack, localAudioTrack]);

  // Initialize Agora SDK
  useEffect(() => {
    let isMounted = true;
    
    const initializeAgora = async () => {
      try {
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        const AgoraRTC = AgoraRTCModule.default;
        
        if (!isMounted) return;
        
        await initializeAgoraSession(AgoraRTC);
      } catch (error) {
        console.error('Failed to load Agora SDK:', error);
        if (isMounted) {
          setError('Failed to load video SDK. Please refresh and try again.');
          setIsLoading(false);
        }
      }
    };

    initializeAgora();
    
    // Cleanup function when component unmounts or page reloads
    return () => {
      isMounted = false;
      
      // Clean up Agora resources
      const cleanup = async () => {
        try {

          
          // Close local tracks
          if (localVideoTrack) {
            localVideoTrack.close();
          }
          if (localAudioTrack) {
            localAudioTrack.close();
          }
          
          // Leave channel and clean up client
          if (clientRef.current) {
            await clientRef.current.leave();
            clientRef.current.removeAllListeners();
            clientRef.current = null;
          }
          

        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
      
      cleanup();
    };
  }, []);

  const initializeAgoraSession = async (AgoraRTC) => {
    if (!AgoraRTC) return;

    try {
      setIsLoading(true);
      setError(null);

      // Resolve and validate Agora App ID
      const effectiveAppId = await agoraTokenService.getAppId();
      if (!effectiveAppId || effectiveAppId === 'your_agora_app_id_here') {
        throw new Error('Agora App ID is not configured. Please check your settings.');
      }

      // Guard: fallback to sessionId if channelName is missing
      const effectiveChannelName = channelName || `session_${sessionId}`;

      // Use student's numeric database ID as Agora UID if available, else random fallback
      const uid = studentId && !isNaN(Number(studentId)) && Number(studentId) > 0
        ? Number(studentId)
        : Math.floor(Math.random() * 1000000) + 1;

      // Generate token for the channel
      const token = await agoraTokenService.generateToken(effectiveChannelName, userRole, uid);

      // Create Agora client with different modes to handle certificate issues
      let agoraClient;
      try {
        // Try with default settings first
        agoraClient = AgoraRTC.createClient({ 
          mode: 'rtc', 
          codec: 'vp8' 
        });
      } catch (clientError) {
        console.warn('Failed to create client with vp8, trying h264:', clientError);
        // Fallback to h264 codec
        agoraClient = AgoraRTC.createClient({ 
          mode: 'rtc', 
          codec: 'h264' 
        });
      }

      // Set up event listeners
      agoraClient.on('user-published', handleUserPublished);
      agoraClient.on('user-unpublished', handleUserUnpublished);
      agoraClient.on('user-joined', handleUserJoined);
      agoraClient.on('user-left', handleUserLeft);
      agoraClient.on('stream-message', async (senderUid, data) => {
        try {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
          const msg = JSON.parse(text);
          if (msg.type === 'wb') {
            if (msg.a === 'v') {
              if (msg.show) {
                setShowWhiteboard(true);
                if (msg.room) setWhiteboardRoomUUID(msg.room);
              } else {
                setShowWhiteboard(false);
              }
            } else if (msg.a === 's' || msg.a === 'd') {
              // Automatically appear on student's screen when teacher writes!
              setShowWhiteboard(true);
              strokesHistoryRef.current.push(msg);
              window.dispatchEvent(new CustomEvent('wb_stroke', { detail: msg }));
            } else if (msg.a === 'e') {
              strokesHistoryRef.current.push(msg);
              window.dispatchEvent(new CustomEvent('wb_stroke', { detail: msg }));
            } else if (msg.a === 'c') {
              strokesHistoryRef.current = [];
              window.dispatchEvent(new CustomEvent('wb_clear'));
            } else if (msg.a === 'sync') {
              if (Array.isArray(msg.strokes) && msg.strokes.length > 0) {
                setShowWhiteboard(true);
                strokesHistoryRef.current.push(...msg.strokes);
                msg.strokes.forEach(s => {
                  window.dispatchEvent(new CustomEvent('wb_stroke', { detail: s }));
                });
              }
            }
          } else if (msg.type === 'teacher_control') {
            const myUid = clientRef.current?.uid || uid;
            const matchesMe = 
              msg.action === 'mute_all_audio' ||
              String(msg.targetUid) === String(myUid) ||
              Number(msg.targetUid) === Number(myUid) ||
              (msg.targetStudentId && String(msg.targetStudentId) === String(studentId));

            if (matchesMe) {
              if (msg.action === 'mute_audio' || msg.action === 'mute_all_audio') {
                if (localAudioTrackRef.current) {
                  try {
                    await localAudioTrackRef.current.setEnabled(false);
                  } catch (e) {
                    console.warn('Error disabling local audio track:', e);
                  }
                }
                setIsAudioEnabled(false);
                setControlNotice('Your microphone was muted by the instructor.');
                setTimeout(() => setControlNotice(null), 4500);
              } else if (msg.action === 'mute_video') {
                if (localVideoTrackRef.current) {
                  try {
                    await localVideoTrackRef.current.setEnabled(false);
                  } catch (e) {
                    console.warn('Error disabling local video track:', e);
                  }
                }
                setIsVideoEnabled(false);
                setControlNotice('Your camera was turned off by the instructor.');
                setTimeout(() => setControlNotice(null), 4500);
              }
            }
          }
        } catch (err) {
          console.warn('Error handling stream message on student:', err);
        }
      });

      setClient(agoraClient);
      clientRef.current = agoraClient; // Also set the ref

      // Join channel
      await agoraClient.join(effectiveAppId, effectiveChannelName, token, uid);
      setIsJoined(true);

      // Automatically record student attendance in database
      if (sessionId && studentId && Number(studentId) > 0) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';
          fetch(`${backendUrl}/api/students/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: Number(sessionId),
              student_id: Number(studentId)
            })
          }).catch(err => console.warn('Attendance auto-record background error:', err));
        } catch (e) {
          // Non-blocking
        }
      }

      // Broadcast student name & profile and request whiteboard state via Agora Data Stream
      const broadcastProfileAndSync = async () => {
        try {
          const current = agoraClient || clientRef.current;
          if (!current) return;
          const payload = JSON.stringify({
            type: 'student_info',
            uid: uid,
            studentId: studentId,
            name: studentName,
            email: studentEmail
          });
          await current.sendStreamMessage(payload);

          // Request whiteboard sync from teacher in case teacher already opened it
          const syncReq = JSON.stringify({ type: 'wb', a: 'req' });
          await current.sendStreamMessage(syncReq);
        } catch (e) {
          console.warn('Failed to broadcast profile / sync:', e);
        }
      };

      broadcastProfileAndSync();
      setTimeout(broadcastProfileAndSync, 2000);
      setTimeout(broadcastProfileAndSync, 5000);

      // Create and publish local tracks:
      // Host publishes immediately; student attempts to publish but joins in listen/watch mode if no media available
      if (userRole === 'host') {
        await createAndPublishTracks(agoraClient);
      } else {
        try {
          await createAndPublishTracks(agoraClient);
        } catch (mediaErr) {
          console.warn('Student joined in listen-only mode:', mediaErr);
        }
      }

    } catch (err) {
      console.error('Detailed Agora error:', {
        code: err.code,
        message: err.message,
        data: err.data
      });
      
      // More specific error handling with user guidance
      if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER' || err.message?.includes('dynamic use static key')) {
        setError(`🔧 Authentication Setup Required:

1. Go to console.agora.io
2. Login and select your project
3. Go to "Config" → "App Certificate" 
4. DISABLE App Certificate for development
5. Save and wait 1-2 minutes
6. Refresh this page and try again

Your App ID (${appId}) is configured correctly. The issue is that App Certificate is enabled but no token server is running.`);
      } else if (err.code === 'INVALID_APP_ID') {
        setError('Invalid App ID. Please check your NEXT_PUBLIC_AGORA_APP_ID environment variable.');
      } else if (err.code === 'INVALID_CHANNEL_NAME') {
        setError('Invalid channel name. Please contact support.');
      } else {
        setError(`Connection failed: ${err.message || 'Unknown error'}. Please check your internet connection and try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createAndPublishTracks = async (agoraClient) => {
    try {

      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Request permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());

      } catch (permError) {
        console.error('Permission denied:', permError);
        
        if (permError.name === 'NotAllowedError') {
          throw new Error(`🎥 Camera/Microphone Access Denied

Please follow these steps:
1. Click the camera/microphone icon in your browser's address bar
2. Select "Allow" for camera and microphone
3. Refresh this page and try again

Or in browser settings:
• Chrome: Settings → Privacy → Site Settings → Camera/Microphone
• Safari: Preferences → Websites → Camera/Microphone
• Firefox: Preferences → Privacy → Permissions`);
        } else if (permError.name === 'NotFoundError') {
          throw new Error('No camera or microphone found. Please connect a camera/microphone and try again.');
        } else if (permError.name === 'NotReadableError') {
          throw new Error('Camera or microphone is being used by another application. Please close other apps and try again.');
        } else {
          throw new Error(`Camera/Microphone error: ${permError.message}`);
        }
      }

      // Import AgoraRTC for track creation
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;


      
      // Create camera and microphone tracks
      const [videoTrack, audioTrack] = await Promise.all([
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMin: 400,
            bitrateMax: 1000,
          }
        }),
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        })
      ]);

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);


      
      // Publish tracks to the channel (must be enabled when publishing)
      await agoraClient.publish([videoTrack, audioTrack]);


      // Now disable tracks after publishing (student starts with mic and camera off)
      await videoTrack.setEnabled(false);
      await audioTrack.setEnabled(false);


      // Note: Video playback will be handled by the useEffect when the component renders

    } catch (error) {
      console.error('Failed to create or publish tracks:', error);
      if (userRole === 'host') {
        setError(error.message || 'Failed to access camera or microphone. Please check permissions and try again.');
      } else {
        console.warn('Student media access unavailable or declined, joining in listen-only mode:', error);
      }
    }
  };

  // Event handlers
  const handleUserPublished = async (user, mediaType) => {

    
    try {
      // Subscribe to the user using clientRef to avoid null issues
      const currentClient = clientRef.current;
      if (!currentClient) {
        console.error('[STUDENT] Client is null, cannot subscribe');
        return;
      }
      
      await currentClient.subscribe(user, mediaType);
      

      
      // Update remote users state immediately
      setRemoteUsers(prev => {
        const newMap = new Map(prev);
        const existingUser = newMap.get(user.uid) || { uid: user.uid, hasVideo: false, hasAudio: false };
        
        if (mediaType === 'video') {
          existingUser.videoTrack = user.videoTrack;
          existingUser.hasVideo = true;

        } else if (mediaType === 'audio') {
          existingUser.audioTrack = user.audioTrack;
          existingUser.hasAudio = true;

        }
        
        newMap.set(user.uid, existingUser);

        return newMap;
      });

      // Play remote media
      if (mediaType === 'video' && user.videoTrack) {
        // Use a longer timeout to ensure DOM is ready
        setTimeout(() => {
          const videoContainer = document.getElementById(`remote-video-${user.uid}`);
          if (videoContainer) {

            user.videoTrack.play(videoContainer);
          } else {
            console.warn('Video container not found for user:', user.uid);
            // Retry after another short delay
            setTimeout(() => {
              const retryContainer = document.getElementById(`remote-video-${user.uid}`);
              if (retryContainer) {

                user.videoTrack.play(retryContainer);
              }
            }, 500);
          }
        }, 200);
      }
      
      if (mediaType === 'audio' && user.audioTrack) {

        user.audioTrack.play();
      }
    } catch (error) {
      console.error('Error handling user published:', error);
    }
  };

  const handleUserUnpublished = (user, mediaType) => {

    
    // Update remote users state to trigger re-render but keep the user
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      if (newMap.has(user.uid)) {
        const existingUser = newMap.get(user.uid);
        // Remove the specific track but keep the user
        if (mediaType === 'video') {
          existingUser.videoTrack = null;
          existingUser.hasVideo = false;
        } else if (mediaType === 'audio') {
          existingUser.audioTrack = null;
          existingUser.hasAudio = false;
        }
        newMap.set(user.uid, existingUser);

      }
      return newMap;
    });
  };

  const handleUserJoined = (user) => {

    
    // Add user to remote users even if they haven't published yet
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(user.uid)) {
        newMap.set(user.uid, { 
          uid: user.uid, 
          hasVideo: false, 
          hasAudio: false 
        });

      }
      return newMap;
    });
  };

  const handleUserLeft = (user) => {

    
    // Remove immediately - no delay needed with proper cleanup
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      if (newMap.has(user.uid)) {

        newMap.delete(user.uid);
      }
      return newMap;
    });
  };

  // Control functions
  const toggleVideo = async () => {
    try {
      if (localVideoTrack) {
        if (isVideoEnabled) {
          await localVideoTrack.setEnabled(false);
          setIsVideoEnabled(false);
        } else {
          await localVideoTrack.setEnabled(true);
          setIsVideoEnabled(true);
          if (localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }
        }
      } else {
        // Lazily create and publish video track
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        const AgoraRTC = AgoraRTCModule.default;
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMin: 400,
            bitrateMax: 1000,
          }
        });
        setLocalVideoTrack(videoTrack);
        localVideoTrackRef.current = videoTrack;
        const currentClient = client || clientRef.current;
        if (currentClient) {
          await currentClient.publish([videoTrack]);
        }
        await videoTrack.setEnabled(true);
        setIsVideoEnabled(true);
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        setVideoReady(true);
      }
    } catch (err) {
      console.error('Failed to toggle video:', err);
    }
  };

  const toggleAudio = async () => {
    try {
      if (localAudioTrack) {
        if (isAudioEnabled) {
          await localAudioTrack.setEnabled(false);
          setIsAudioEnabled(false);
        } else {
          await localAudioTrack.setEnabled(true);
          setIsAudioEnabled(true);
        }
      } else {
        // Lazily create and publish audio track
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        const AgoraRTC = AgoraRTCModule.default;
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        });
        setLocalAudioTrack(audioTrack);
        localAudioTrackRef.current = audioTrack;
        const currentClient = client || clientRef.current;
        if (currentClient) {
          await currentClient.publish([audioTrack]);
        }
        await audioTrack.setEnabled(true);
        setIsAudioEnabled(true);
      }
    } catch (err) {
      console.error('Failed to toggle audio:', err);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      
      // Replace video track with screen share
      if (localVideoTrack) {
        await client.unpublish(localVideoTrack);
        localVideoTrack.close();
      }
      
      await client.publish(screenTrack);
      screenTrack.play(localVideoRef.current);
      
      setLocalVideoTrack(screenTrack);
      setIsScreenSharing(true);
      
      // Listen for screen share end
      screenTrack.on('track-ended', () => {
        stopScreenShare();
      });
      
    } catch (error) {
      console.error('Failed to start screen share:', error);
      setError('Failed to start screen sharing. Please try again.');
    }
  };

  const stopScreenShare = async () => {
    if (localVideoTrack && isScreenSharing) {
      await client.unpublish(localVideoTrack);
      localVideoTrack.close();
      
      // Create new camera track
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack();
      await client.publish(newVideoTrack);
      newVideoTrack.play(localVideoRef.current);
      
      setLocalVideoTrack(newVideoTrack);
      setIsScreenSharing(false);
    }
  };

  const leaveSession = async () => {
    try {
      // Clean up local tracks
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      
      // Leave channel
      if (client) {
        await client.leave();
      }
      
      // Reset state
      setIsJoined(false);
      setRemoteUsers(new Map());
      
      // Call parent callback
      if (onLeave) {
        onLeave();
      }
      
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Joining Session...</h3>
            <p className="text-gray-600">Setting up your video conference</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneOff size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Connection Failed</h3>
            <div className="text-gray-600 text-sm whitespace-pre-line mb-6">
              {error}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onLeave}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main video session UI
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>
            {sessionTitle || 'Teaching Session'}
          </h1>
          <p className="text-sm text-gray-600">Channel: {channelName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{remoteUsers.size + 1} participants</span>
            {remoteUsers.size > 0 && (
              <span className="text-green-600">• {remoteUsers.size} students connected</span>
            )}
          </div>
          
          <button
            onClick={leaveSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PhoneOff size={16} />
            End Session
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {userRole === 'host' ? (
          // TEACHER VIEW: Own video large, students in sidebar
          <>
            <div className="flex-1 relative bg-black">
              <div className="w-full h-full relative bg-gray-900">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover cursor-pointer"
                  style={{ 
                    background: isVideoEnabled ? 'transparent' : '#374151',
                    display: isVideoEnabled ? 'block' : 'none',
                    visibility: 'visible'
                  }}
                  muted
                  autoPlay
                  playsInline
                  onLoadedData={() => {

                    setVideoReady(true);
                  }}
                  onError={(e) => console.error('Local video error:', e)}
                  onPlay={() => {}}
                  onPause={() => {}}
                  onClick={forceVideoPlayback}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-white text-center">
                      <VideoOff size={48} className="mx-auto mb-2" />
                      <p>Camera is off</p>
                    </div>
                  </div>
                )}
                {isVideoEnabled && !videoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Click to start video</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                You (Teacher)
                {isScreenSharing && <span className="ml-2 text-green-400">• Screen Sharing</span>}
              </div>
            </div>

            <div className="w-80 bg-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">
                Students ({remoteUsers.size})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {remoteUsers.size === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    <Users size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Waiting for students to join...</p>
                  </div>
                ) : (
                  Array.from(remoteUsers.values()).map((user) => (
                    <div key={user.uid} className="bg-gray-700 rounded-lg overflow-hidden mb-3">
                      <div 
                        id={`remote-video-${user.uid}`}
                        className="w-full h-40 bg-gray-900 relative"
                        style={{ minHeight: '160px' }}
                      >
                        {!user.hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
                            <div>
                              <Users size={24} className="mx-auto mb-1" />
                              <p className="text-xs">Camera off</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-white text-sm font-medium">
                          Student {String(user.uid).slice(-4)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${user.hasAudio ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-xs text-gray-300">{user.hasAudio ? 'Audio' : 'Muted'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${user.hasVideo ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-xs text-gray-300">{user.hasVideo ? 'Video' : 'No video'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          // STUDENT VIEW: Instructor video large, own video small in corner
          <div className="flex-1 relative bg-black overflow-hidden flex flex-col min-h-0">
            {/* Instructor Action Notification Toast */}
            {controlNotice && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/95 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-sm backdrop-blur-md border border-red-400/50">
                <MicOff size={16} className="text-white" />
                <span className="font-semibold">{controlNotice}</span>
              </div>
            )}

            {/* Whiteboard Overlay for Student */}
            {showWhiteboard && (
              <div className="absolute inset-0 z-20 bg-white">
                <WhiteboardWrapper
                  roomUUID={whiteboardRoomUUID || 'live-session'}
                  isHost={false}
                  onClose={() => setShowWhiteboard(false)}
                  remoteStroke={remoteStroke}
                  clearTrigger={clearTrigger}
                  initialStrokes={strokesHistoryRef.current}
                />
              </div>
            )}

            {remoteUsers.size > 0 ? (
              // If single remote user (instructor), take full screen.
              // If multiple remote users, show as responsive grid
              <div className={`w-full h-full ${
                remoteUsers.size === 1 
                  ? 'relative' 
                  : 'grid grid-cols-1 md:grid-cols-2 gap-2 p-2 overflow-y-auto'
              }`}>
                {Array.from(remoteUsers.values()).map((user, idx) => (
                  <div key={user.uid} className={`w-full h-full relative ${remoteUsers.size > 1 ? 'min-h-[220px] bg-gray-900 rounded-lg overflow-hidden' : ''}`}>
                    <div 
                      id={`remote-video-${user.uid}`}
                      className="w-full h-full bg-gray-900 relative"
                    >
                      {!user.hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <Users size={remoteUsers.size > 1 ? 36 : 64} className="mx-auto mb-3" />
                            <p className={remoteUsers.size > 1 ? 'text-sm font-medium' : 'text-xl'}>
                              {idx === 0 ? "Instructor's camera is off" : `Participant ${String(user.uid).slice(-4)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm">
                      <p className="font-semibold">{idx === 0 ? 'Instructor' : `Participant (${String(user.uid).slice(-4)})`}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${user.hasAudio ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span>{user.hasAudio ? 'Audio' : 'Muted'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${user.hasVideo ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span>{user.hasVideo ? 'Video' : 'No video'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Waiting for instructor
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <Users size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">Waiting for instructor to join...</p>
                </div>
              </div>
            )}

            {/* Student's own video - small in bottom right corner */}
            <div className="absolute bottom-6 right-6 w-64 h-44 md:w-72 md:h-52 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl z-20">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                style={{ 
                  background: isVideoEnabled ? 'transparent' : '#374151',
                  display: isVideoEnabled ? 'block' : 'none',
                }}
                muted
                autoPlay
                playsInline
                onLoadedData={() => {

                  setVideoReady(true);
                }}
                onError={(e) => console.error('Local video error:', e)}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-white text-center">
                    <VideoOff size={36} className="mx-auto mb-2" />
                    <p className="text-sm">Your camera is off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                You
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex-shrink-0 z-30 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Control */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Turn on microphone'}
          >
            {isAudioEnabled ? (
              <Mic size={20} className="text-white" />
            ) : (
              <MicOff size={20} className="text-white" />
            )}
          </button>

          {/* Video Control */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video size={20} className="text-white" />
            ) : (
              <VideoOff size={20} className="text-white" />
            )}
          </button>

          {/* Whiteboard Control for Student */}
          <button
            onClick={() => setShowWhiteboard(prev => !prev)}
            className={`p-3 rounded-full transition-colors relative ${
              showWhiteboard 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={showWhiteboard ? 'Minimize whiteboard' : 'View whiteboard'}
          >
            <PenTool size={20} className="text-white" />
            {showWhiteboard && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Settings */}
          <button 
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
            title="Settings"
          >
            <Settings size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgoraVideoSession;
