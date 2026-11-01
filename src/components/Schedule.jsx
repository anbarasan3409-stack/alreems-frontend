import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Users, 
  Video,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useStudentProfile, useSessions, useSessionStreaming } from '../hooks/useStudentAPI.js';
import LiveSession from './LiveSession.jsx';

const Schedule = () => {
  const { profile, loading: profileLoading } = useStudentProfile();
  const { 
    sessions,
    liveSessions, 
    upcomingSessions,
    loading: sessionsLoading,
    error: sessionsError,
    joinLiveSession,
    checkSessionJoinable 
  } = useSessions();
  const { joinSession } = useSessionStreaming();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // 'all', 'live', 'upcoming'
  const [activeSessionId, setActiveSessionId] = useState(null); // For live session modal

  const handleJoinSession = async (sessionId) => {
    try {
      const profileId = profile?.ID || profile?.id;
      if (!profileId) {
        alert('Please log in to join sessions');
        return;
      }

      const { joinable, reason } = await checkSessionJoinable(sessionId);
      
      if (!joinable) {
        alert(reason || 'Session is not available');
        return;
      }

      // Open the live session component
      setActiveSessionId(sessionId);
    } catch (error) {
      alert('Failed to join session: ' + error.message);
    }
  };

  const handleLeaveSession = () => {
    setActiveSessionId(null);
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    
    const dateStr = date.toDateString();
    const allSessions = [...(liveSessions || []), ...(upcomingSessions || [])];
    
    return allSessions.filter(session => {
      const sessionDate = new Date(session.start_time || session.StartTime || session.Date || session.date);
      return sessionDate.toDateString() === dateStr;
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const SessionCard = ({ session, isLive = false }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group ${
      isLive ? 'ring-2 ring-red-200' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isLive && (
              <div className="flex items-center bg-red-100 px-2 py-1 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs font-medium text-red-600 uppercase">Live</span>
              </div>
            )}
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
              {session.course_name || session.CourseName || session.courseName || 'General Session'}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2">{session.title || session.Title || session.Name || session.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{session.description || session.Description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{formatTime(session.start_time || session.StartTime)}</span>
            </div>
            <div className="flex items-center">
              <Users size={12} className="mr-1" />
              <span>{session.teacher_name || session.TeacherName}</span>
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          {isLive ? (
            <button
              onClick={() => handleJoinSession(session.id || session.ID)}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Play size={14} />
              Join Live
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <Video size={14} />
              Scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const selectedDateSessions = getSessionsForDate(selectedDate);
  const todaySessions = getSessionsForDate(new Date());

  // Show loading state
  if (profileLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (sessionsError) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-red-600 mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">Failed to load sessions: {sessionsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
            <p className="text-gray-600">Manage your sessions and appointments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-600 p-3 rounded-xl">
                <Play size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{liveSessions?.length || 0}</p>
              <p className="text-sm font-medium text-gray-600">Live Sessions</p>
              <p className="text-xs text-red-600">Join now</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <CalendarIcon size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{upcomingSessions?.length || 0}</p>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-xs text-emerald-600">This week</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <BookOpen size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{todaySessions.length}</p>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-xs text-emerald-600">Sessions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">8h</p>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-xs text-emerald-600">Study time</p>
            </div>
          </div>
        </div>

        {/* Live Sessions Alert */}
        {liveSessions?.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-4">
                  <Play size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {liveSessions.length} Live Session(s) Now
                  </h3>
                  <p className="text-sm text-red-700">
                    Join your live sessions before they end
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {liveSessions.slice(0, 2).map(session => (
                  <button
                    key={session.id || session.ID}
                    onClick={() => handleJoinSession(session.id || session.ID)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 hover:scale-105 transition-all duration-200"
                  >
                    Join {session.title || session.Title || session.Name || session.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((date, index) => {
                  const sessionsForDate = getSessionsForDate(date);
                  const hasLiveSessions = date && sessionsForDate.some(s => 
                    liveSessions?.some(live => live.id === s.id)
                  );

                  return (
                    <button
                      key={index}
                      onClick={() => date && setSelectedDate(date)}
                      className={`
                        aspect-square p-3 text-sm rounded-xl transition-all relative
                        ${!date ? '' : 
                          isToday(date) ? 'bg-blue-100 text-blue-600 font-semibold' :
                          isSelectedDate(date) ? 'bg-blue-600 text-white' :
                          'hover:bg-gray-100 text-gray-700'
                        }
                        ${!date ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      disabled={!date}
                    >
                      {date?.getDate()}
                      {sessionsForDate.length > 0 && (
                        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                          hasLiveSessions ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sessions Sidebar */}
          <div className="space-y-6">
            {/* Today's Sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Sessions
              </h3>
              {todaySessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No sessions today</p>
                  <p className="text-xs text-gray-400">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map(session => {
                    const isLive = liveSessions?.some(live => (live.id || live.ID) === (session.id || session.ID));
                    return (
                      <SessionCard key={session.id || session.ID} session={session} isLive={isLive} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Date Sessions */}
            {!isToday(selectedDate) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
                {selectedDateSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No sessions on this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSessions.map(session => (
                      <SessionCard key={session.id || session.ID} session={session} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Live Session Modal */}
      {activeSessionId && (
        <LiveSession 
          sessionId={activeSessionId} 
          onLeave={handleLeaveSession}
        />
      )}
    </div>
  );
};

export default Schedule;
