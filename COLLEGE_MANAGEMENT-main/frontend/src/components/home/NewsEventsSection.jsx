import React from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const NewsEventsSection = () => {
  const newsEvents = [
    {
      id: 1,
      title: 'Admissions Open for Academic Year 2025-26',
      description: 'Applications are now open for all undergraduate programs. Early bird discount available until March 31st.',
      date: '2025-01-15',
      type: 'admission',
      urgent: true
    },
    {
      id: 2,
      title: 'Annual Technical Symposium - TechFest 2025',
      description: 'Join us for the biggest technical event of the year featuring competitions, workshops, and industry talks.',
      date: '2025-03-20',
      type: 'event',
      urgent: false
    },
    {
      id: 3,
      title: 'Semester Examination Schedule Released',
      description: 'End semester examinations will commence from May 1st, 2025. Check your individual timetables.',
      date: '2025-04-15',
      type: 'exam',
      urgent: true
    },
    {
      id: 4,
      title: 'Cultural Fest - Cube Fiesta 2025',
      description: 'Three days of cultural extravaganza with music, dance, drama, and literary competitions.',
      date: '2025-02-28',
      type: 'event',
      urgent: false
    },
    {
      id: 5,
      title: 'Industry Partnership with Tech Giants',
      description: 'New collaborations with leading tech companies for internships and placement opportunities.',
      date: '2025-01-10',
      type: 'news',
      urgent: false
    }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'admission': return 'bg-green-100 text-green-800'
      case 'exam': return 'bg-red-100 text-red-800'
      case 'event': return 'bg-blue-100 text-blue-800'
      case 'news': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Latest News & Events
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Stay updated with the latest happenings, important announcements, and upcoming events at our college
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(newsEvents[0].type)}`}>
                  {newsEvents[0].type.charAt(0).toUpperCase() + newsEvents[0].type.slice(1)}
                </span>
                {newsEvents[0].urgent && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {newsEvents[0].title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {newsEvents[0].description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(newsEvents[0].date)}
                </div>
                <button className="text-royal-600 hover:text-royal-700 font-medium text-sm flex items-center">
                  Read More
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* News List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {newsEvents.slice(1).map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-royal-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  {item.urgent && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                      URGENT
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-xs">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatDate(item.date)}
                  </div>
                  <button className="text-royal-600 hover:text-royal-700 text-xs font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-royal-600 hover:bg-royal-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300 transform hover:scale-105">
            View All News & Events
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsEventsSection
