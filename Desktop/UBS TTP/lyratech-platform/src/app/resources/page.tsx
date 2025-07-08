'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LEARNING_RESOURCES, ADDITIONAL_RESOURCES, getResourceTypeIcon } from '../../data/learningResources';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

export default function ResourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  
  // 新增：管理展开状态的state
  const [expandedPrimary, setExpandedPrimary] = useState<{[key: string]: boolean}>({});
  const [expandedVideo, setExpandedVideo] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchUserProfile();
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  // Get all modules with resources
  const getAllModulesWithResources = () => {
    const allModules: any[] = [];
    
    Object.entries(LEARNING_RESOURCES).forEach(([area, modules]) => {
      Object.entries(modules).forEach(([moduleName, resources]) => {
        allModules.push({
          area,
          moduleName,
          resources,
          category: area === 'technicalSkills' ? 'Technical Skills' : 
                   area === 'behavioralQuestions' ? 'Behavioral Interview' : 'Practical Projects'
        });
      });
    });
    
    return allModules;
  };

  // Filter resources
  const filterResources = () => {
    let filtered = getAllModulesWithResources();

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(module => {
        if (selectedCategory === 'technical') return module.area === 'technicalSkills';
        if (selectedCategory === 'behavioral') return module.area === 'behavioralQuestions';
        if (selectedCategory === 'projects') return module.area === 'practicalProjects';
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(module => 
        module.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.resources.primary.some((r: any) => r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        module.resources.video.some((r: any) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by resource type
    if (selectedResourceType !== 'all') {
      filtered = filtered.filter(module => {
        const allResources = [...module.resources.primary, ...module.resources.video];
        return allResources.some((r: any) => r.type === selectedResourceType);
      });
    }

    return filtered;
  };

  const getUniqueResourceTypes = () => {
    const types = new Set();
    getAllModulesWithResources().forEach(module => {
      [...module.resources.primary, ...module.resources.video].forEach((resource: any) => {
        types.add(resource.type);
      });
    });
    return Array.from(types);
  };

  // 新增：切换主要资源展开状态的函数
  const togglePrimaryExpansion = (moduleKey: string) => {
    setExpandedPrimary(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // 新增：切换视频资源展开状态的函数
  const toggleVideoExpansion = (moduleKey: string) => {
    setExpandedVideo(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

  const filteredModules = filterResources();
  const resourceTypes = getUniqueResourceTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
          <Link href="/achievements" className="text-gray-700 hover:text-teal-600">Achievements</Link>
          <Link href="/resources" className="text-teal-600 font-medium">Resources</Link>
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

      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Learning Resources Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover curated learning materials, expert tutorials, and professional development resources 
            to accelerate your career journey in technology.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-4 border-indigo-500">
            <div className="text-3xl font-bold text-indigo-600">{getAllModulesWithResources().length}</div>
            <div className="text-gray-600 font-medium">Total Modules</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">
              {getAllModulesWithResources().reduce((acc, module) => 
                acc + module.resources.primary.length + module.resources.video.length, 0
              )}
            </div>
            <div className="text-gray-600 font-medium">Learning Resources</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{resourceTypes.length}</div>
            <div className="text-gray-600 font-medium">Resource Types</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-4 border-pink-500">
            <div className="text-3xl font-bold text-pink-600">3</div>
            <div className="text-gray-600 font-medium">Learning Areas</div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filter & Search Resources
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search Resources</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search modules or resources..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Learning Area</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="all">All Areas</option>
                <option value="technical">Technical Skills</option>
                <option value="behavioral">Behavioral Interview</option>
                <option value="projects">Practical Projects</option>
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Resource Type</label>
              <select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="all">All Types</option>
                {resourceTypes.map((type: any) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedResourceType('all');
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-indigo-800 font-medium">
              Found <span className="text-2xl font-bold text-indigo-600">{filteredModules.length}</span> learning modules
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedCategory !== 'all' && <span> in {selectedCategory}</span>}
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredModules.map((module, index) => {
            // 生成唯一的模块键
            const moduleKey = `${module.area}-${module.moduleName.replace(/\s+/g, '-')}`;
            const isPrimaryExpanded = expandedPrimary[moduleKey] || false;
            const isVideoExpanded = expandedVideo[moduleKey] || false;
            
            return (
            <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              {/* Module Header */}
              <div className={`py-6 px-8 text-white relative overflow-hidden ${
                module.area === 'technicalSkills' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' :
                module.area === 'behavioralQuestions' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-green-600 to-teal-600'
              }`}>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{module.moduleName}</h3>
                  <p className="text-sm opacity-90 font-medium">{module.category}</p>
                  <div className="mt-3 inline-flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-gray-400">
                      {module.resources.primary.length + module.resources.video.length} Resources
                    </span>
                  </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              {/* Resources Content */}
              <div className="p-8">
                {/* Primary Resources */}
                {module.resources.primary.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📚</span>
                      Primary Resources
                    </h4>
                    <div className="space-y-3">
                      {(isPrimaryExpanded ? module.resources.primary : module.resources.primary.slice(0, 3)).map((resource: any, idx: number) => (
                        <div key={idx} className="group p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                            <div className="flex-1 min-w-0">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-semibold block truncate group-hover:text-indigo-700"
                              >
                                {resource.name}
                              </a>
                              <p className="text-sm text-gray-500 capitalize font-medium">{resource.type}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      ))}
                      {module.resources.primary.length > 3 && (
                        <div className="text-center py-2">
                          <button
                            onClick={() => togglePrimaryExpansion(moduleKey)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
                          >
                            <span>
                              {isPrimaryExpanded 
                                ? '收起资源' 
                                : `+${module.resources.primary.length - 3} 更多资源`
                              }
                            </span>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-200 ${isPrimaryExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Resources */}
                {module.resources.video.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🎥</span>
                      Video Tutorials
                    </h4>
                    <div className="space-y-3">
                      {(isVideoExpanded ? module.resources.video : module.resources.video.slice(0, 2)).map((resource: any, idx: number) => (
                        <div key={idx} className="group p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                            <div className="flex-1 min-w-0">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 font-semibold block truncate group-hover:text-red-700"
                              >
                                {resource.name}
                              </a>
                              <p className="text-sm text-gray-500 capitalize font-medium">{resource.type}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      ))}
                      {module.resources.video.length > 2 && (
                        <div className="text-center py-2">
                          <button
                            onClick={() => toggleVideoExpansion(moduleKey)}
                            className="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
                          >
                            <span>
                              {isVideoExpanded 
                                ? 'Hide' 
                                : `+${module.resources.video.length - 2} more videos`
                              }
                            </span>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-200 ${isVideoExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Additional Resources Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Additional Learning Resources & Communities
            </h2>
            <p className="text-gray-600 text-lg">Connect with professionals and expand your network</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Women in Tech Communities */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">👩‍💻</span>
              </div>
              <h3 className="text-xl font-bold text-pink-600 mb-6">Women in Tech Communities</h3>
              <div className="space-y-4 text-left">
                {ADDITIONAL_RESOURCES.womenInTech.map((resource, index) => (
                  <div key={index} className="bg-pink-50 border border-pink-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 font-semibold block mb-2"
                    >
                      {resource.name}
                    </a>
                    <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Development */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-6">Career Development</h3>
              <div className="space-y-4 text-left">
                {ADDITIONAL_RESOURCES.careerDevelopment.map((resource, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold block mb-2"
                    >
                      {resource.name}
                    </a>
                    <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Preparation */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-6">Interview Preparation</h3>
              <div className="space-y-4 text-left">
                {ADDITIONAL_RESOURCES.interviewPrep.map((resource, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-semibold block mb-2"
                    >
                      {resource.name}
                    </a>
                    <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <Link 
            href="/learning-path"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg inline-block"
          >
            Back to Learning Path
          </Link>
        </div>
      </main>
    </div>
  );
} 