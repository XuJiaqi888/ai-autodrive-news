"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    careerStage: "nextgen", // Default to NextGen Stars
    termsAgreed: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle career stage selection
  const handleCareerStageSelect = (stage: string) => {
    // Only allow NextGen Stars selection for now
    if (stage === 'nextgen') {
      setFormData({
        ...formData,
        careerStage: stage
      });
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");
    setResendMessage("");
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }
      
      setResendMessage("New verification code sent to your email!");
      
    } catch (error: any) {
      console.error("Resend verification error:", error);
      setError(error.message || "An error occurred while resending verification code");
    } finally {
      setResendLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("Form submitted");
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (!formData.careerStage) {
      setError("Please select your career stage");
      return;
    }
    
    if (!formData.termsAgreed) {
      setError("You must agree to the Terms of Service");
      return;
    }
    
    setLoading(true);
    console.log("Sending registration request to /api/auth/register");
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          careerStage: formData.careerStage
        }),
      });
      
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Server response is not valid JSON");
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // If registration successful, move to verification step
      console.log("Registration successful, moving to verification step");
      setVerificationEmail(data.email);
      setVerificationStep(true);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("Verification form submitted");
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }
    
    setLoading(true);
    console.log("Sending verification request to /api/auth/verify");
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode
        }),
      });
      
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Server response is not valid JSON");
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      console.log("Verification successful, redirecting to dashboard");
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Verification error:", error);
      setError(error.message || "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col">
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
        </div>
      </nav>

      {/* Registration Form */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          {/* Verification Step */}
          {verificationStep ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Verify Your Email</h1>
                <p className="text-gray-600 mt-2">
                  We've sent a verification code to <span className="font-medium">{verificationEmail}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}

              {resendMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
                  {resendMessage}
                </div>
              )}

              <form onSubmit={handleVerification} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-teal-600 hover:text-teal-800 font-medium text-sm disabled:opacity-70"
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Code"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
                <p className="text-gray-600 mt-2">Join LyraTech and start your tech career development journey</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Create a secure password"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters and include letters and numbers</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Career Stage</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`border ${formData.careerStage === 'nextgen' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'} hover:border-teal-500 p-4 rounded-md cursor-pointer`}
                      onClick={() => handleCareerStageSelect('nextgen')}
                    >
                      <input
                        type="radio"
                        id="nextgen"
                        name="careerStage"
                        value="nextgen"
                        checked={formData.careerStage === 'nextgen'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label htmlFor="nextgen" className="cursor-pointer flex flex-col items-center">
                        <span className="font-medium text-gray-800">NextGen Stars</span>
                        <span className="text-xs text-gray-500">Student or early career</span>
                      </label>
                    </div>
                    <div 
                      className={`border ${formData.careerStage === 'shining' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'} hover:border-gray-400 p-4 rounded-md cursor-not-allowed opacity-60 relative group`}
                      title="Coming Soon"
                    >
                      <input
                        type="radio"
                        id="shining"
                        name="careerStage"
                        value="shining"
                        disabled
                        className="sr-only"
                      />
                      <label htmlFor="shining" className="cursor-not-allowed flex flex-col items-center">
                        <span className="font-medium text-gray-600">Shining Galaxy</span>
                        <span className="text-xs text-gray-400">Mid-career or leadership</span>
                      </label>
                      {/* Coming Soon Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Coming Soon
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="termsAgreed"
                      name="termsAgreed"
                      type="checkbox"
                      checked={formData.termsAgreed}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="termsAgreed" className="text-gray-600">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-teal-600 hover:text-teal-800 underline"
                      >
                        Terms of Service
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-teal-600 hover:text-teal-800 underline"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-teal-600 hover:text-teal-800 font-medium">
                Sign In
              </Link>
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

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700">
                <h3 className="font-semibold text-lg">1. Acceptance of Terms</h3>
                <p>By accessing and using LyraTech platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h3 className="font-semibold text-lg">2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of LyraTech materials for personal, non-commercial transitory viewing only.</p>
                
                <h3 className="font-semibold text-lg">3. Disclaimer</h3>
                <p>The materials on LyraTech are provided on an 'as is' basis. LyraTech makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                
                <h3 className="font-semibold text-lg">4. User Responsibilities</h3>
                <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
                
                <h3 className="font-semibold text-lg">5. Content Policy</h3>
                <p>Users may not upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, or otherwise objectionable.</p>
                
                <h3 className="font-semibold text-lg">6. Termination</h3>
                <p>We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.</p>
                
                <h3 className="font-semibold text-lg">7. Governing Law</h3>
                <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which LyraTech operates.</p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700">
                <h3 className="font-semibold text-lg">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.</p>
                
                <h3 className="font-semibold text-lg">2. How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                
                <h3 className="font-semibold text-lg">3. Information Sharing</h3>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in certain limited circumstances as outlined in this policy.</p>
                
                <h3 className="font-semibold text-lg">4. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                
                <h3 className="font-semibold text-lg">5. Cookies and Tracking</h3>
                <p>We use cookies and similar tracking technologies to collect and use personal information about you. You can control cookies through your browser settings.</p>
                
                <h3 className="font-semibold text-lg">6. Your Rights</h3>
                <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
                
                <h3 className="font-semibold text-lg">7. Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                
                <h3 className="font-semibold text-lg">8. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@lyratech.com.</p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 