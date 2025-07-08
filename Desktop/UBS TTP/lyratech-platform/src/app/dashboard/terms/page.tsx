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

export default function DashboardTermsOfService() {
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
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
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

      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Introduction</h2>
            <p>
              Welcome to LyraTech ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website and services operated by LyraTech.
            </p>
            <p>
              Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Please read it here: <Link href="/dashboard/privacy" className="text-teal-600 hover:text-teal-800">Privacy Policy</Link>.
            </p>
            <p>
              By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Communications</h2>
            <p>
              By creating an Account on our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for all activities that occur under your password, whether your password is with our Service or a third-party service.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Prohibited Uses</h2>
            <p>You may not use our Service:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for Content that you post to the Service, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting Content to the Service, You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Content is yours (you own it) and/or you have the right to use it</li>
              <li>Content does not infringe, violate or misappropriate the rights of any third party</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service or contact us for account deletion.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Disclaimer</h2>
            <p>
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>excludes all representations and warranties relating to this website and its contents</li>
              <li>excludes all liability for damages arising out of or in connection with your use of this website</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at <a href="mailto:lyratech.platform@gmail.com" className="text-teal-600 hover:text-teal-800">lyratech.platform@gmail.com</a>.
            </p>
          </div>

          {/* Back to Dashboard Button */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <Image
                  src="/images/logo2.png"
                  alt="LyraTech Logo"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                <span className="text-lg font-semibold">LyraTech</span>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} LyraTech. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 