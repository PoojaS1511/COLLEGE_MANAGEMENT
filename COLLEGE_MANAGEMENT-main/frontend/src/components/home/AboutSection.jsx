import React from 'react'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  TrophyIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const AboutSection = () => {
  const highlights = [
    {
      icon: AcademicCapIcon,
      title: 'NAAC Accredited',
      description: 'Recognized for academic excellence and quality education standards'
    },
    {
      icon: BuildingOfficeIcon,
      title: '15+ UG Courses',
      description: 'Diverse range of undergraduate programs across multiple disciplines'
    },
    {
      icon: UsersIcon,
      title: '100+ Placement Partners',
      description: 'Strong industry connections ensuring excellent career opportunities'
    },
    {
      icon: TrophyIcon,
      title: 'Award Winning',
      description: 'Multiple accolades for innovation in education and research'
    },
    {
      icon: SparklesIcon,
      title: 'Smart Campus',
      description: 'Modern infrastructure with AI-powered learning support systems'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Exposure',
      description: 'International collaborations and exchange programs'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-black mb-4"
          >
            About Cube Arts and Engineering College
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Established with a vision to provide world-class technical education, Cube Arts and Engineering College 
            has been at the forefront of innovation and academic excellence. We nurture young minds to become 
            industry-ready professionals and future leaders.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                  <highlight.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black ml-4">{highlight.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-black mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide quality technical education that empowers students with knowledge, skills, and values
              necessary to excel in their chosen fields and contribute meaningfully to society. We strive to
              create an environment that fosters innovation, critical thinking, and lifelong learning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-black mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be a premier institution of technical education, recognized globally for academic excellence,
              research innovation, and industry collaboration. We envision producing graduates who are not just
              technically competent but also ethically responsible leaders of tomorrow.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
