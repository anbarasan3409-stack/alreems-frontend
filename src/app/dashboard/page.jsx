'use client';
import { 
  BookOpen, Search, Clock, Users, Star, TrendingUp, Award, 
  ChevronRight, Bell, Calendar, Target, Zap, Filter, Grid, List,
  BarChart3, Video, MessageCircle, Settings, User, Home, Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import Topbar from '../../components/Topbar';
import MyCourses from '../../components/MyCourses';
import Schedule from '../../components/Schedule';
import Progress from '../../components/Progress';
import Achievements from '../../components/Achievements';
import Feedback from '../../components/Feedback';
import { studentService, sessionService } from '@/services/apiService';
import { useStudentAnalytics } from '@/hooks/useStudentAPI';
import { useStudyTracker } from '@/hooks/useStudyTracker';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  
  // Profile status hook
  const {
    profileStatus,
    loading: profileLoading,
    error: profileError,
    showModal: showProfileModal,
    updateProfile,
    closeModal: closeProfileModal,
  } = useProfileStatus();

  // Auth context
  const { user, isAuthenticated } = useAuth();
  
  // Analytics
  const studentId = user?.ID || user?.id;
  const { analytics } = useStudentAnalytics(studentId);
  
  // Start tracking study time (ping every 5 minutes while dashboard is open)
  useStudyTracker(true, 5);

  // Fetch enrolled courses when user is authenticated
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user || !user.ID || !isAuthenticated) {
        setCoursesLoading(false);
        return;
      }

      try {
        setCoursesLoading(true);
        setCoursesError(null);
        
        // Fetch courses and sessions in parallel
        const [courses, sessions] = await Promise.all([
          studentService.getEnrolledCourses(user.ID),
          sessionService.getUpcomingSessions()
        ]);
        
        if (courses && Array.isArray(courses)) {
          // Transform the data to match the expected format for CourseCard
          const transformedCourses = courses.map(course => ({
            id: course.id || course.ID,
            title: course.name || course.title,
            progress: course.progress || 0,
            nextLesson: course.next_lesson || 'Start Course',
            instructor: course.teacher_name || course.instructor || 'Instructor',
            thumbnail: course.thumbnail || 'bg-gradient-to-br from-secondary to-secondary/50',
            timeLeft: course.time_left || 'N/A',
            category: course.category || course.subject || 'General'
          }));
          
          setEnrolledCourses(transformedCourses);
        } else {
          setEnrolledCourses([]);
        }

        if (sessions && Array.isArray(sessions)) {
          setUpcomingSessions(sessions.slice(0, 3)); // show top 3 upcoming sessions
        } else {
          setUpcomingSessions([]);
        }
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
        setCoursesError('Failed to load enrolled courses');
        setEnrolledCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, isAuthenticated]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewContent />;
      case 'courses':
        return <MyCourses searchQuery={searchQuery} />;
      case 'schedule':
        return <Schedule />;
      case 'progress':
        return <Progress />;
      case 'feedback':
        return <Feedback />;
      default:
        return <OverviewContent />;
    }
  };

  const OverviewContent = () => {
    const activeCoursesCount = enrolledCourses.filter(c => c.progress < 100).length;
    const completedCoursesCount = enrolledCourses.filter(c => c.progress === 100).length;

    const stats = [
      { label: 'Courses Enrolled', value: enrolledCourses.length.toString(), change: 'Total enrolled', icon: BookOpen, color: 'bg-blue-600' },
      { label: 'Active Courses', value: activeCoursesCount.toString(), change: 'Currently in progress', icon: Target, color: 'bg-orange-600' },
      { label: 'Study Streak', value: `${analytics?.current_streak || 0} Days`, change: `Longest: ${analytics?.longest_streak || 0}`, icon: Zap, color: 'bg-yellow-500' },
      { label: 'Upcoming Sessions', value: upcomingSessions.length.toString(), change: 'Scheduled classes', icon: Video, color: 'bg-emerald-600' }
    ];

    // Use enrolled courses instead of hardcoded data
    const recentCourses = enrolledCourses.slice(0, 4); // Show only first 4 courses

    const formattedUpcomingEvents = upcomingSessions.map(session => ({
      id: session.id,
      type: 'live',
      title: session.title,
      time: new Date(session.start_time).toLocaleString(undefined, { 
        weekday: 'short', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }),
      instructor: session.teacher_name,
      participants: session.max_students || 'Unlimited'
    }));

  const navItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'courses', icon: BookOpen, label: 'My Courses' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'progress', icon: BarChart3, label: 'Progress' },
    { id: 'achievements', icon: Award, label: 'Achievements' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' }
  ];

  const StatsCard = ({ stat }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon size={24} className="text-white" />
        </div>
        <TrendingUp size={16} className="text-emerald-500" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
        <p className="text-xs text-emerald-600">{stat.change}</p>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 ${course.thumbnail} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <BookOpen size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            {course.category}
          </span>
          <h3 className="font-semibold text-gray-900 mt-2 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-500">by {course.instructor}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-secondary to-secondary/50 h-2 rounded-full transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        event.type === 'live' ? 'bg-red-100 text-red-600' :
        event.type === 'assignment' ? 'bg-orange-100 text-orange-600' :
        'bg-blue-100 text-blue-600'
      }`}>
        {event.type === 'live' ? <Video size={20} /> :
         event.type === 'assignment' ? <BookOpen size={20} /> :
         <Clock size={20} />}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
        <p className="text-sm text-gray-500 mb-2">{event.time}</p>
        {event.instructor && (
          <p className="text-xs text-gray-400">with {event.instructor} • {event.participants} participants</p>
        )}
        {event.course && (
          <p className="text-xs text-gray-400">{event.course}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  );

    return (
      <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
              <button 
                onClick={() => setActiveView('courses')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
              >
                View All Courses <ChevronRight size={16} />
              </button>
            </div>
            
            {coursesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : coursesError ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="text-red-500 mb-2">
                  <BookOpen size={48} className="mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Courses</h3>
                <p className="text-gray-500 mb-4">{coursesError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : recentCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="text-gray-400 mb-4">
                  <BookOpen size={48} className="mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses Yet</h3>
                <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course</p>
                <button 
                  onClick={() => setActiveView('courses')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="space-y-8">
                {/* Upcoming Events */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
                  <div className="space-y-2">
                    {formattedUpcomingEvents.length > 0 ? formattedUpcomingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    )) : (
                      <p className="text-sm text-gray-500">No upcoming events scheduled.</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setActiveView('courses')}
                      className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <BookOpen size={24} className="text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Browse All Courses</h4>
                        <p className="text-sm text-gray-500">Discover new learning paths</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 ml-auto" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveView('schedule')}
                      className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Calendar size={24} className="text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">My Schedule</h4>
                        <p className="text-sm text-gray-500">View upcoming sessions</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 ml-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header & Navigation */}
      <Topbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      {/* Main Content */}
      {renderActiveView()}
      
      {/* Profile Completion Modal */}
      {profileStatus && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={closeProfileModal}
          onComplete={updateProfile}
          profileData={profileStatus.profile}
          missingFields={profileStatus.missingFields}
          completionPercentage={profileStatus.completionPercentage}
        />
      )}
    </div>
  );
};

const ProtectedDashboard = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default ProtectedDashboard;