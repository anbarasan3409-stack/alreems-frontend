import React, { useState } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Zap,
  Users
} from 'lucide-react';
import { useStudentProfile, useEnrolledCourses, useStudentAnalytics, useStudentWeeklyActivity, useStudentAttendance } from '../hooks/useStudentAPI.js';

const Progress = () => {
  const { profile } = useStudentProfile();
  const studentId = profile?.id || profile?.ID;
  const { enrolledCourses } = useEnrolledCourses(studentId);
  const { analytics } = useStudentAnalytics(studentId);
  const { weeklyActivity } = useStudentWeeklyActivity(studentId);
  const { attendance } = useStudentAttendance(studentId);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

  // Calculate progress statistics
  const calculateStats = () => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalLessons: 0,
        completedLessons: 0,
        weeklyProgress: 0
      };
    }

    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => (course.progress || 0) >= 100).length;
    const averageProgress = Math.round(
      enrolledCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / totalCourses
    );
    const totalLessons = enrolledCourses.reduce((acc, course) => acc + (course.total_lessons || 10), 0);
    const completedLessons = enrolledCourses.reduce((acc, course) => acc + (course.completed_lessons || 0), 0);

    return {
      totalCourses,
      completedCourses,
      averageProgress,
      totalLessons,
      completedLessons,
      weeklyProgress: 0
    };
  };

  const stats = calculateStats();

  // Use real weekly data from backend, default to zeroed array if loading
  const displayWeeklyData = weeklyActivity && weeklyActivity.length > 0 
    ? weeklyActivity 
    : Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        progress: 0,
        hours: 0,
        minutes: 0
      }));

  const CourseProgressCard = ({ course }) => {
    const progress = course.progress || 0;
    const completedLessons = course.completed_lessons || 0;
    const totalLessons = course.total_lessons || 10;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {course.category || 'General'}
              </span>
              <div className={`text-xs px-2 py-1 rounded-lg ${
                progress >= 100 ? 'bg-green-100 text-green-700' :
                progress >= 50 ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {progress >= 100 ? 'Completed' : progress >= 50 ? 'In Progress' : 'Started'}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
            <p className="text-sm text-gray-600">{completedLessons}/{totalLessons} lessons completed</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
            <div className="text-xs text-gray-500">{course.hours_spent || 0}h studied</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Started: {new Date(course.created_at || Date.now()).toLocaleDateString()}</span>
          {progress >= 100 && <span className="text-green-600 font-medium">✓ Completed</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
            <p className="text-gray-600">Track your learning journey and achievements</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <BookOpen size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-xs text-emerald-600">+12% this month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <CheckCircle size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xs text-emerald-600">+8% this week</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</p>
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-xs text-emerald-600">+5% improvement</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-600 p-3 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {analytics ? Math.round(analytics.total_study_hours * 10) / 10 : 0}h
              </p>
              <p className="text-sm font-medium text-gray-600">Total Study Hours</p>
              <p className="text-xs text-red-600">Actual tracked time</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {displayWeeklyData.map((day, index) => {
                // Calculate progress bar percentage (assuming 2 hours is 100% daily goal)
                const progressPct = Math.min(100, Math.round(((day.minutes || 0) / 120) * 100));
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {day.hours ? (Math.round(day.hours * 10) / 10) : 0}h
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total this week</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(displayWeeklyData.reduce((acc, day) => acc + (day.hours || 0), 0) * 10) / 10}h
                </span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
              <PieChart size={20} className="text-gray-400" />
            </div>
            
            {/* Progress Ring Visual */}
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.averageProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</div>
                    <div className="text-sm text-gray-500">Overall Progress</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.completedCourses} courses</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalCourses - stats.completedCourses} courses
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Total Lessons</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.completedLessons}/{stats.totalLessons}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Progress Details</h3>
          
          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
              <p className="text-gray-600 mb-6">Start learning to see your progress here</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
            <Users size={20} className="text-gray-400" />
          </div>
          
          {attendance && attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Session</th>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {attendance.slice(0, 10).map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-900">
                        {new Date(att.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600">
                        {att.Session?.Title || 'Unknown Session'}
                      </td>
                      <td className="py-3 text-gray-600">
                        {att.Session?.Course?.Name || 'Unknown Course'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          att.status === 'present' ? 'bg-green-100 text-green-700' :
                          att.status === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No attendance records</h3>
              <p className="text-sm text-gray-500">Your attendance history will appear here once classes start.</p>
            </div>
          )}
        </div>


      </main>
    </div>
  );
};

export default Progress;
