import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  UserGroupIcon,
  BriefcaseIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { 
  FaceSmileIcon as FacebookIcon,
  ChatBubbleLeftRightIcon as TwitterIcon,
  UserGroupIcon as LinkedinIcon
} from '@heroicons/react/24/solid';
// CampusLifeSection import is available for future use if needed
// import CampusLifeSection from '../components/home/CampusLifeSection';

const AboutUsPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-[#032A51] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              About Our College
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center items-center text-sm font-medium text-green-100"
            >
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRightIcon className="mx-2 h-4 w-4" />
              <span>About Us</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* College Introduction */}
        <div className="prose prose-lg max-w-4xl mx-auto mb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#032A51] mb-4"
          >
            Welcome to Cube Arts & Engineering
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed"
          >
            Empowering students with quality technical education and industry-ready skills for a successful career in engineering and technology.
          </motion.p>
        </div>

        {/* Quick Links */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-8 w-8 text-[#032A51] mr-3" />
              <h3 className="text-xl font-semibold">Academics</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/admissions" className="hover:text-[#032A51]">Admissions</Link></li>
              <li><Link to="/results" className="hover:text-[#032A51]">Results</Link></li>
              <li><Link to="/fee-portal" className="hover:text-[#032A51]">Fee Portal</Link></li>
              <li><Link to="/library" className="hover:text-[#032A51]">Library</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <BriefcaseIcon className="h-8 w-8 text-[#032A51] mr-3" />
              <h3 className="text-xl font-semibold">Careers</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/placements" className="hover:text-[#032A51]">Placements</Link></li>
              <li><Link to="/alumni" className="hover:text-[#032A51]">Alumni</Link></li>
              <li><Link to="/internships" className="hover:text-[#032A51]">Internships</Link></li>
              <li><Link to="/career-guidance" className="hover:text-[#032A51]">Career Guidance</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold">Departments</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>Computer Science</li>
              <li>Electronics & Communication</li>
              <li>Mechanical Engineering</li>
              <li>Civil Engineering</li>
              <li>Electrical Engineering</li>
            </ul>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          className="bg-gray-50 rounded-lg p-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Cube Arts and Engineering College</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                  <span>123 Education Street<br />Chennai, Tamil Nadu 600001</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <a href="tel:+914412345678" className="hover:text-blue-600">+91 44 1234 5678</a>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <a href="mailto:info@cubearts.edu.in" className="hover:text-blue-600">info@cubearts.edu.in</a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-[#032A51] hover:opacity-80">
                  <FacebookIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-[#032A51] hover:opacity-80">
                  <TwitterIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-[#032A51] hover:opacity-80">
                  <LinkedinIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;
