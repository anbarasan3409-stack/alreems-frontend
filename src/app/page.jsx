'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, Star } from "lucide-react";
import { COLORS } from "@/theme/themeConstants";
import NavBar from "@/components/NavBar";
import SignInPopup from "@/components/SignInPopup";
import { enquiryService, feedbackService } from "@/services/apiService.jsx";
import coursesData from "@/data/courses.json";
import eventsData from "@/data/events.json";


const CourseCard = ({ course }) => (
  <div className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
    {/* Course Image */}
    <div className="h-48 sm:h-56 w-full relative overflow-hidden bg-gray-200 flex-shrink-0">
      <div className={`absolute inset-0 bg-gradient-to-tr ${course.gradient} opacity-20 z-10 group-hover:opacity-10 transition-opacity duration-500`}></div>
      {course.image ? (
        <Image src={course.image} alt={course.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${course.gradient} text-white font-bold text-4xl group-hover:scale-110 transition-transform duration-500`}>
          {course.icon}
        </div>
      )}
    </div>

    <div className="p-6 sm:p-8 flex flex-col flex-grow">
      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors" style={{ color: COLORS.primary }}>
        {course.title}
      </h3>

      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed group-hover:text-gray-700 transition-colors flex-grow">
        {course.description}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-auto pt-4">
        <button
          onClick={() => {
            const phoneNumber = "917397163487";
            const message = encodeURIComponent(`Hi, I would like to enquire about the ${course.title} course.`);
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
          }}
          className="w-full sm:w-auto px-6 py-2 rounded-full font-semibold text-white transition-all hover:opacity-90 text-sm shadow-sm"
          style={{ backgroundColor: COLORS.secondary }}
        >
          Enquiry
        </button>
      </div>
    </div>
    
    {/* Hover Effect Line */}
    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${course.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
  </div>
);
export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: false, error: null });

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await feedbackService.getTestimonials();
      if (res && Array.isArray(res)) {
        setTestimonials(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setTestimonials(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryStatus({ loading: true, success: false, error: null });
    try {
      await enquiryService.submitEnquiry(enquiryForm);
      setEnquiryStatus({ loading: false, success: true, error: null });
      setEnquiryForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setEnquiryStatus({ loading: false, success: false, error: null }), 5000);
    } catch (err) {
      setEnquiryStatus({ loading: false, success: false, error: err.error || 'Failed to submit enquiry' });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <NavBar onSignInClick={() => setShowSignIn(true)} />
      <section id="about" className="flex flex-col lg:flex-row lg:min-h-[80vh] w-full items-center justify-center gap-8 lg:gap-12 px-4 sm:px-8 md:px-20 py-8 lg:py-0">
        <div className="flex flex-col items-start justify-center gap-2 max-w-xl flex-shrink-0 text-left">
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>A New Approach to</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-4" style={{ color: COLORS.primary }}>Youth Education</h1>
          <p className="text-sm sm:text-base text-gray-700 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Al Reems Academy is a premier educational institution dedicated to providing high-quality education and comprehensive development opportunities.
          </p>
          <div className="mt-6">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 font-semibold shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
              style={{ color: COLORS.primary }}
              onClick={() => setShowSignIn(true)}
            >
              Get Started
              <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white ml-1">
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4.5L12 9L6 13.5" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center mt-8 lg:mt-0">
          <Image
            src="/assets/images/Illustration.png"
            alt="Hero Illustration"
            width={800}
            height={500}
            className="object-contain w-full max-w-md lg:max-w-lg xl:max-w-xl"
            priority
          />
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-4 sm:py-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-20">
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee">
              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Al Reems Admission is Open
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Enroll Now for 2025-2026 Academic Year
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Limited Seats Available
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-pink-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Contact Us Today
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap ml-4 sm:ml-6 lg:ml-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Al Reems Admission is Open
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Enroll Now for 2025-2026 Academic Year
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Limited Seats Available
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-pink-500 animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: COLORS.primary }}>
                    Contact Us Today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-marquee {
            animation: marquee 20s linear infinite;
          }

          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-8 md:px-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.background} 0%, #f8fafc 100%)` }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-green-400 to-blue-500 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold" style={{ color: COLORS.primary }}>Academic Excellence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Our Courses
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover our comprehensive range of courses designed to nurture young minds and build a strong foundation for future success.
            </p>
          </div>

          {/* Offline Courses */}
          <div className="mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: COLORS.primary }}>Offline Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {coursesData.filter(course => course.mode === 'offline').map((course, index) => (
                <CourseCard key={`offline-${index}`} course={course} />
              ))}
            </div>
          </div>

          {/* Online Courses */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: COLORS.primary }}>Online Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {coursesData.filter(course => course.mode === 'online').map((course, index) => (
                <CourseCard key={`online-${index}`} course={course} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-8 md:px-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: COLORS.primary }}>
              Events
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Stay updated with our latest activities, competitions, and gatherings.</p>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {eventsData.map((event) => (
              <div key={event.id} className="min-w-[300px] sm:min-w-[350px] max-w-[400px] bg-white rounded-2xl border border-gray-100 flex-shrink-0 snap-start overflow-hidden group">
                <div className="h-48 w-full relative overflow-hidden bg-gray-200">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${event.color} opacity-40 z-10`}></div>
                  <Image src={event.image || '/assets/images/Illustration.png'} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className="text-sm font-bold text-blue-600 mb-2 block">{event.date}</span>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="enquiry-section" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-8 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: COLORS.primary }}>
              Have Questions? Contact Us
            </h2>
            <p className="text-gray-600">Send us an enquiry and our team will get back to you shortly.</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
            {enquiryStatus.success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                Thank you! Your enquiry has been submitted successfully.
              </div>
            )}
            {enquiryStatus.error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center font-medium">
                {enquiryStatus.error}
              </div>
            )}
            
            <form onSubmit={handleEnquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={enquiryForm.subject}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-500"
                    placeholder="Admission Enquiry"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  rows="4"
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900 placeholder-gray-500"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  disabled={enquiryStatus.loading}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.secondary }}
                >
                  {enquiryStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-8 md:px-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: COLORS.primary }}>
                What Our Students Say
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Real stories from our successful students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-gray-300 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: COLORS.primary }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 mb-6 text-yellow-400 relative z-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} className={star <= t.rating ? 'fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-900 font-medium mb-8 leading-relaxed relative z-10 text-lg">"{t.message}"</p>
                  <div className="flex items-center gap-4 relative z-10 mt-auto">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center font-bold text-lg border border-gray-100" style={{ color: COLORS.primary }}>
                      {(t.student_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t.student_name || 'Student'}</h4>
                      {t.course && <p className="text-sm font-semibold text-gray-500">{t.course}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="bg-white text-gray-800 py-12 sm:py-16 px-4 sm:px-8 md:px-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Image
                  src="/assets/icons/logo.jpg"
                  alt="Al Reems Logo"
                  width={200}
                  height={60}
                  className="object-contain brightness-100 sm:w-32 sm:h-12"
                />
                <h3 className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.primary }}>Al Reems Academy</h3>
              </div>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed max-w-md text-sm sm:text-base">
                A premier educational institution dedicated to providing high-quality education and comprehensive development opportunities for young minds.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors duration-300 text-gray-600 group">
                  <Facebook size={16} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-blue-400 hover:text-white flex items-center justify-center transition-colors duration-300 text-gray-600 group">
                  <Twitter size={16} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors duration-300 text-gray-600 group">
                  <Instagram size={16} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors duration-300 text-gray-600 group">
                  <Youtube size={16} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" style={{ color: COLORS.primary }}>Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><a href="#about" className="text-slate-600 hover:text-slate-800 transition-colors duration-300 text-sm sm:text-base">About Us</a></li>
                <li><a href="#courses" className="text-slate-600 hover:text-slate-800 transition-colors duration-300 text-sm sm:text-base">Our Courses</a></li>
                <li><a href="#enquiry-section" className="text-slate-600 hover:text-slate-800 transition-colors duration-300 text-sm sm:text-base">Admissions</a></li>
                <li><a href="#events" className="text-slate-600 hover:text-slate-800 transition-colors duration-300 text-sm sm:text-base">Events</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" style={{ color: COLORS.primary }}>Contact Info</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-2 border-b border-gray-100">
                  <span className="text-slate-700 font-semibold text-xs sm:text-sm min-w-[80px]">Branch:</span>
                  <div className="text-slate-600 text-sm sm:text-base">
                    <p className="leading-tight">50th Floor, ASPIN COMMERCIAL TOWER</p>
                    <p className="leading-tight">Sheikh Zayed Road, Dubai, UAE.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-2 border-b border-gray-100">
                  <span className="text-slate-700 font-semibold text-xs sm:text-sm min-w-[80px]">Registered:</span>
                  <div className="text-slate-600 text-sm sm:text-base">
                    <p className="leading-tight">Block B - B14-117</p>
                    <p className="leading-tight">SRTPI Free zone,</p>
                    <p className="leading-tight">Sharjah, UAE.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-2 border-b border-gray-100">
                  <span className="text-slate-700 font-semibold text-xs sm:text-sm min-w-[80px]">India:</span>
                  <div className="text-slate-600 text-sm sm:text-base">
                    <p className="leading-tight">1/42 Ganga Nagar, 3rd Main Road</p>
                    <p className="leading-tight">Maduravoyal, Chennai -95</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 justify-center sm:justify-start">
                <a href="#" className="hover:text-slate-800 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-slate-800 transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-slate-800 transition-colors duration-300">Cookie Policy</a>
                <a href="#" className="hover:text-slate-800 transition-colors duration-300">Accessibility</a>
                <a href="#" className="hover:text-slate-800 transition-colors duration-300">Sitemap</a>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm">
                © 2025 Al Reems Academy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showSignIn && <SignInPopup onClose={() => setShowSignIn(false)} />}
    </div>
  );
}
