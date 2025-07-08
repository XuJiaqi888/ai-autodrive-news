"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  unlockedAt?: Date;
  locked?: boolean;
  currentValue?: number;
  maxValue?: number;
  progress?: number;
}

interface UserStats {
  totalModulesCompleted: number;
  totalSkillAreasExplored: number;
  overallProgress: number;
  currentLevel: string;
  technicalSkillsCompleted: number;
  behavioralQuestionsCompleted: number;
  practicalProjectsCompleted: number;
  streakDays: number;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<{
    unlockedAchievements: Achievement[];
    lockedAchievements: Achievement[];
    stats: UserStats;
    totalPoints: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewlyUnlocked, setShowNewlyUnlocked] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'getting_started', name: 'Getting Started', icon: '🚀' },
    { id: 'progress', name: 'Progress', icon: '📈' },
    { id: 'exploration', name: 'Exploration', icon: '🎯' },
    { id: 'technical', name: 'Technical', icon: '⚔️' },
    { id: 'behavioral', name: 'Behavioral', icon: '🗣️' },
    { id: 'practical', name: 'Practical', icon: '🏗️' },
    { id: 'mastery', name: 'Mastery', icon: '💎' },
    { id: 'consistency', name: 'Consistency', icon: '🔥' }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchAchievements();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/signin');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAchievements(result.data);
        
        // 显示新解锁的成就
        if (result.data.newlyUnlocked && result.data.newlyUnlocked.length > 0) {
          setNewlyUnlocked(result.data.newlyUnlocked);
          setShowNewlyUnlocked(true);
          setTimeout(() => setShowNewlyUnlocked(false), 5000);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredAchievements = (achievementList: Achievement[]) => {
    if (selectedCategory === 'all') return achievementList;
    return achievementList.filter(ach => ach.category === selectedCategory);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/logo1.png"
            alt="LyraTech Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-semibold text-teal-600">LyraTech</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/dashboard" className="text-gray-700 hover:text-teal-600">Home</Link>
          <Link href="/learning-path" className="text-gray-700 hover:text-teal-600">Learning Path</Link>
          <Link href="/calendar" className="text-gray-700 hover:text-teal-600">Calendar</Link>
          <Link href="/achievements" className="text-teal-600 font-medium">Achievements</Link>
          <Link href="/resources" className="text-gray-700 hover:text-teal-600">Resources</Link>
          <Link href="/blog" className="text-gray-700 hover:text-teal-600">Blog</Link>
          <Link href="/events" className="text-gray-700 hover:text-teal-600">Events</Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-full px-4 py-1 flex items-center space-x-2">
            <span className={`text-sm font-medium ${user?.careerStage === 'nextgen' ? 'text-gray-700' : 'text-gray-500'}`}>
              NextGen Stars
            </span>
            <span className="text-gray-400">|</span>
            <span className={`text-sm ${user?.careerStage === 'shining' ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
              Shining Galaxy
            </span>
          </div>
          
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center cursor-pointer">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-teal-600 font-medium">
                  {user?.lastName ? user.lastName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            
            <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible">
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Achievements</h1>
              <p className="text-gray-600">Track your learning journey and unlock rewards</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{achievements?.unlockedAchievements.length || 0}</p>
                  <p className="text-sm text-gray-500">Unlocked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{achievements?.totalPoints || 0}</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{achievements?.stats.currentLevel || 'Beginner'}</p>
                  <p className="text-sm text-gray-500">Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-lg font-semibold text-gray-800">{achievements?.stats.totalModulesCompleted || 0}</p>
            <p className="text-sm text-gray-600">Modules Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-lg font-semibold text-gray-800">{achievements?.stats.totalSkillAreasExplored || 0}</p>
            <p className="text-sm text-gray-600">Skill Areas</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-lg font-semibold text-gray-800">{achievements?.stats.overallProgress || 0}%</p>
            <p className="text-sm text-gray-600">Overall Progress</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl mb-2">🔥</div>
            <p className="text-lg font-semibold text-gray-800">{achievements?.stats.streakDays || 0}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Unlocked Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Unlocked Achievements</h2>
          {achievements?.unlockedAchievements && getFilteredAchievements(achievements.unlockedAchievements).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAchievements(achievements.unlockedAchievements).map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`border-2 rounded-lg p-6 ${getRarityColor(achievement.rarity)} hover:shadow-lg transition-shadow`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-medium ${getRarityTextColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-yellow-600 font-medium">+{achievement.points} pts</span>
                    </div>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Unlocked: {formatDate(achievement.unlockedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600">No unlocked achievements in this category yet.</p>
              <p className="text-sm text-gray-500 mt-2">Complete more learning activities to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Locked Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔒 Locked Achievements</h2>
          {achievements?.lockedAchievements && getFilteredAchievements(achievements.lockedAchievements).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAchievements(achievements.lockedAchievements).map((achievement, index) => (
                <div
                  key={achievement.id}
                  className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 opacity-75 hover:opacity-90 transition-opacity"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 grayscale">{achievement.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.currentValue || 0} / {achievement.maxValue}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, achievement.progress || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-500">
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-yellow-500 font-medium">+{achievement.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-600">All achievements unlocked in this category!</p>
              <p className="text-sm text-gray-500 mt-2">You're doing amazing! Keep up the great work.</p>
            </div>
          )}
        </div>
      </main>

      {/* Newly Unlocked Achievement Notification */}
      {showNewlyUnlocked && newlyUnlocked.length > 0 && (
        <div className="fixed top-20 right-4 z-50 bg-white border-l-4 border-teal-500 rounded-lg shadow-lg p-4 max-w-sm animate-bounce">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🎉</div>
            <div>
              <h4 className="font-semibold text-gray-800">Achievement Unlocked!</h4>
              <p className="text-sm text-gray-600">
                You've unlocked {newlyUnlocked.length} new achievement{newlyUnlocked.length > 1 ? 's' : ''}!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 