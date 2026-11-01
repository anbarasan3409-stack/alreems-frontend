import React, { useState } from 'react';
import Topbar from './Topbar';
import Overview from './Overview';
import MyCourses from './MyCourses';
import Schedule from './Schedule';
import Progress from './Progress';
import Achievements from './Achievements';
import Messages from './Messages';

const StudentDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <Overview />;
      case 'courses':
        return <MyCourses searchQuery={searchQuery} />;
      case 'schedule':
        return <Schedule />;
      case 'progress':
        return <Progress />;
      case 'achievements':
        return <Achievements />;
      case 'messages':
        return <Messages searchQuery={searchQuery} />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default StudentDashboard;
