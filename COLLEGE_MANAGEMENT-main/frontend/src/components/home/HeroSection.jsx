import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Award, BookOpen, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-white text-black overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiPjwvcmVjdD4KPC9zdmc+')]">
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full opacity-20"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gray-200 rounded-full opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 flex items-center min-h-screen">
        <div className="w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full mb-8">
            <span className="text-sm font-medium">Ranked #1 Engineering College</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
            <div className="text-gray-900">Welcome to</div>
            <div className="text-2xl md:text-4xl">Cube Arts & Engineering</div>
            <div className="text-xl md:text-2xl text-gray-700">College</div>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg mb-10 max-w-3xl mx-auto text-gray-600 leading-relaxed">
            Empowering students with <span className="font-semibold text-black">world-class education</span>,
            cutting-edge technology, and <span className="font-semibold text-black">industry expertise</span>
            to shape the leaders of tomorrow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center px-8 py-4 bg-dark-600 text-white font-semibold rounded-full hover:bg-dark-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Apply Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/programs"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border border-dark-600 text-dark-600 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300"
            >
              Explore Programs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '95%', label: 'Placement Rate', icon: <Award className="w-6 h-6" /> },
              { value: '50+', label: 'Programs', icon: <BookOpen className="w-6 h-6" /> },
              { value: '10K+', label: 'Students', icon: <Users className="w-6 h-6" /> },
              { value: '25+', label: 'Years of Excellence', icon: <GraduationCap className="w-6 h-6" /> },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold mb-2 text-black">{stat.value}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <span className="mr-2 text-black">{stat.icon}</span>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
