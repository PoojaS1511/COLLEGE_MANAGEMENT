import React from 'react'
import { motion } from 'framer-motion'
import { StarIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid'

const PlacementHighlights = () => {
  const companies = [
    { name: 'TCS', logo: '/logos/tcs.png' },
    { name: 'Infosys', logo: '/logos/infosys.png' },
    { name: 'Wipro', logo: '/logos/wipro.png' },
    { name: 'Cognizant', logo: '/logos/cognizant.png' },
    { name: 'Accenture', logo: '/logos/accenture.png' },
    { name: 'IBM', logo: '/logos/ibm.png' },
    { name: 'Microsoft', logo: '/logos/microsoft.png' },
    { name: 'Amazon', logo: '/logos/amazon.png' },
    { name: 'Google', logo: '/logos/google.png' },
    { name: 'Zoho', logo: '/logos/zoho.png' },
    { name: 'HCL', logo: '/logos/hcl.png' },
    { name: 'Tech Mahindra', logo: '/logos/techmahindra.png' }
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      company: 'TCS',
      package: '₹6.5 LPA',
      quote: 'The technical training and industry exposure at Cube Arts prepared me well for my career in software development.',
      image: '/testimonials/rajesh.jpg',
      batch: '2024'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      company: 'Infosys',
      package: '₹7.2 LPA',
      quote: 'The placement cell provided excellent guidance and mock interviews that boosted my confidence.',
      image: '/testimonials/priya.jpg',
      batch: '2024'
    },
    {
      id: 3,
      name: 'Arjun Patel',
      company: 'Microsoft',
      package: '₹12 LPA',
      quote: 'The coding culture and competitive programming support helped me crack top tech companies.',
      image: '/testimonials/arjun.jpg',
      batch: '2023'
    }
  ]

  const placementStats = [
    { label: 'Placement Rate', value: '95%', icon: StarIcon },
    { label: 'Companies Visited', value: '100+', icon: BuildingOfficeIcon },
    { label: 'Highest Package', value: '₹12 LPA', icon: CurrencyDollarIcon },
    { label: 'Average Package', value: '₹4.5 LPA', icon: CurrencyDollarIcon }
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
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Placement Highlights
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Our students are placed in top companies with excellent packages, thanks to our industry-focused curriculum and dedicated placement support
          </motion.p>
        </div>

        {/* Placement Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {placementStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl border border-[#1d395e]/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex p-3 bg-[#1d395e]/10 rounded-full mb-4">
                <stat.icon className="h-6 w-6 text-[#1d395e]" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#1d395e] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Our Recruitment Partners
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-20"
              >
                <div className="text-gray-600 font-semibold text-sm text-center">
                  {company.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Student Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Success Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#1d395e] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.company} • {testimonial.batch}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="bg-[#1d395e]/10 text-[#1d395e] px-3 py-1 rounded-full text-sm font-semibold">
                    {testimonial.package}
                  </span>
                </div>
                <blockquote className="text-gray-700 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex text-[#1d395e] mt-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-[#1d395e] rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Launch Your Career?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join our successful alumni network and get placed in top companies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#1d395e] hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                View Placement Report
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-[#1d395e] hover:border-[#1d395e] font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Download Brochure
              </button>
              <button className="bg-[#1d395e] hover:bg-[#2a4a75] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-transparent hover:border-[#1d395e]">
                Apply Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PlacementHighlights
