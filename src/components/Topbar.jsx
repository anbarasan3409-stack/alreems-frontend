import { 
  Search, Bell, Settings, User, Home, BookOpen, Calendar, BarChart3, Award, MessageCircle, Menu, LogOut, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'overview', icon: Home, label: 'Overview' },
  { id: 'courses', icon: BookOpen, label: 'My Courses' },
  { id: 'schedule', icon: Calendar, label: 'Schedule' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
  { id: 'feedback', icon: Star, label: 'Feedback' },
];

const Topbar = ({ searchQuery, setSearchQuery, activeView, setActiveView }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-0 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Menu size={24} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good morning, {user?.name || 'Student'}!
              </h1>
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
                className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={24} />
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
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
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
  );
};

export default Topbar;
