import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
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

        <div className="flex items-center space-x-4">
          <Link 
            href="/signin" 
            className="px-4 py-2 text-teal-600 hover:text-teal-800 font-medium"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Empower Your Tech Career Journey
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              LyraTech is a career development platform specifically designed to address the challenges women face in the tech industry, focusing on career growth and leadership skills.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md text-center"
              >
                Get Started Today
              </Link>
              <Link
                href="/about"
                className="inline-block px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src="/images/logo2.png"
                alt="LyraTech Platform"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                AI-driven learning paths tailored to your career goals, skills, and availability.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mentor Connections</h3>
              <p className="text-gray-600">
                Connect with experienced industry professionals who provide guidance and support.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hands-on Learning</h3>
              <p className="text-gray-600">
                Apply your knowledge through practical exercises and real-world projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Specialized Modules</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Our platform offers two tailored experiences to support women at different stages of their tech careers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NextGen Module */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 py-6 px-6">
                <h3 className="text-2xl font-bold text-white">NextGen Stars</h3>
                <p className="text-teal-100 mt-1">For students and early-career professionals</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Career exploration and mapping</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Technical interview preparation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Industry connections and mentorship</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Technical skill foundations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Shining Galaxy Module */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 py-6 px-6">
                <h3 className="text-2xl font-bold text-white">Shining Galaxy</h3>
                <p className="text-indigo-100 mt-1">For mid-career professionals and leaders</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Leadership skill assessment and development</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Management training and pathways</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Entrepreneurial skills and resources</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced technical communication</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of women who are advancing their careers in tech through our personalized platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-teal-600 font-medium rounded-md text-center"
            >
              Create Account
            </Link>
            <Link
              href="/signin"
              className="inline-block px-8 py-4 bg-transparent hover:bg-teal-700 text-white border border-white font-medium rounded-md text-center"
            >
              Sign In
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
              <p className="text-gray-400 text-sm">© 2025 LyraTech. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
