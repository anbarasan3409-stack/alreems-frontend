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
  PenTool,
  MessageSquare,
  Send,
  X
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
  studentEmail,
  teacherName: propTeacherName,
  teacherId: propTeacherId
}) => {
  // State management
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [userRoles, setUserRoles] = useState(new Map());
  const [resolvedTeacherName, setResolvedTeacherName] = useState(propTeacherName || '');
  const [resolvedTeacherId, setResolvedTeacherId] = useState(propTeacherId || null);

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
  const cameraTrackRef = useRef(null);
  const screenTrackRef = useRef(null);
  const [controlNotice, setControlNotice] = useState(null);

  localVideoTrackRef.current = localVideoTrack;
  localAudioTrackRef.current = localAudioTrack;
  
  // Control states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // Default ON
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Default ON
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(50);
  const [videoReady, setVideoReady] = useState(false);

  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const showChatRef = useRef(false);
  showChatRef.current = showChat;
  
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
    const cleanupResources = () => {
      try {
        if (cameraTrackRef.current) {
          try { cameraTrackRef.current.close(); } catch (e) {}
          cameraTrackRef.current = null;
        }
        if (screenTrackRef.current) {
          try { screenTrackRef.current.close(); } catch (e) {}
          screenTrackRef.current = null;
        }
        if (localVideoTrackRef.current) {
          try { localVideoTrackRef.current.close(); } catch (e) {}
        }
        if (localAudioTrackRef.current) {
          try { localAudioTrackRef.current.close(); } catch (e) {}
        }
        if (clientRef.current) {
          clientRef.current.leave().catch(() => {});
          clientRef.current.removeAllListeners();
        }
      } catch (error) {
        console.error('Error in navigation cleanup:', error);
      }
    };

    window.addEventListener('beforeunload', cleanupResources);
    window.addEventListener('pagehide', cleanupResources);
    window.addEventListener('popstate', cleanupResources);
    
    return () => {
      window.removeEventListener('beforeunload', cleanupResources);
      window.removeEventListener('pagehide', cleanupResources);
      window.removeEventListener('popstate', cleanupResources);
    };
  }, []);

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
      
      // Clean up Agora resources using refs (avoids stale closure)
      const cleanup = async () => {
        try {
          if (cameraTrackRef.current) {
            try { cameraTrackRef.current.close(); } catch (e) {}
            cameraTrackRef.current = null;
          }
          if (screenTrackRef.current) {
            try { screenTrackRef.current.close(); } catch (e) {}
            screenTrackRef.current = null;
          }
          if (localVideoTrackRef.current) {
            try { localVideoTrackRef.current.close(); } catch (e) {}
          }
          if (localAudioTrackRef.current) {
            try { localAudioTrackRef.current.close(); } catch (e) {}
          }
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

      // Use a fresh unique UID per join to prevent UID_CONFLICT on rapid rejoin / back navigation
      // (studentId and studentName are broadcast via student_info stream message)
      let uid = Math.floor(Math.random() * 10000000) + 1;

      // Generate token for the channel
      let token = await agoraTokenService.generateToken(effectiveChannelName, userRole, uid);

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
          } else if (msg.type === 'role_query' || msg.type === 'discover_roles') {
            // Reply with student identity so late-joining teachers/admins see our real name
            try {
              const current = agoraClient || clientRef.current;
              if (current) {
                const myUid = current.uid || uid;
                await current.sendStreamMessage(JSON.stringify({
                  type: 'student_info',
                  role: 'student',
                  uid: myUid,
                  studentId: studentId,
                  name: studentName,
                  email: studentEmail
                }));
              }
            } catch (replyErr) {
              console.warn('Failed to reply to role_query:', replyErr);
            }
          } else if (msg.type === 'user_role') {
            if (msg.uid && msg.role) {
              setUserRoles(prev => {
                const next = new Map(prev);
                next.set(msg.uid, msg.role);
                next.set(Number(msg.uid), msg.role);
                next.set(String(msg.uid), msg.role);
                return next;
              });
              if (msg.role === 'teacher' && msg.name) {
                setResolvedTeacherName(msg.name);
              }
            }
          } else if (msg.type === 'chat_toggle') {
            const enabled = Boolean(msg.enabled);
            setChatEnabled(enabled);
            setControlNotice(
              enabled
                ? 'Class chat has been enabled by the instructor.'
                : 'Class chat has been disabled by the instructor.'
            );
            setTimeout(() => setControlNotice(null), 3500);
          } else if (msg.type === 'chat_msg' && msg.text) {
            setChatMessages(prev => [
              ...prev.slice(-199),
              {
                id: msg.id || `${senderUid}-${Date.now()}`,
                senderName: msg.senderName || 'Participant',
                senderRole: msg.senderRole || 'student',
                text: String(msg.text),
                timestamp: msg.timestamp || Date.now(),
                isSelf: false
              }
            ]);
            if (!showChatRef.current) {
              setUnreadChatCount(c => c + 1);
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
              } else if (msg.action === 'unmute_audio') {
                try {
                  if (localAudioTrackRef.current) {
                    await localAudioTrackRef.current.setEnabled(true);
                  } else {
                    const AgoraRTCModule = await import('agora-rtc-sdk-ng');
                    const AgoraRTC = AgoraRTCModule.default;
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" });
                    setLocalAudioTrack(audioTrack);
                    localAudioTrackRef.current = audioTrack;
                    const currentClient = agoraClient || clientRef.current;
                    if (currentClient) {
                      await currentClient.publish([audioTrack]);
                    }
                  }
                  setIsAudioEnabled(true);
                  setControlNotice('Your microphone was unmuted by the instructor.');
                  setTimeout(() => setControlNotice(null), 4500);
                } catch (e) {
                  console.warn('Error enabling local audio track:', e);
                  setControlNotice('Instructor asked to unmute. Please allow microphone access and tap Mic.');
                  setTimeout(() => setControlNotice(null), 5000);
                }
              } else if (msg.action === 'unmute_video') {
                try {
                  if (localVideoTrackRef.current) {
                    await localVideoTrackRef.current.setEnabled(true);
                    if (localVideoRef.current) {
                      localVideoTrackRef.current.play(localVideoRef.current);
                    }
                  } else {
                    const AgoraRTCModule = await import('agora-rtc-sdk-ng');
                    const AgoraRTC = AgoraRTCModule.default;
                    const videoTrack = await AgoraRTC.createCameraVideoTrack({
                      encoderConfig: { width: 640, height: 480, frameRate: 15, bitrateMin: 400, bitrateMax: 1000 }
                    });
                    setLocalVideoTrack(videoTrack);
                    localVideoTrackRef.current = videoTrack;
                    cameraTrackRef.current = videoTrack;
                    const currentClient = agoraClient || clientRef.current;
                    if (currentClient) {
                      await currentClient.publish([videoTrack]);
                    }
                    if (localVideoRef.current) {
                      videoTrack.play(localVideoRef.current);
                    }
                  }
                  setIsVideoEnabled(true);
                  setControlNotice('Your camera was turned on by the instructor.');
                  setTimeout(() => setControlNotice(null), 4500);
                } catch (e) {
                  console.warn('Error enabling local video track:', e);
                  setControlNotice('Instructor asked to turn on camera. Please allow camera access and tap Camera.');
                  setTimeout(() => setControlNotice(null), 5000);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Error handling stream message on student:', err);
        }
      });

      setClient(agoraClient);
      clientRef.current = agoraClient; // Also set the ref

      // Join channel (retry once with a fresh UID if UID_CONFLICT occurs)
      try {
        await agoraClient.join(effectiveAppId, effectiveChannelName, token, uid);
      } catch (joinErr) {
        if (joinErr?.code === 'UID_CONFLICT' || String(joinErr?.message || '').includes('UID_CONFLICT')) {
          uid = Math.floor(Math.random() * 10000000) + 1;
          token = await agoraTokenService.generateToken(effectiveChannelName, userRole, uid);
          await agoraClient.join(effectiveAppId, effectiveChannelName, token, uid);
        } else {
          throw joinErr;
        }
      }
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
            role: 'student',
            uid: uid,
            studentId: studentId,
            name: studentName,
            email: studentEmail
          });
          await current.sendStreamMessage(payload);

          // Request whiteboard sync from teacher in case teacher already opened it
          const syncReq = JSON.stringify({ type: 'wb', a: 'req' });
          await current.sendStreamMessage(syncReq);

          // Query roles from instructor/admin
          const roleReq = JSON.stringify({ type: 'role_query' });
          await current.sendStreamMessage(roleReq);
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

      // Import AgoraRTC for track creation (creates tracks directly without duplicate getUserMedia prompt)
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;

      let videoTrack = null;
      let audioTrack = null;

      try {
        [videoTrack, audioTrack] = await Promise.all([
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
      } catch (bothErr) {
        // Fallback: try audio and video separately so one missing device doesn't block the other
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" });
        } catch (aErr) {
          console.warn('Microphone access failed:', aErr);
        }
        try {
          videoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: { width: 640, height: 480, frameRate: 15, bitrateMin: 400, bitrateMax: 1000 }
          });
        } catch (vErr) {
          console.warn('Camera access failed:', vErr);
        }
        if (!audioTrack && !videoTrack) {
          throw bothErr;
        }
      }

      cameraTrackRef.current = videoTrack;
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);
      setIsVideoEnabled(Boolean(videoTrack));
      setIsAudioEnabled(Boolean(audioTrack));

      // Publish tracks enabled by default
      const tracksToPublish = [videoTrack, audioTrack].filter(Boolean);
      if (tracksToPublish.length > 0) {
        await agoraClient.publish(tracksToPublish);
      }

      // Note: Video playback will be handled by the useEffect when the component renders

    } catch (error) {
      console.error('Failed to create or publish tracks:', error);
      if (userRole === 'host') {
        setError(error.message || 'Failed to access camera or microphone. Please check permissions and try again.');
      } else {
        console.warn('Student media access unavailable or declined, joining in listen-only mode:', error);
        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
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
        cameraTrackRef.current = videoTrack;
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
      setControlNotice('Could not access camera. Please allow camera permission in your browser settings.');
      setTimeout(() => setControlNotice(null), 4500);
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
      setControlNotice('Could not access microphone. Please allow microphone permission in your browser settings.');
      setTimeout(() => setControlNotice(null), 4500);
    }
  };

  const startScreenShare = async () => {
    try {
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;
      const screenTrack = await AgoraRTC.createScreenVideoTrack();

      const currentClient = clientRef.current || client;
      if (!currentClient) return;

      // Keep camera track alive (unpublish + disable) so stopping screen share doesn't re-prompt permission
      const camTrack = cameraTrackRef.current || localVideoTrack;
      if (camTrack) {
        await currentClient.unpublish(camTrack);
        await camTrack.setEnabled(false);
      }

      await currentClient.publish(screenTrack);
      screenTrackRef.current = screenTrack;
      if (localVideoRef.current) {
        screenTrack.play(localVideoRef.current);
      }

      setLocalVideoTrack(screenTrack);
      setIsScreenSharing(true);
      setIsVideoEnabled(true);

      // Listen for screen share end
      screenTrack.on('track-ended', () => {
        stopScreenShare();
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      const currentClient = clientRef.current || client;
      if (!currentClient) return;

      const activeScreenTrack = screenTrackRef.current || (isScreenSharing ? localVideoTrack : null);
      if (activeScreenTrack) {
        await currentClient.unpublish(activeScreenTrack);
        activeScreenTrack.close();
        screenTrackRef.current = null;
      }

      let camTrack = cameraTrackRef.current;
      if (!camTrack) {
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        const AgoraRTC = AgoraRTCModule.default;
        camTrack = await AgoraRTC.createCameraVideoTrack();
        cameraTrackRef.current = camTrack;
      } else {
        await camTrack.setEnabled(true);
      }

      await currentClient.publish(camTrack);
      if (localVideoRef.current) {
        camTrack.play(localVideoRef.current);
      }

      setLocalVideoTrack(camTrack);
      setIsScreenSharing(false);
      setIsVideoEnabled(true);
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      setIsScreenSharing(false);
    }
  };

  const sendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatEnabled) return;
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const msgObj = {
      type: 'chat_msg',
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderName: studentName || 'Student',
      senderRole: 'student',
      text: trimmed,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev.slice(-199), { ...msgObj, isSelf: true }]);
    setChatInput('');
    try {
      const current = client || clientRef.current;
      if (current) {
        await current.sendStreamMessage(JSON.stringify(msgObj));
      }
    } catch (err) {
      console.warn('Failed to send chat message:', err);
    }
  };

  const leaveSession = async () => {
    try {
      // Clean up local tracks
      if (cameraTrackRef.current) {
        try { cameraTrackRef.current.close(); } catch (e) {}
        cameraTrackRef.current = null;
      }
      if (screenTrackRef.current) {
        try { screenTrackRef.current.close(); } catch (e) {}
        screenTrackRef.current = null;
      }
      if (localVideoTrack) {
        try { localVideoTrack.close(); } catch (e) {}
      }
      if (localAudioTrack) {
        try { localAudioTrack.close(); } catch (e) {}
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

            {(() => {
              const remoteUsersArray = Array.from(remoteUsers.values());
              const getRoleForUser = (user) => {
                const uid = user.uid;
                const recorded = userRoles.get(uid) || userRoles.get(Number(uid)) || userRoles.get(String(uid));
                if (recorded) return recorded;
                if (resolvedTeacherId && (Number(uid) === Number(resolvedTeacherId) || String(uid) === String(resolvedTeacherId))) {
                  return 'teacher';
                }
                return 'teacher';
              };
              
              const teacherUser = remoteUsersArray.find(u => getRoleForUser(u) === 'teacher') || remoteUsersArray.find(u => getRoleForUser(u) !== 'admin') || remoteUsersArray[0];
              const adminUsers = remoteUsersArray.filter(u => getRoleForUser(u) === 'admin' && u.uid !== teacherUser?.uid);

              return teacherUser ? (
                <div className="w-full h-full relative bg-gray-900">
                  <div 
                    id={`remote-video-${teacherUser.uid}`}
                    className="w-full h-full bg-gray-900 relative"
                  >
                    {!teacherUser.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Users size={64} className="mx-auto mb-3" />
                          <p className="text-xl">
                            Instructor's camera is off
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm z-10">
                    <p className="font-semibold">{resolvedTeacherName ? `${resolvedTeacherName} (Instructor)` : 'Instructor'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${teacherUser.hasAudio ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>{teacherUser.hasAudio ? 'Audio' : 'Muted'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${teacherUser.hasVideo ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>{teacherUser.hasVideo ? 'Video' : 'No video'}</span>
                      </div>
                    </div>
                  </div>

                  {/* If Admin is present, show small observer badge in top-right */}
                  {adminUsers.length > 0 && (
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                      {adminUsers.map(admin => (
                        <div key={admin.uid} className="bg-black/70 backdrop-blur-md border border-purple-500/50 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-purple-200 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <span className="font-semibold">Administrator (Observer)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Waiting for instructor
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center text-gray-400">
                    <Users size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Waiting for instructor to join...</p>
                  </div>
                </div>
              );
            })()}

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

          {/* Chat Control */}
          <button
            onClick={() => {
              setShowChat(prev => {
                const next = !prev;
                if (next) setUnreadChatCount(0);
                return next;
              });
            }}
            className={`p-3 rounded-full transition-colors relative ${
              showChat
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={showChat ? 'Hide chat' : 'Open chat'}
          >
            <MessageSquare size={20} className="text-white" />
            {unreadChatCount > 0 && !showChat && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
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

      {/* In-Call Chat Drawer */}
      {showChat && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-80 sm:w-96 h-[400px] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-400" />
              <h3 className="text-white font-semibold text-sm">Class Chat</h3>
              {!chatEnabled && (
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                  Disabled
                </span>
              )}
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-12">
                {chatEnabled
                  ? 'No messages yet. Ask a question!'
                  : 'Chat is currently disabled by the instructor.'}
              </div>
            ) : (
              chatMessages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[11px] text-gray-400 mb-0.5 px-1">
                    {m.isSelf ? 'You' : m.senderName}
                    {m.senderRole === 'teacher' && !m.isSelf ? ' (Instructor)' : ''}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm break-words ${
                      m.isSelf
                        ? 'bg-blue-600 text-white'
                        : m.senderRole === 'teacher'
                          ? 'bg-purple-600/80 text-white'
                          : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {chatEnabled ? (
            <form onSubmit={sendChatMessage} className="p-3 bg-gray-900 border-t border-gray-700 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-gray-900 border-t border-gray-700 text-center text-xs text-gray-400">
              Chat is disabled by the instructor
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgoraVideoSession;
