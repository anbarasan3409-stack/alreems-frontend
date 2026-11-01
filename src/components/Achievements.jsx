import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Target, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Zap,
  Crown,
  Shield,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useStudentProfile, useEnrolledCourses } from '../hooks/useStudentAPI.js';

const Achievements = () => {
  const { profile } = useStudentProfile();
  const { enrolledCourses } = useEnrolledCourses(profile?.id);
  const [activeCategory, setActiveCategory] = useState('all');

  // Mock achievements data - in real app this would come from API
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      icon: Star,
      category: "beginner",
      earned: true,
      earnedDate: "2024-01-15",
      rarity: "common",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      points: 10
    },
    {
      id: 2,
      title: "Course Crusher",
      description: "Complete 5 courses",
      icon: Trophy,
      category: "learning",
      earned: false,
      progress: 60,
      total: 5,
      current: 3,
      rarity: "rare",
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      points: 50
    },
    {
      id: 3,
      title: "Night Owl",
      description: "Study for 3 hours after 10 PM",
      icon: Crown,
      category: "habits",
      earned: true,
      earnedDate: "2024-01-20",
      rarity: "epic",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      points: 25
    },
    {
      id: 4,
      title: "Streak Master",
      description: "Maintain a 30-day learning streak",
      icon: Flame,
      category: "consistency",
      earned: false,
      progress: 75,
      total: 30,
      current: 22,
      rarity: "legendary",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      points: 100
    },
    {
      id: 5,
      title: "Speed Runner",
      description: "Complete a course in under 24 hours",
      icon: Zap,
      category: "special",
      earned: true,
      earnedDate: "2024-01-18",
      rarity: "rare",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      points: 30
    },
    {
      id: 6,
      title: "Scholar",
      description: "Score 95% or higher on 10 assessments",
      icon: Medal,
      category: "excellence",
      earned: false,
      progress: 40,
      total: 10,
      current: 4,
      rarity: "epic",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      points: 75
    }
  ];

  const categories = [
    { id: 'all', name: 'All Achievements', count: achievements.length },
    { id: 'beginner', name: 'Beginner', count: achievements.filter(a => a.category === 'beginner').length },
    { id: 'learning', name: 'Learning', count: achievements.filter(a => a.category === 'learning').length },
    { id: 'habits', name: 'Habits', count: achievements.filter(a => a.category === 'habits').length },
    { id: 'consistency', name: 'Consistency', count: achievements.filter(a => a.category === 'consistency').length },
    { id: 'excellence', name: 'Excellence', count: achievements.filter(a => a.category === 'excellence').length },
    { id: 'special', name: 'Special', count: achievements.filter(a => a.category === 'special').length }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === activeCategory);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'rare':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const AchievementCard = ({ achievement }) => {
    const Icon = achievement.icon;
    const isEarned = achievement.earned;
    
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        !isEarned ? 'opacity-75' : ''
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 rounded-2xl ${achievement.bgColor} flex items-center justify-center`}>
            <Icon size={32} className={achievement.iconColor} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRarityStyle(achievement.rarity)}`}>
              {achievement.rarity}
            </div>
            {isEarned && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <CheckCircle size={12} className="mr-1" />
                Earned
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>

          {!isEarned && achievement.progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {achievement.current}/{achievement.total}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${achievement.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <Star size={16} className="text-yellow-500 mr-1" />
              {achievement.points} points
            </div>
            {isEarned && achievement.earnedDate && (
              <div className="text-xs text-gray-500">
                {new Date(achievement.earnedDate).toLocaleDateString()}
              </div>
            )}
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            <p className="text-gray-600">Celebrate your learning milestones and accomplishments</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-yellow-600 p-3 rounded-xl">
                <Trophy size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{earnedAchievements.length}</p>
              <p className="text-sm font-medium text-gray-600">Achievements Earned</p>
              <p className="text-xs text-emerald-600">+2 this week</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <Star size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-xs text-emerald-600">+50 this month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Target size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}%
              </p>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-xs text-emerald-600">+15% improvement</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-600 p-3 rounded-xl">
                <Flame size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">22</p>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-xs text-emerald-600">8 days to go!</p>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <Crown size={32} className="text-white" />
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Current Level</div>
                <div className="text-3xl font-bold">Level 8</div>
                <div className="text-sm opacity-75">Advanced Learner</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Next Level</div>
              <div className="text-xl font-semibold">Level 9</div>
              <div className="text-sm opacity-75">200 XP to go</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>800 / 1000 XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeCategory === 'all' ? 'All Achievements' : categories.find(c => c.id === activeCategory)?.name}
            </h3>
            <div className="text-sm text-gray-600">
              {filteredAchievements.filter(a => a.earned).length} of {filteredAchievements.length} earned
            </div>
          </div>

          {filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements in this category</h3>
              <p className="text-gray-600">Check back later for new achievements!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Achievement Activity</h3>
          
          <div className="space-y-4">
            {earnedAchievements.slice(0, 5).map(achievement => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className={`w-12 h-12 rounded-xl ${achievement.bgColor} flex items-center justify-center mr-4`}>
                    <Icon size={20} className={achievement.iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">+{achievement.points} XP</div>
                    <div className="text-xs text-gray-500">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {earnedAchievements.length === 0 && (
            <div className="text-center py-8">
              <Medal size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No achievements earned yet. Start learning to unlock your first achievement!</p>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Weekly Leaderboard</h3>
                <p className="text-sm text-gray-600">See how you rank among your peers</p>
              </div>
            </div>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors font-medium text-sm flex items-center">
              View Full Leaderboard
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">#5</div>
              <div className="text-sm font-medium text-gray-700">Your Rank</div>
              <div className="text-xs text-gray-500 mt-1">Out of 127 students</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">85</div>
              <div className="text-sm font-medium text-gray-700">Points This Week</div>
              <div className="text-xs text-gray-500 mt-1">15 points to #4</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">3</div>
              <div className="text-sm font-medium text-gray-700">New Achievements</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Achievements;
