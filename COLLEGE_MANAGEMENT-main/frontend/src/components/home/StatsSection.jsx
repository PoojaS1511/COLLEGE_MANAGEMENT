import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const StatsSection = () => {
  const [counters, setCounters] = useState({
    students: 0,
    courses: 0,
    placement: 0,
    faculty: 0
  })

  const finalStats = {
    students: 5000,
    courses: 15,
    placement: 95,
    faculty: 200
  }

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const intervals = Object.keys(finalStats).map(key => {
      const increment = finalStats[key] / steps
      let current = 0

      return setInterval(() => {
        current += increment
        if (current >= finalStats[key]) {
          current = finalStats[key]
          clearInterval(intervals.find(interval => interval === this))
        }
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }))
      }, stepDuration)
    })

    return () => intervals.forEach(clearInterval)
  }, [])

  const stats = [
    {
      id: 'students',
      value: counters.students,
      suffix: '+',
      label: 'Students Enrolled',
      description: 'Active students across all programs',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'courses',
      value: counters.courses,
      suffix: '+',
      label: 'Courses Offered',
      description: 'Undergraduate and postgraduate programs',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'placement',
      value: counters.placement,
      suffix: '%',
      label: 'Placement Rate',
      description: 'Students placed in top companies',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'faculty',
      value: counters.faculty,
      suffix: '+',
      label: 'Faculty Strength',
      description: 'Experienced and qualified educators',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-black mb-4"
          >
            Our Impact in Numbers
          </motion.h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of students who have transformed their lives through quality education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-5xl font-bold text-black mb-2">
                {stat.value}
                <span className="text-3xl text-gray-600">{stat.suffix}</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">{stat.label}</h3>
              <p className="text-gray-600 mb-4">{stat.description}</p>
              <div className="w-16 h-0.5 bg-black mx-auto mt-4"></div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Recognized Excellence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <div className="text-gray-900 text-lg font-semibold">NAAC Accredited</div>
                <div className="text-gray-600 text-sm mt-1">Quality Assurance</div>
              </div>
              <div className="p-4">
                <div className="text-gray-900 text-lg font-semibold">ISO Certified</div>
                <div className="text-gray-600 text-sm mt-1">International Standards</div>
              </div>
              <div className="p-4">
                <div className="text-gray-900 text-lg font-semibold">AICTE Approved</div>
                <div className="text-gray-600 text-sm mt-1">Government Recognition</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default StatsSection
