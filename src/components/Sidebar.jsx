import { User, LogOut, Globe } from 'lucide-react';

export default function Sidebar({ navItems, activeTab, setActiveTab, COLORS }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 shadow-sm border-r border-gray-200 flex flex-col z-10" style={{ backgroundColor: COLORS.white }}>
      {/* Logo */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-center gap-3">
          <img src="/assets/icons/logo.jpg" alt="Al Reems Logo" style={{ width: 120, height: 60, objectFit: 'contain' }} />
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                style={
                  activeTab === item.id
                    ? {
                        backgroundColor: COLORS.primary,
                        color: COLORS.white,
                        boxShadow: '0 4px 12px rgba(59, 2, 0, 0.15)',
                      }
                    : {
                        color: COLORS.textLight,
                      }
                }
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = '#F9FAFB';
                    e.target.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = COLORS.textLight;
                  }
                }}
              >
                {/* Show Globe icon for Sessions tab */}
                {item.id === 'sessions' ? <Globe size={20} /> : <Icon size={20} />}
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
      {/* User Profile */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` }}
          >
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: COLORS.text }}>Student Name</p>
            <p className="text-sm" style={{ color: COLORS.textLight }}>Premium Member</p>
          </div>
        </div>
        <button 
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium border"
          style={{ 
            backgroundColor: 'transparent',
            color: COLORS.primary,
            borderColor: COLORS.primary
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = COLORS.primary;
            e.target.style.color = COLORS.white;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = COLORS.primary;
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
