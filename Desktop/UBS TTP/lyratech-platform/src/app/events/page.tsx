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

export default function Events() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
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
          <Link href="/achievements" className="text-gray-700 hover:text-teal-600">Achievements</Link>
          <Link href="/resources" className="text-gray-700 hover:text-teal-600">Resources</Link>
          <Link href="/blog" className="text-gray-700 hover:text-teal-600">Blog</Link>
          <Link href="/events" className="text-teal-600 font-medium">Events</Link>
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

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Events</h1>
          <p className="text-gray-600">Discover opportunities to grow, learn, and connect with the tech community.</p>
        </div>

        {/* Events Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Past Events */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">📚</span>
                Past Events
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📋</span>
                </div>
                <p className="text-gray-500 text-lg mb-2">Coming Soon</p>
                <p className="text-gray-400 text-sm">We are organizing highlights from our past events</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white py-4 px-6">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">🚀</span>
                Upcoming Events
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Exciting events are being planned! We will bring you more opportunities for learning and growth.
                </p>
                
                <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-6 border border-teal-100">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center justify-center">
                    <span className="mr-2">💡</span>
                    Have an idea? We want to hear from you!
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Want to participate in or host an event? Please send your proposal to us:
                  </p>
                  <div className="bg-white rounded-md p-3 border">
                    <a 
                      href="mailto:lyratech.platform@gmail.com"
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm break-all"
                    >
                      lyratech.platform@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
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