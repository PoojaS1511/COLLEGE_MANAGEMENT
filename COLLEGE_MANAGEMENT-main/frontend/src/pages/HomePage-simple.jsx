import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Simple Hero Section */}
      <div className="relative h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <div className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-full">
                <span className="text-sm font-medium">Student Management System</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                <div className="text-xl md:text-2xl font-normal text-gray-600 -mt-1">Welcome to</div>
                <div className="leading-tight">
                  <div className="block">Cube <span className="text-blue-600">Arts & Engineering</span></div>
                  <div className="text-2xl md:text-3xl font-medium text-gray-600 mt-1">College</div>
                </div>
              </h1>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/admissions"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-full transition-all duration-300"
              >
                <span>Apply Now</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-lg font-medium rounded-full transition-all duration-300"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
