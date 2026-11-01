import React from 'react';
import { 
  BookOpen, Calendar, User, Award, MessageCircle, Settings, 
  LogOut, Home, BarChart3, Video, Bell, HelpCircle 
} from 'lucide-react';
import { useStudentProfile } from '../../hooks/useStudentAPI.js';

const sidebarItems = [
  { id: 'overview', icon: Home, label: 'Dashboard', section: 'main' },
  { id: 'courses', icon: BookOpen, label: 'My Courses', section: 'main' },
  { id: 'schedule', icon: Calendar, label: 'Schedule', section: 'main' },
  { id: 'live-sessions', icon: Video, label: 'Live Sessions', section: 'main' },
  { id: 'progress', icon: BarChart3, label: 'Progress', section: 'main' },
  { id: 'achievements', icon: Award, label: 'Achievements', section: 'main' },
  { id: 'messages', icon: MessageCircle, label: 'Messages', section: 'main' },
  { id: 'profile', icon: User, label: 'Profile', section: 'account' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', section: 'account' },
];

const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
  const { profile } = useStudentProfile();

  const handleNavigation = (viewId) => {
    setActiveView(viewId);
    if (onClose) onClose(); // Close mobile sidebar
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  const mainItems = sidebarItems.filter(item => item.section === 'main');
  const accountItems = sidebarItems.filter(item => item.section === 'account');

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Alreems</span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="mt-8 px-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name || 'Student'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.email || 'student@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`${
                    activeView === item.id
                      ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-150`}
                >
                  <item.icon
                    className={`${
                      activeView === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Account Section */}
            <div className="pt-8">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </p>
              <div className="mt-2 space-y-1">
                {accountItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`${
                      activeView === item.id
                        ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-150`}
                  >
                    <item.icon
                      className={`${
                        activeView === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 px-2 pb-4">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-150"
            >
              <LogOut className="text-gray-400 group-hover:text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 flex z-40 ${isOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity ease-linear duration-300`} onClick={onClose} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white ${isOpen ? 'translate-x-0' : '-translate-x-full'} ease-in-out duration-300 transform`}>
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Same content as desktop sidebar */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Alreems</span>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`${
                    activeView === item.id
                      ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left`}
                >
                  <item.icon
                    className={`${
                      activeView === item.id ? 'text-blue-600' : 'text-gray-400'
                    } mr-4 flex-shrink-0 h-6 w-6`}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-red-600">Sign out</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
