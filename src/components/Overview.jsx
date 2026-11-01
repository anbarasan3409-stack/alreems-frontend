import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Play, 
  TrendingUp, 
  Award,
  Users,
  Star
} from 'lucide-react';
import { useStudentProfile, useCourses, useEnrolledCourses, useSessions } from '../hooks/useStudentAPI.js';

const Overview = () => {
  const { profile, loading: profileLoading } = useStudentProfile();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrolledCourses } = useEnrolledCourses(profile?.id);
  const { liveSessions, upcomingSessions } = useSessions();

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses?.length || 0,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'Live Sessions',
      value: liveSessions?.length || 0,
      icon: Play,
      color: 'bg-red-50 text-red-600',
      bgColor: 'bg-red-600'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessions?.length || 0,
      icon: Calendar,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-600'
    },
    {
      title: 'Total Courses',
      value: courses?.length || 0,
      icon: Award,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.name}! 👋</h2>
            <p className="text-blue-100">Continue your learning journey and achieve your goals</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Sessions Alert */}
      {liveSessions?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Play size={16} className="text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Live Sessions Available
              </h3>
              <p className="text-sm text-red-700">
                You have {liveSessions.length} live session(s) happening now. Join them from the Schedule tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen size={20} className="text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Browse Courses</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={20} className="text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View Schedule</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp size={20} className="text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Check Progress</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {enrolledCourses?.slice(0, 3).map((course, index) => (
            <div key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{course.name}</p>
                <p className="text-xs text-gray-500">Enrolled course</p>
              </div>
              <div className="text-xs text-gray-400">
                Recently active
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Start by enrolling in a course!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
