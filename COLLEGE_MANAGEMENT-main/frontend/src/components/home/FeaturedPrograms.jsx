import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ComputerDesktopIcon, 
  CpuChipIcon, 
  WrenchScrewdriverIcon, 
  BuildingOffice2Icon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const FeaturedPrograms = () => {
  const programs = [
    {
      id: 1,
      title: 'Computer Science Engineering',
      code: 'CSE',
      icon: ComputerDesktopIcon,
      description: 'Master the art of programming, AI, machine learning, and software development with industry-relevant curriculum.',
      duration: '4 Years',
      seats: '120',
      highlights: ['AI & ML Specialization', 'Industry Projects', '100% Placement'],
      rating: 4.8,
      gradient: 'from-blue-600 to-blue-700',
      highlightGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Electronics & Communication',
      code: 'ECE',
      icon: CpuChipIcon,
      description: 'Explore the world of electronics, communication systems, VLSI design, and embedded systems.',
      duration: '4 Years',
      seats: '90',
      highlights: ['VLSI Design', 'IoT Projects', '95% Placement'],
      rating: 4.7,
      gradient: 'from-purple-600 to-purple-700',
      highlightGradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 3,
      title: 'Mechanical Engineering',
      code: 'MECH',
      icon: WrenchScrewdriverIcon,
      description: 'Design, analyze, and manufacture mechanical systems with cutting-edge technology and innovation.',
      duration: '4 Years',
      seats: '90',
      highlights: ['CAD/CAM', 'Robotics', '92% Placement'],
      rating: 4.6,
      gradient: 'from-red-600 to-red-700',
      highlightGradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 4,
      title: 'Civil Engineering',
      code: 'CIVIL',
      icon: BuildingOffice2Icon,
      description: 'Build the future with sustainable infrastructure, smart cities, and environmental engineering.',
      duration: '4 Years',
      seats: '60',
      highlights: ['Smart Cities', 'Green Building', '90% Placement'],
      rating: 4.5,
      gradient: 'from-teal-600 to-teal-700',
      highlightGradient: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6"
          >
            <StarIcon className="w-5 h-5 text-black mr-2" />
            <span className="text-sm font-semibold text-black">Top Rated Programs</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-black mb-6"
          >
            <span className="text-black">Engineering Programs</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose from our industry-aligned engineering programs designed to prepare you for the future of technology
          </motion.p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-200 border border-gray-200"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`p-4 ${program.iconBg} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <program.icon className={`w-8 h-8 ${program.iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {program.title}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-3">({program.code})</span>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700 ml-1">{program.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {program.description}
                </p>

                {/* Program Details */}
                <div className="flex items-center justify-between mb-6 text-sm">
                  <div className="flex items-center space-x-6">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-semibold text-gray-800 ml-1">{program.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Seats:</span>
                      <span className="font-semibold text-gray-800 ml-1">{program.seats}</span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {program.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 bg-gradient-to-r ${program.highlightGradient} text-white text-xs font-medium rounded-full`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  to="/admissions"
                  className={`group/btn inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r ${program.gradient} text-white font-semibold rounded-lg hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 shadow-sm`}
                >
                  <span>Apply Now</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
            <span className="text-gray-700 mr-3">Want to explore all programs?</span>
            <Link
              to="/admissions"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              View All Courses
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPrograms;
