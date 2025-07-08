"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

interface LearningPath {
  selectedAreas: {
    technicalSkills: boolean;
    behavioralQuestions: boolean;
    practicalProjects: boolean;
  };
  progress: {
    technicalSkills: { completed: number; total: number; };
    behavioralQuestions: { completed: number; total: number; };
    practicalProjects: { completed: number; total: number; };
  };
  overallProgress: number;
  currentLevel: string;
}

interface RecentEvent {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'learning' | 'personal' | 'work' | 'deadline' | 'meeting' | 'other';
  location?: string;
  color: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchLearningPath();
    fetchRecentEvents();
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
      // If profile fetch fails, try to get basic user info from token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPath = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/learning-path', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/calendar/recent?limit=3', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching recent events:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const hasActiveLearningPath = () => {
    return learningPath && Object.values(learningPath.selectedAreas).some(Boolean);
  };

  const getEventTypeLabel = (type: RecentEvent['type']) => {
    const typeLabels = {
      'learning': '学习计划',
      'personal': '个人事务',
      'work': '工作安排',
      'deadline': '截止日期',
      'meeting': '会议',
      'other': '其他'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <Link href="/dashboard" className="text-teal-600 font-medium">Home</Link>
          <Link href="/learning-path" className="text-gray-700 hover:text-teal-600">Learning Path</Link>
          <Link href="/calendar" className="text-gray-700 hover:text-teal-600">Calendar</Link>
          <Link href="/achievements" className="text-gray-700 hover:text-teal-600">Achievements</Link>
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
            <span className={`text-sm relative group cursor-pointer ${user?.careerStage === 'shining' ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
              Shining Galaxy
              {/* Coming Soon Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Coming Soon
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
              </div>
            </span>
          </div>
          
          {/* User Avatar/Initials */}
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
            
            {/* Dropdown Menu */}
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

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          {hasActiveLearningPath() ? (
            <>
              <p className="text-gray-600">Continue your career development journey. You've completed {learningPath?.overallProgress || 0}% of your learning path.</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-300" 
                  style={{ width: `${learningPath?.overallProgress || 0}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Current Level: <span className="font-medium text-teal-600">{learningPath?.currentLevel || 'Beginner'}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600">Start your career development journey! Create a personalized learning path to enhance your skills.</p>
              <div className="mt-4">
                <Link 
                  href="/learning-path" 
                  className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Create Learning Path
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Learning Path Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-teal-600 text-white py-3 px-4">
              <h2 className="text-lg font-semibold">My Learning Path</h2>
            </div>
            <div className="p-4">
              {hasActiveLearningPath() ? (
                <>
                  {learningPath?.selectedAreas.technicalSkills && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Technical Skills</span>
                        <span className="text-sm text-gray-500">
                          {getProgressPercentage(
                            learningPath.progress.technicalSkills.completed,
                            learningPath.progress.technicalSkills.total
                          )}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${getProgressPercentage(
                              learningPath.progress.technicalSkills.completed,
                              learningPath.progress.technicalSkills.total
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {learningPath.progress.technicalSkills.completed} / {learningPath.progress.technicalSkills.total} completed
                      </div>
                    </div>
                  )}
                  
                  {learningPath?.selectedAreas.behavioralQuestions && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Behavioral Interview</span>
                        <span className="text-sm text-gray-500">
                          {getProgressPercentage(
                            learningPath.progress.behavioralQuestions.completed,
                            learningPath.progress.behavioralQuestions.total
                          )}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${getProgressPercentage(
                              learningPath.progress.behavioralQuestions.completed,
                              learningPath.progress.behavioralQuestions.total
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {learningPath.progress.behavioralQuestions.completed} / {learningPath.progress.behavioralQuestions.total} completed
                      </div>
                    </div>
                  )}
                  
                  {learningPath?.selectedAreas.practicalProjects && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Practical Projects</span>
                        <span className="text-sm text-gray-500">
                          {getProgressPercentage(
                            learningPath.progress.practicalProjects.completed,
                            learningPath.progress.practicalProjects.total
                          )}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${getProgressPercentage(
                              learningPath.progress.practicalProjects.completed,
                              learningPath.progress.practicalProjects.total
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {learningPath.progress.practicalProjects.completed} / {learningPath.progress.practicalProjects.total} completed
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No learning path created yet</p>
                  <Link 
                    href="/learning-path" 
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Create Now →
                  </Link>
                </div>
              )}
              
              <Link href="/learning-path" className="block text-center py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition">
                {hasActiveLearningPath() ? 'View Detailed Path' : 'Create Learning Path'}
              </Link>
            </div>
          </div>

          {/* Activity Center Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-600 text-white py-3 px-4">
              <h2 className="text-lg font-semibold">Upcoming Activities</h2>
            </div>
            <div className="p-4">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">No upcoming activities</p>
                  <Link 
                    href="/calendar" 
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    Add your first event →
                  </Link>
                </div>
              ) : (
                <>
                  {recentEvents.map((event, index) => (
                    <div 
                      key={event._id} 
                      className="mb-4 border-l-4 pl-3 last:mb-0"
                      style={{ borderLeftColor: event.color }}
                    >
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {format(new Date(event.startDate), 'MMM dd')} {event.startTime}-{event.endTime}
                      </div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
              
              <Link href="/calendar" className="block text-center py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition mt-4">
                {recentEvents.length === 0 ? 'Create Events' : 'View All Events'}
              </Link>
            </div>
          </div>

          {/* Achievements and Badges Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-600 text-white py-3 px-4">
              <h2 className="text-lg font-semibold">My Achievements</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-1">
                    <span className="text-purple-600 text-lg">🚀</span>
                  </div>
                  <span className="text-xs text-center">Getting Started</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                    hasActiveLearningPath() ? 'bg-purple-100' : 'bg-gray-100 opacity-40'
                  }`}>
                    <span className={`text-lg ${hasActiveLearningPath() ? 'text-purple-600' : 'text-gray-400'}`}>📚</span>
                  </div>
                  <span className={`text-xs text-center ${hasActiveLearningPath() ? '' : 'text-gray-400'}`}>Learning Path</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                    (learningPath?.overallProgress || 0) >= 50 ? 'bg-purple-100' : 'bg-gray-100 opacity-40'
                  }`}>
                    <span className={`text-lg ${(learningPath?.overallProgress || 0) >= 50 ? 'text-purple-600' : 'text-gray-400'}`}>🏆</span>
                  </div>
                  <span className={`text-xs text-center ${(learningPath?.overallProgress || 0) >= 50 ? '' : 'text-gray-400'}`}>Halfway Hero</span>
                </div>
              </div>
              
              <div className="mt-6">
                {hasActiveLearningPath() ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                       Next Goal: Complete 80% of learning path
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((learningPath?.overallProgress || 0) / 80 * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-1">
                      {learningPath?.overallProgress || 0}% / 80%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Create a learning path to start your achievement journey</p>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-gray-300 rounded-full w-0"></div>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-1">0%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Inspirational Quote Area */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-8 border-l-4 border-purple-500">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 text-purple-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
            </div>
            <blockquote className="text-lg md:text-xl font-medium text-gray-800 mb-4 italic leading-relaxed">
              "Define success on your own terms, achieve it by your own rules and build a life you're proud to live."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-1 h-1 bg-purple-500 rounded-full mx-2"></div>
              <cite className="text-purple-600 font-semibold not-italic">Anne Sweeney</cite>
              <div className="w-1 h-1 bg-purple-500 rounded-full mx-2"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Former Co-Chair of Disney Media</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Image
                  src="/images/logo2.png"
                  alt="LyraTech Logo"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                <span className="text-xl font-semibold">LyraTech</span>
              </div>
              <p className="text-gray-400 mt-2 text-sm">Empowering women's career development in tech</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Platform</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/dashboard/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/dashboard/contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Resources</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/events" className="hover:text-white">Events</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Legal</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/dashboard/terms" className="hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/dashboard/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} LyraTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}