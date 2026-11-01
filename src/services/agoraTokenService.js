// Agora Token Service
// This service handles Agora token generation and management

const getBackendUrl = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.reems.co.in';
};

export const agoraTokenService = {
  // Get Agora App ID with backend API fallback
  getAppId: async () => {
    const envAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (envAppId && envAppId !== 'your_agora_app_id_here') {
      return envAppId;
    }

    const backendUrl = getBackendUrl();
    try {
      const response = await fetch(`${backendUrl}/api/admin/agora/app-id`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.appId && data.appId !== 'YOUR_AGORA_APP_ID') {
          return data.appId;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Agora App ID from backend:', error);
    }

    return envAppId || '69b16dcca6a1427eb88808cce4f24a79';
  },

  // Generate token for joining a channel
  generateToken: async (channelName, userRole = 'audience', uid = 0) => {
    const backendUrl = getBackendUrl();
    const effectiveRole = userRole === 'host' ? 'teacher' : 'student';

    // 1. Try student RTC token endpoint first (/api/students/rtc-token)
    try {
      const sIdParam = uid && Number(uid) > 0 ? `&studentId=${encodeURIComponent(uid)}` : '';
      const studentUrl = `${backendUrl}/api/students/rtc-token?channelName=${encodeURIComponent(channelName)}&uid=${uid}&role=${effectiveRole}${sIdParam}`;
      const response = await fetch(studentUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.token) {
          console.log('Successfully fetched Agora RTC token from student endpoint');
          return data.token;
        }
      } else {
        console.warn('Student rtc-token endpoint returned status:', response.status);
      }
    } catch (err) {
      console.warn('Failed to fetch from student rtc-token endpoint:', err);
    }

    // 2. Fallback to /api/admin/rtc-token
    try {
      const adminUrl = `${backendUrl}/api/admin/rtc-token?channelName=${encodeURIComponent(channelName)}&uid=${uid}&role=${effectiveRole}`;
      const response = await fetch(adminUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.token) {
          console.log('Successfully fetched Agora RTC token from admin fallback endpoint');
          return data.token;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from admin rtc-token endpoint:', err);
    }

    // 3. Fallback to /api/agora/student/token
    try {
      const agoraUrl = `${backendUrl}/api/agora/student/token`;
      const response = await fetch(agoraUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          channelName,
          userRole: effectiveRole,
          uid: Number(uid) || 0,
          expirationTimeInSeconds: 3600
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.token) {
          return data.token;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from agora student token endpoint:', err);
    }

    return null;
  },

  // Validate Agora App ID
  validateAppId: () => {
    if (typeof window === 'undefined') return false;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    return !!appId && appId !== 'your_agora_app_id_here';
  }
};

export default agoraTokenService;
