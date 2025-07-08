"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

interface FAQItem {
  question: string;
  answer: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

export default function DashboardAbout() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: "What makes LyraTech different from other career development platforms?",
      answer: "LyraTech is specifically designed for women in tech, addressing unique challenges like gender bias, imposter syndrome, and underrepresentation in leadership roles. Our platform offers personalized learning paths, mentorship connections, and a supportive community that understands the specific obstacles women face in the technology industry."
    },
    {
      question: "How do the NextGen Stars and Shining Galaxy modules work?",
      answer: "NextGen Stars is designed for students and early-career professionals, focusing on technical skills, interview preparation, and career exploration. Shining Galaxy targets mid-career professionals and leaders, emphasizing leadership development, management training, and entrepreneurial skills. Both modules adapt to your individual needs and career goals."
    },
    {
      question: "Is LyraTech suitable for women transitioning into tech from other industries?",
      answer: "Absolutely! Many successful tech professionals have made career transitions, and LyraTech provides specialized resources for career changers. Our platform offers foundational technical training, industry insights, networking opportunities, and mentorship from women who have successfully navigated similar transitions."
    },
    {
      question: "How does the mentorship program work?",
      answer: "Our mentorship program connects you with experienced women in tech based on your career goals, interests, and current challenges. Mentors provide guidance through regular virtual meetings, project reviews, and career advice. We carefully match mentors and mentees to ensure meaningful and productive relationships."
    },
    {
      question: "What kind of support does LyraTech provide for work-life balance?",
      answer: "We understand that women often face unique challenges in balancing career and personal responsibilities. LyraTech offers flexible learning schedules, resources on time management, discussions about navigating workplace policies like maternity leave, and a supportive community where women share strategies for maintaining work-life balance in demanding tech roles."
    },
    {
      question: "How can I track my progress on the platform?",
      answer: "LyraTech features comprehensive progress tracking including completed modules, skill assessments, project portfolios, and achievement badges. You can monitor your learning journey, set goals, and receive personalized recommendations for your next steps. Regular progress reviews help ensure you're on track to meet your career objectives."
    },
    {
      question: "Does LyraTech help with job placement?",
      answer: "While we don't directly place candidates, LyraTech provides extensive career support including resume reviews, interview preparation, networking events, and connections to our partner companies that are committed to diversity and inclusion. Many of our community members have successfully found new opportunities through the connections and skills developed on our platform."
    },
    {
      question: "Is there a community aspect to LyraTech?",
      answer: "Yes! Community is at the heart of LyraTech. Our platform includes discussion forums, peer study groups, networking events, and collaborative projects. You can connect with women at similar career stages, share experiences, celebrate successes, and support each other through challenges. We also host regular virtual events and workshops."
    }
  ];

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
            About LyraTech
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Empowering women to shine bright in the technology galaxy, just like Vega - the brightest star in Lyra
          </p>
        </div>
      </div>

      {/* Name Origin Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">⭐</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">The Story Behind Our Name</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Lyra: The Celestial Harp</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  LyraTech draws its name from the constellation Lyra, home to Vega - one of the brightest stars in our night sky. In ancient mythology, Lyra represents the musical instrument of Orpheus, whose melodies could move mountains and calm storms.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Just as Vega has served as a guiding star for navigation throughout history, LyraTech aims to be the guiding light for women navigating their careers in technology. Vega was once the northern pole star and will be again in the future - symbolizing how leadership can shift and how women can take their rightful place as leaders in tech.
                </p>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-teal-800 font-medium">
                    "Like Vega illuminates the constellation Lyra, we believe every woman in tech has the potential to shine brightly and inspire others in the technology galaxy."
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative">
                  <div className="w-90 h-90 mx-auto rounded-xl overflow-hidden shadow-lg  border-gradient-to-r from-teal-400 to-blue-400">
                    <Image
                      src="/images/lyra.png"
                      alt="Lyra Constellation"
                      width={330}
                      height={330}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-600 text-sm mt-4 italic">Lyra - The Celestial Harp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission & Founding Vision</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              LyraTech was born from a critical need: addressing the persistent gender gap in technology leadership and career advancement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">The Problem</h3>
                <p className="text-gray-600 text-sm">
                  Despite making up nearly half the workforce, women hold only 26% of tech roles and face significant barriers to leadership positions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 text-xl">💡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Our Solution</h3>
                <p className="text-gray-600 text-sm">
                  A personalized, supportive platform that addresses unique challenges women face, from technical skills to leadership development.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">The Impact</h3>
                <p className="text-gray-600 text-sm">
                  Accelerating career progression, building confidence, and creating a network of successful women leaders in technology.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Why We Built LyraTech</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The technology industry has made significant strides in promoting diversity and inclusion, but women still face unique challenges that require specialized support. From imposter syndrome and unconscious bias to the lack of female role models in leadership positions, these obstacles can significantly impact career trajectory.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                LyraTech was founded on the belief that when women have access to personalized learning, meaningful mentorship, and a supportive community, they can overcome these challenges and achieve their full potential. We're not just building careers; we're building the next generation of women leaders who will transform the technology industry.
              </p>
              <div className="bg-white p-4 rounded-lg mt-6">
                <p className="text-teal-800 font-medium text-center">
                  "Our vision is a technology industry where women not only participate but lead, innovate, and inspire - shining as brightly as Vega in the constellation of tech leadership."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-800 pr-4">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-6 h-6 text-gray-500 transition-transform ${
                          openFAQ === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Continue Your Journey</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Explore our platform and continue building your tech career with our comprehensive learning paths and community support.
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