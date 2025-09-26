import React, { useState, useEffect } from 'react';
import { Star, Upload, Check, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import Header from '../components/Header';

const Feedback = () => {
  const [formData, setFormData] = useState({
    busNumber: '',
    journeyDate: '',
    journeyTime: '',
    rating: 0,
    categories: [],
    comment: '',
    photo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const normalizePhone = (p) => {
    const raw = (p || '').toString().trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw.replace(/\s+/g, '');
    const digits = raw.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (digits.length === 10) return `+91${digits}`; // default to +91 for 10-digit
    return `+${digits}`;
  };

  // Auto-fill current date and time
  useEffect(() => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    setFormData(prev => ({
      ...prev,
      journeyDate: date,
      journeyTime: time
    }));
  }, []);

  const categories = [
    { id: 'punctuality', label: 'Punctuality', icon: '🕒' },
    { id: 'cleanliness', label: 'Cleanliness', icon: '🪑' },
    { id: 'driver', label: 'Driver behavior', icon: '👨‍✈️' },
    { id: 'busstop', label: 'Bus stop facilities', icon: '🚏' },
    { id: 'app', label: 'App experience', icon: '📶' }
  ];

  const busRoutes = [
    'Route 101 - City Center to Airport',
    'Route 102 - University to Mall',
    'Route 103 - Station to Hospital',
    'Route 104 - Downtown to Suburbs',
    'Route 105 - Beach Road Express',
    'Route 106 - Industrial Area Loop'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    setOtpVerified(false);
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm) {
      setOtpError('Please enter a phone number');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(`${BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNorm }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to send OTP');
      setOtpSent(true);
      setOtpSuccess('OTP sent successfully');
    } catch (err) {
      setOtpError(err?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm || !otp.trim()) {
      setOtpError('Enter phone and OTP');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNorm, code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Invalid OTP');
      setOtpVerified(true);
      setOtpSuccess('Phone verified');
    } catch (err) {
      setOtpError(err?.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    // Mandatory checks
    if (!otpVerified) {
      setIsSubmitting(false);
      setFormError('Please verify your phone via OTP before submitting.');
      return;
    }
    if (!formData.photo) {
      setIsSubmitting(false);
      setFormError('Please upload your ticket image/screenshot before submitting.');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        busNumber: '',
        journeyDate: '',
        journeyTime: '',
        rating: 0,
        categories: [],
        comment: '',
        photo: null
      });
      // Auto-fill date/time again
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().slice(0, 5);
      setFormData(prev => ({
        ...prev,
        journeyDate: date,
        journeyTime: time
      }));
    }, 3000);
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          className={`text-2xl transition-colors duration-200 ${
            starValue <= (hoveredStar || formData.rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => handleInputChange('rating', starValue)}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      );
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks for your feedback!</h2>
            <p className="text-gray-600">Your input helps us improve the SAWARI experience for everyone.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Share Your Experience</h1>
            <p className="text-blue-100">Help us improve SAWARI for everyone</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Bus Number/Route */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Bus Number/Route
              </label>
              <select
                value={formData.busNumber}
                onChange={(e) => handleInputChange('busNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your bus route</option>
                {busRoutes.map((route, index) => (
                  <option key={index} value={route}>{route}</option>
                ))}
              </select>
            </div>

            {/* Journey Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Journey Date
                </label>
                <input
                  type="date"
                  value={formData.journeyDate}
                  onChange={(e) => handleInputChange('journeyDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Journey Time
                </label>
                <input
                  type="time"
                  value={formData.journeyTime}
                  onChange={(e) => handleInputChange('journeyTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Overall Experience
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars()}
              </div>
              <p className="text-sm text-gray-600">
                {formData.rating === 0 && 'Please rate your experience'}
                {formData.rating === 1 && 'Poor - Needs significant improvement'}
                {formData.rating === 2 && 'Fair - Some issues to address'}
                {formData.rating === 3 && 'Good - Generally satisfactory'}
                {formData.rating === 4 && 'Very Good - Minor improvements possible'}
                {formData.rating === 5 && 'Excellent - Outstanding experience'}
              </p>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                What would you like to comment on? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      formData.categories.includes(category.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Additional Comments
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Share your detailed feedback here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Tell us more about your experience
              </p>
            </div>
            {/* Ticket Photo / Screenshot Upload (Required) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Ticket Image or Screenshot (Required)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {formData.photo ? (
                    <div className="text-green-600">
                      <Check className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{formData.photo.name}</p>
                      <p className="text-sm text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Upload your ticket image</p>
                      <p className="text-sm">This is required to submit feedback</p>
                    </div>
                  )}
                </label>
              </div>
              {formData.photo && (
                <div className="mt-2 text-xs text-gray-600">Selected: {Math.round(formData.photo.size / 1024)} KB</div>
              )}
            </div>

            {/* Phone Verification (OTP) - Required */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Verify Phone (Required)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className={`px-4 py-3 rounded-lg text-white text-sm font-semibold ${sendingOtp ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {sendingOtp ? 'Sending…' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || !otpSent}
                    className={`px-4 py-3 rounded-lg text-white text-sm font-semibold ${verifyingOtp || !otpSent ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {verifyingOtp ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              {(otpError || otpSuccess) && (
                <div className="mt-2 text-sm">
                  {otpError && <div className="text-red-600">{otpError}</div>}
                  {otpSuccess && <div className="text-green-600">{otpSuccess}</div>}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0 || !otpVerified || !formData.photo}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting || formData.rating === 0 || !otpVerified || !formData.photo
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Submit Feedback</span>
                </div>
              )}
            </button>

            {formError && (
              <p className="text-sm text-red-600 text-center mt-2">{formError}</p>
            )}

            <p className="text-xs text-gray-500 text-center">
              ⚡ Takes less than 2 minutes • Your feedback is anonymous
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
