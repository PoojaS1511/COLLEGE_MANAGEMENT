import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  CogIcon,
  BuildingLibraryIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const WhyChooseUs = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Top Placement Records',
      description: '95% placement rate with top companies like TCS, Infosys, Wipro, and many more',
      stats: '95% Placement Rate',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: CogIcon,
      title: 'Industry-Centric Curriculum',
      description: 'Updated curriculum designed with industry experts to meet current market demands',
      stats: '100% Industry Relevant',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: BuildingLibraryIcon,
      title: 'Smart Campus & Facilities',
      description: 'Modern infrastructure with state-of-the-art labs, library, and recreational facilities',
      stats: '50+ Modern Labs',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: CpuChipIcon,
      title: 'AI-Powered Learning Support',
      description: 'Personalized learning paths and AI-driven academic support for better outcomes',
      stats: 'AI-Enhanced Learning',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Affordable Fee + Scholarships',
      description: 'Quality education at affordable fees with merit-based scholarships and financial aid',
      stats: '40+ Scholarships',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Faculty',
      description: 'Experienced faculty with industry background and research expertise',
      stats: '200+ Expert Faculty',
      color: 'from-red-400 to-red-600'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Cube Arts & Engineering College?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover what makes us the <span className="font-semibold text-blue-600">preferred choice</span> for thousands of students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>

              {/* Icon with Glow Effect */}
              <div className="relative mb-4">
                <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-md group-hover:scale-105 transition-all duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                {feature.title}
              </h3>

              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                {feature.description}
              </p>

              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.color} text-white shadow-sm`}>
                {feature.stats}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16" data-aos="fade-up" data-aos-delay="700">
          <div className="relative bg-[#1d395e] rounded-2xl p-8 text-white shadow-xl overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Ready to Start Your Journey?
              </h3>
              <p className="text-base md:text-lg mb-6 opacity-95 max-w-2xl mx-auto">
                Join thousands of successful alumni who started their careers with us
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group bg-white text-[#1d395e] hover:bg-gray-50 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow hover:shadow-md hover:-translate-y-0.5 transform text-sm sm:text-base">
                  Download Brochure
                  <span className="inline-block ml-1.5 group-hover:translate-x-1 transition-transform duration-200">→</span>
                </button>
                <button className="group border-2 border-white text-white hover:bg-white hover:text-[#1d395e] font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow hover:shadow-md hover:-translate-y-0.5 transform text-sm sm:text-base">
                  Schedule Visit
                  <span className="inline-block ml-1.5 group-hover:translate-x-1 transition-transform duration-200">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
