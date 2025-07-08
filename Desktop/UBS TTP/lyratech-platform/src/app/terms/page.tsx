"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Introduction</h2>
            <p>
              Welcome to LyraTech ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website and services operated by LyraTech.
            </p>
            <p>
              Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Please read it here: <Link href="/privacy" className="text-teal-600 hover:text-teal-800">Privacy Policy</Link>.
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
              When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Prohibited Uses</h2>
            <p>
              You may use the Service only for lawful purposes and in accordance with the Terms. You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-medium">support@lyratech.platform.com</p>
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