import React from 'react';
import { motion } from 'framer-motion';

const CampusLifeSection = () => {
  const campusFeatures = [
    {
      icon: '🎓',
      title: 'Vibrant Campus Life',
      description: 'Dynamic campus environment fostering creativity, teamwork, and holistic development.'
    },
    {
      icon: '🏠',
      title: 'Hostel & Accommodation',
      description: 'Modern, secure hostels with essential amenities for comfortable student living.'
    },
    {
      icon: '🚌',
      title: 'Transport & Accessibility',
      description: 'Safe, convenient commuting with organized bus routes and flexible schedules.'
    },
    {
      icon: '🎭',
      title: 'Clubs & Student Activities',
      description: 'Cultural, technical, and sports clubs providing leadership, teamwork, and creative growth.'
    },
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Campus health center, counselling, and wellness programs for physical and mental well-being.'
    },
    {
      icon: '📚',
      title: 'Campus Facilities',
      description: 'Libraries, labs, sports grounds, and auditoriums supporting academic and extracurricular excellence.'
    },
    {
      icon: '👥',
      title: 'Student Engagement & Leadership',
      description: 'Student council, feedback system, and recognition programs empowering student voices.'
    },
    {
      icon: '🌟',
      title: 'Commitment to Holistic Development',
      description: 'Every aspect of campus operations and student life is designed to nurture talent, innovation, and personal growth.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Campus Operations & Student Life
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Experience a vibrant campus life that nurtures your academic, social, and personal growth.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 flex-grow">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CampusLifeSection;
