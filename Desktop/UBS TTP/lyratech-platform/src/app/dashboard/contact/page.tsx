"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

export default function DashboardContact() {
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
          <p className="mt-4 text-gray-600">Loading...</p>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            We're here to support your journey in tech. Reach out to us with any questions, feedback, or suggestions.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Whether you have questions about our platform, need technical support, or want to share feedback about your learning experience, we'd love to hear from you.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                      <a 
                        href="mailto:lyratech.platform@gmail.com"
                        className="text-teal-600 hover:text-teal-800 font-medium"
                      >
                        lyratech.platform@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Response Time</h3>
                      <p className="text-gray-600">We typically respond within 24-48 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Support</h3>
                      <p className="text-gray-600">Technical support, platform questions, feedback</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Visual */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Let's Connect</h3>
                  <p className="text-gray-600 mb-6">
                    Send us an email and we'll get back to you as soon as possible. We value your input and are committed to continuously improving your LyraTech experience.
                  </p>
                  <a 
                    href="mailto:lyratech.platform@gmail.com?subject=LyraTech Platform Inquiry"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Send us an Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Common Questions</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              Before reaching out, you might find answers to common questions here.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How do I reset my password?</h3>
                <p className="text-gray-600 text-sm">
                  Go to the sign-in page and click "Forgot Password" to receive reset instructions via email.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How do I update my profile?</h3>
                <p className="text-gray-600 text-sm">
                  Click on your avatar in the top right corner and select "Profile Settings" to update your information.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How do I change my learning path?</h3>
                <p className="text-gray-600 text-sm">
                  Visit the Learning Path page and use the module selection tools to customize your learning journey.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How do I report a technical issue?</h3>
                <p className="text-gray-600 text-sm">
                  Email us with detailed information about the issue, including your browser and any error messages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Continue Your Learning Journey</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Ready to get back to building your tech career? Explore our platform and continue your progress.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-teal-600 font-medium rounded-md text-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/learning-path"
              className="inline-block px-8 py-4 bg-transparent hover:bg-teal-700 text-white border border-white font-medium rounded-md text-center"
            >
              View Learning Path
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/logo2.png"
                alt="LyraTech Logo"
                width={30}
                height={30}
                className="mr-2"
              />
              <span className="text-xl font-semibold">LyraTech</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">Empowering women's career development in tech</p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} LyraTech. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 