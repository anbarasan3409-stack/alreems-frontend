import { 
  BookOpen, Search, Play, Clock, Users, Star, TrendingUp, Award, 
  ChevronRight, Bell, Calendar, Target, Zap, Filter, Grid, List,
  BarChart3, Video, MessageCircle, Settings, User, Home, Menu
} from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Courses Enrolled', value: '12', change: '+2 this month', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Hours Learned', value: '156', change: '+24 this week', icon: Clock, color: 'bg-emerald-500' },
    { label: 'Certificates', value: '8', change: '+1 this week', icon: Award, color: 'bg-purple-500' },
    { label: 'Study Streak', value: '15', change: 'days in a row', icon: Zap, color: 'bg-orange-500' }
  ];

  const recentCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      progress: 75,
      nextLesson: 'Context API Deep Dive',
      instructor: 'Sarah Chen',
      thumbnail: 'bg-gradient-to-br from-blue-400 to-blue-600',
      timeLeft: '2h 30m',
      category: 'Frontend'
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      progress: 45,
      nextLesson: 'Neural Networks Intro',
      instructor: 'Dr. Michael Torres',
      thumbnail: 'bg-gradient-to-br from-green-400 to-green-600',
      timeLeft: '4h 15m',
      category: 'AI/ML'
    },
    {
      id: 3,
      title: 'UI/UX Design Mastery',
      progress: 90,
      nextLesson: 'Final Project Review',
      instructor: 'Emma Rodriguez',
      thumbnail: 'bg-gradient-to-br from-pink-400 to-pink-600',
      timeLeft: '45m',
      category: 'Design'
    },
    {
      id: 4,
      title: 'Python Data Science',
      progress: 60,
      nextLesson: 'Pandas Advanced',
      instructor: 'Alex Kumar',
      thumbnail: 'bg-gradient-to-br from-purple-400 to-purple-600',
      timeLeft: '3h 20m',
      category: 'Data Science'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      type: 'live',
      title: 'React Hooks Workshop',
      time: '2:00 PM Today',
      instructor: 'Sarah Chen',
      participants: 127
    },
    {
      id: 2,
      type: 'assignment',
      title: 'ML Project Submission',
      time: 'Due Tomorrow',
      course: 'Machine Learning Fundamentals'
    },
    {
      id: 3,
      type: 'quiz',
      title: 'Design Principles Quiz',
      time: 'Thursday 3:00 PM',
      course: 'UI/UX Design Mastery'
    },
    {
      id: 4,
      type: 'live',
      title: 'Data Visualization Masterclass',
      time: 'Friday 1:00 PM',
      instructor: 'Alex Kumar',
      participants: 89
    }
  ];

  const achievements = [
    { title: 'Fast Learner', description: 'Completed 5 courses in 30 days', icon: Zap, earned: true },
    { title: 'Consistent Student', description: '30-day learning streak', icon: Target, earned: true },
    { title: 'Community Helper', description: 'Helped 10+ students', icon: Users, earned: false },
    { title: 'Expert Level', description: 'Complete advanced course', icon: Award, earned: false }
  ];

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
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
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

  const AchievementBadge = ({ achievement }) => (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      achievement.earned 
        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="text-center">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
          achievement.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
        }`}>
          <achievement.icon size={24} />
        </div>
        <h4 className={`font-medium mb-1 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h4>
        <p className={`text-xs ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good morning, Alex!</h1>
                <p className="text-gray-500">Ready to continue your learning journey?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={24} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeView === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8 space-y-8">
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
              <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                View All Courses <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="p-6">
                  <div className="space-y-2">
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <button className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={24} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Browse All Courses</h4>
                    <p className="text-sm text-gray-500">Discover new learning paths</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 ml-auto" />
                </button>
                
                <button className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 flex items-center gap-4">
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

        {/* Achievements Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;