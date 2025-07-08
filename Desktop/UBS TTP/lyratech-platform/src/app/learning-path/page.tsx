"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { getResourcesForModule, getResourceTypeIcon, ADDITIONAL_RESOURCES } from '../../data/learningResources';
import { format } from 'date-fns';
import { BookOpenIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

interface LearningModule {
  name: string;
  completed: boolean;
  completedAt?: Date;
  projectUrl?: string;
}

interface ProgressArea {
  completed: number;
  total: number;
  modules: LearningModule[];
}

interface LearningPath {
  _id: string;
  selectedAreas: {
    technicalSkills: boolean;
    behavioralQuestions: boolean;
    practicalProjects: boolean;
  };
  progress: {
    technicalSkills: ProgressArea;
    behavioralQuestions: ProgressArea;
    practicalProjects: ProgressArea;
  };
  overallProgress: number;
  currentLevel: string;
  estimatedCompletionWeeks: number;
  customGoals: any[];
}

export default function LearningPathPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState({
    technicalSkills: false,
    behavioralQuestions: false,
    practicalProjects: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{area: string, index: number, module: LearningModule} | null>(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [selectedModuleResources, setSelectedModuleResources] = useState<{
    moduleName: string;
    resources: any;
  } | null>(null);
  const [selectedModuleForResources, setSelectedModuleForResources] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedModuleForSchedule, setSelectedModuleForSchedule] = useState<{
    name: string;
    category: string;
  } | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: false,
    frequency: 'weekly',
    interval: 1,
    endDate: '',
    reminder: true,
    minutesBefore: 30
  });

  useEffect(() => {
    fetchUserProfile();
    fetchLearningPath();
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

  const fetchLearningPath = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/learning-path', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
        
        // 检查是否需要设置模式
        const hasSelectedAreas = Object.values(data.learningPath.selectedAreas).some(Boolean);
        setIsSetupMode(!hasSelectedAreas);
        setSelectedAreas(data.learningPath.selectedAreas);
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (area: keyof typeof selectedAreas) => {
    setSelectedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  const handleSetupSubmit = async () => {
    const selectedCount = Object.values(selectedAreas).filter(Boolean).length;
    if (selectedCount < 2) {
      alert('Please select at least two learning areas');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selectedAreas,
          customGoals: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
        setIsSetupMode(false);
        alert('Learning path created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Creation failed, please try again');
      }
    } catch (error) {
      console.error('Setup error:', error);
      alert('Creation failed, please try again');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModuleToggle = (area: string, moduleIndex: number, module: LearningModule) => {
    if (area === 'practicalProjects' && !module.completed) {
      setSelectedModule({ area, index: moduleIndex, module });
      setProjectUrl(module.projectUrl || '');
      setShowModuleModal(true);
    } else {
      updateModuleStatus(area, moduleIndex, !module.completed);
    }
  };

  const showLearningResources = (area: string, moduleName: string) => {
    const resources = getResourcesForModule(area, moduleName);
    setSelectedModuleResources({
      moduleName,
      resources
    });
    setShowResourcesModal(true);
  };

  const updateModuleStatus = async (area: string, moduleIndex: number, completed: boolean, projectUrl?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/learning-path', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          area,
          moduleIndex,
          completed,
          projectUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleModalSubmit = () => {
    if (selectedModule) {
      updateModuleStatus(selectedModule.area, selectedModule.index, true, projectUrl);
      setShowModuleModal(false);
      setSelectedModule(null);
      setProjectUrl('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 添加学习计划到日历
  const addToCalendar = async () => {
    if (!selectedModuleForSchedule) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const eventData = {
        title: `Learning: ${selectedModuleForSchedule.name}`,
        description: `Learning Module: ${selectedModuleForSchedule.name}`,
        startDate: scheduleForm.date,
        endDate: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        type: 'learning',
        category: selectedModuleForSchedule.category,
        module: selectedModuleForSchedule.name,
        priority: 'medium',
        isRecurring: scheduleForm.isRecurring,
        recurrence: scheduleForm.isRecurring ? {
          frequency: scheduleForm.frequency,
          interval: scheduleForm.interval,
          endDate: scheduleForm.endDate,
          daysOfWeek: []
        } : undefined,
        reminder: {
          enabled: scheduleForm.reminder,
          method: 'email',
          minutesBefore: scheduleForm.minutesBefore
        },
        color: '#10B981'
      };

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setShowScheduleModal(false);
        setSelectedModuleForSchedule(null);
        resetScheduleForm();
        alert('Learning plan added to calendar!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add learning plan');
      }
    } catch (error) {
      console.error('Failed to add learning plan:', error);
      alert('Failed to add learning plan');
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: false,
      frequency: 'weekly',
      interval: 1,
      endDate: '',
      reminder: true,
      minutesBefore: 30
    });
  };

  // 计算选择的学习领域数量并返回相应的grid类名
  const getGridClassName = () => {
    if (!learningPath) return "grid gap-8";
    
    const selectedCount = Object.values(learningPath.selectedAreas).filter(Boolean).length;
    
    if (selectedCount === 2) {
      // 当只有两个选择时，使用更大的卡片并居中显示
      return "flex justify-center gap-12";
    } else if (selectedCount === 3) {
      // 三个选择时使用标准布局
      return "grid lg:grid-cols-2 xl:grid-cols-3 gap-8";
    } else {
      // 默认布局
      return "grid lg:grid-cols-2 xl:grid-cols-3 gap-8";
    }
  };

  // 计算单个卡片的样式类名
  const getCardClassName = () => {
    if (!learningPath) return "bg-white rounded-lg shadow-md overflow-hidden";
    
    const selectedCount = Object.values(learningPath.selectedAreas).filter(Boolean).length;
    
    if (selectedCount === 2) {
      // 当只有两个选择时，卡片更宽
      return "bg-white rounded-lg shadow-md overflow-hidden w-96 max-w-sm";
    } else {
      // 默认卡片样式
      return "bg-white rounded-lg shadow-md overflow-hidden";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading learning path...</p>
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
          <Link href="/learning-path" className="text-teal-600 font-medium">Learning Path</Link>
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
        {isSetupMode ? (
          /* Setup Mode */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Create Your Learning Path</h1>
                <p className="text-gray-600">Choose the areas you want to focus on for learning, and we'll create a personalized learning plan for you</p>
                <p className="text-sm text-teal-600 mt-2">* Please select at least two learning areas</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Technical Skills */}
                <div 
                  className={`border-2 rounded-lg p-6 transition-all ${
                    selectedAreas.technicalSkills 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Skills</h3>
                    <p className="text-sm text-gray-600 mb-4">Master programming languages, frameworks and development tools</p>
                    <div className="flex items-center justify-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAreas.technicalSkills}
                          onChange={() => handleAreaChange('technicalSkills')}
                          className="w-5 h-5 text-teal-600 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Select this area</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Behavioral Questions */}
                <div 
                  className={`border-2 rounded-lg p-6 transition-all ${
                    selectedAreas.behavioralQuestions 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Behavioral Interview</h3>
                    <p className="text-sm text-gray-600 mb-4">Improve communication, leadership and teamwork skills</p>
                    <div className="flex items-center justify-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAreas.behavioralQuestions}
                          onChange={() => handleAreaChange('behavioralQuestions')}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Select this area</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Practical Projects */}
                <div 
                  className={`border-2 rounded-lg p-6 transition-all ${
                    selectedAreas.practicalProjects 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Practical Projects</h3>
                    <p className="text-sm text-gray-600 mb-4">Apply your knowledge through real-world projects</p>
                    <div className="flex items-center justify-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAreas.practicalProjects}
                          onChange={() => handleAreaChange('practicalProjects')}
                          className="w-5 h-5 text-purple-600 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Select this area</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSetupSubmit}
                  disabled={isUpdating || Object.values(selectedAreas).filter(Boolean).length < 2}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Creating...' : 'Create Learning Path'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Learning Path Dashboard */
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">My Learning Path</h1>
                  <p className="text-gray-600">Continue your career development journey</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(learningPath?.currentLevel || 'Beginner')}`}>
                    {learningPath?.currentLevel || 'Beginner'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Estimated completion time: {learningPath?.estimatedCompletionWeeks || 12} weeks</p>
                </div>
              </div>
              
              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-500">{learningPath?.overallProgress || 0}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(learningPath?.overallProgress || 0)}`}
                    style={{ width: `${learningPath?.overallProgress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Learning Areas */}
            <div className={getGridClassName()}>
              {/* Technical Skills */}
              {learningPath?.selectedAreas.technicalSkills && (
                <div className={getCardClassName()}>
                  <div className="bg-teal-600 text-white py-4 px-6">
                    <h2 className="text-xl font-semibold">Technical Skills</h2>
                    <p className="text-teal-100 text-sm mt-1">
                      {learningPath.progress.technicalSkills.completed} / {learningPath.progress.technicalSkills.total} completed
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${learningPath.progress.technicalSkills.total > 0 
                              ? (learningPath.progress.technicalSkills.completed / learningPath.progress.technicalSkills.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {learningPath.progress.technicalSkills.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={module.completed}
                              onChange={() => handleModuleToggle('technicalSkills', index, module)}
                              className="w-4 h-4 text-teal-600 mr-3 cursor-pointer"
                            />
                            <span className={`text-sm ${module.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {module.name}
                            </span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => showLearningResources('technicalSkills', module.name)}
                              className="text-teal-600 hover:text-teal-800 p-1 rounded"
                              title="Recommended Learning Resources"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModuleForSchedule({
                                  name: module.name,
                                  category: 'technicalSkills'
                                });
                                setShowScheduleModal(true);
                              }}
                              className="text-teal-600 hover:text-teal-800 p-1 rounded"
                              title="Schedule Learning Time"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                            {module.completed && (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Behavioral Questions */}
              {learningPath?.selectedAreas.behavioralQuestions && (
                <div className={getCardClassName()}>
                  <div className="bg-blue-600 text-white py-4 px-6">
                    <h2 className="text-xl font-semibold">Behavioral Interview</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {learningPath.progress.behavioralQuestions.completed} / {learningPath.progress.behavioralQuestions.total} completed
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${learningPath.progress.behavioralQuestions.total > 0 
                              ? (learningPath.progress.behavioralQuestions.completed / learningPath.progress.behavioralQuestions.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {learningPath.progress.behavioralQuestions.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={module.completed}
                              onChange={() => handleModuleToggle('behavioralQuestions', index, module)}
                              className="w-4 h-4 text-blue-600 mr-3 cursor-pointer"
                            />
                            <span className={`text-sm ${module.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {module.name}
                            </span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => showLearningResources('behavioralQuestions', module.name)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              title="Recommended Learning Resources"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModuleForSchedule({
                                  name: module.name,
                                  category: 'behavioralQuestions'
                                });
                                setShowScheduleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              title="Schedule Learning Time"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                            {module.completed && (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Practical Projects */}
              {learningPath?.selectedAreas.practicalProjects && (
                <div className={getCardClassName()}>
                  <div className="bg-purple-600 text-white py-4 px-6">
                    <h2 className="text-xl font-semibold">Practical Projects</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      {learningPath.progress.practicalProjects.completed} / {learningPath.progress.practicalProjects.total} completed
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${learningPath.progress.practicalProjects.total > 0 
                              ? (learningPath.progress.practicalProjects.completed / learningPath.progress.practicalProjects.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {learningPath.progress.practicalProjects.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={module.completed}
                              onChange={() => handleModuleToggle('practicalProjects', index, module)}
                              className="w-4 h-4 text-purple-600 mr-3 cursor-pointer"
                            />
                            <span className={`text-sm ${module.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {module.name}
                            </span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => showLearningResources('practicalProjects', module.name)}
                              className="text-purple-600 hover:text-purple-800 p-1 rounded"
                              title="Recommended Learning Resources"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModuleForSchedule({
                                  name: module.name,
                                  category: 'practicalProjects'
                                });
                                setShowScheduleModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-800 p-1 rounded"
                              title="Schedule Learning Time"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                            {module.projectUrl && (
                              <a 
                                href={module.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                            {module.completed && (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Resources Section */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Learning Resources</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Women in Tech Communities */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-600 mb-4">👩‍💻 Women in Tech Communities</h3>
                  <div className="space-y-3">
                    {ADDITIONAL_RESOURCES.womenInTech.map((resource, index) => (
                      <div key={index} className="border-l-4 border-pink-300 pl-4">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 font-medium block"
                        >
                          {resource.name}
                        </a>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Development */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">📚 Career Development</h3>
                  <div className="space-y-3">
                    {ADDITIONAL_RESOURCES.careerDevelopment.map((resource, index) => (
                      <div key={index} className="border-l-4 border-blue-300 pl-4">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium block"
                        >
                          {resource.name}
                        </a>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Preparation */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-4">💡 Interview Preparation</h3>
                  <div className="space-y-3">
                    {ADDITIONAL_RESOURCES.interviewPrep.map((resource, index) => (
                      <div key={index} className="border-l-4 border-green-300 pl-4">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 font-medium block"
                        >
                          {resource.name}
                        </a>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSetupMode(true)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Modify Learning Areas
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Project URL Modal */}
      {showModuleModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Project: {selectedModule.module.name}</h3>
            <p className="text-gray-600 mb-4">Please provide your project link (GitHub, demo website, etc.):</p>
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://github.com/yourname/project"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModuleModal(false);
                  setSelectedModule(null);
                  setProjectUrl('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Resources Modal */}
      {showResourcesModal && selectedModuleResources && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Learning Resources: {selectedModuleResources.moduleName}
              </h3>
              <button
                onClick={() => setShowResourcesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Primary Resources */}
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-4">📚 Primary Learning Resources</h4>
                <div className="space-y-3">
                  {selectedModuleResources.resources.primary.map((resource: any, index: number) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getResourceTypeIcon(resource.type)}</span>
                          <div>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {resource.name}
                            </a>
                            <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Resources */}
              <div>
                <h4 className="text-lg font-semibold text-red-600 mb-4">🎥 Video Tutorials</h4>
                <div className="space-y-3">
                  {selectedModuleResources.resources.video.map((resource: any, index: number) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getResourceTypeIcon(resource.type)}</span>
                          <div>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              {resource.name}
                            </a>
                            <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowResourcesModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 学习计划模态框 */}
      {showScheduleModal && selectedModuleForSchedule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Learning Time</h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedModuleForSchedule(null);
                  resetScheduleForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Schedule learning time for <span className="font-medium text-gray-900">{selectedModuleForSchedule.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* 日期和时间 */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                    className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                      className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                      className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* 重复设置 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleForm.isRecurring}
                    onChange={(e) => setScheduleForm({...scheduleForm, isRecurring: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Recurring Learning</span>
                </label>
              </div>

              {scheduleForm.isRecurring && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={scheduleForm.frequency}
                        onChange={(e) => setScheduleForm({...scheduleForm, frequency: e.target.value})}
                        className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={scheduleForm.interval}
                        onChange={(e) => setScheduleForm({...scheduleForm, interval: parseInt(e.target.value)})}
                        className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date for Recurrence
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.endDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                      className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* 提醒设置 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleForm.reminder}
                    onChange={(e) => setScheduleForm({...scheduleForm, reminder: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Enable Email Reminder</span>
                </label>
              </div>

              {scheduleForm.reminder && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Time (minutes before)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={scheduleForm.minutesBefore}
                    onChange={(e) => setScheduleForm({...scheduleForm, minutesBefore: parseInt(e.target.value)})}
                    className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            {/* 按钮区域 */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedModuleForSchedule(null);
                  resetScheduleForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addToCalendar}
                disabled={!scheduleForm.date || !scheduleForm.startTime || !scheduleForm.endTime}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 