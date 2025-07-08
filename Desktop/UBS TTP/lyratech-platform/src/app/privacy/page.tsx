"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo1.png"
            alt="LyraTech Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-semibold text-teal-600">LyraTech</span>
        </Link>

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

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <p>
              LyraTech ("us", "we", or "our") operates the LyraTech website (the "Service").
            </p>
            <p>
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Types of Data Collected</h3>
            
            <h4 className="text-base font-medium text-gray-800 mt-4 mb-2">Personal Data</h4>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Cookies and Usage Data</li>
            </ul>
            
            <h4 className="text-base font-medium text-gray-800 mt-4 mb-2">Usage Data</h4>
            <p>
              We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
            </p>
            
            <h4 className="text-base font-medium text-gray-800 mt-4 mb-2">Tracking & Cookies Data</h4>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
            </p>
            <p>
              Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Use of Data</h2>
            <p>
              LyraTech uses the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer care and support</li>
              <li>To provide analysis or valuable information so that we can improve the Service</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Transfer of Data</h2>
            <p>
              Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
            </p>
            <p>
              If you are located outside United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to United States and process it there.
            </p>
            <p>
              Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
            <p>
              LyraTech will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Disclosure of Data</h2>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Legal Requirements</h3>
            <p>
              LyraTech may disclose your Personal Data in the good faith belief that such action is necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>To comply with a legal obligation</li>
              <li>To protect and defend the rights or property of LyraTech</li>
              <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>To protect the personal safety of users of the Service or the public</li>
              <li>To protect against legal liability</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Your Data Protection Rights</h2>
            <p>
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The right to access – You have the right to request copies of your personal data.</li>
              <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete information you believe is incomplete.</li>
              <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
              <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
              <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
              <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
            <p>
              We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="font-medium">
              By email: privacy@lyratech.platform.com
            </p>
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