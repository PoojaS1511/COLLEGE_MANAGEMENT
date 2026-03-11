import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Arun Kumar',
      role: 'Software Engineer at Google',
      course: 'Computer Science Engineering',
      year: '2022',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Cube Arts & Engineering College provided me with the perfect foundation for my career. The faculty support, industry exposure, and practical learning approach helped me land my dream job at Google. The college truly prepares you for the real world.',
      company: 'Google'
    },
    {
      id: 2,
      name: 'Ram Sharma',
      role: 'Senior Developer at Microsoft',
      course: 'Computer Science Engineering',
      year: '2021',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'The hands-on projects and industry mentorship at Cube College were game-changers. I learned not just theory but practical skills that directly translated to my professional success. The placement support was exceptional.',
      company: 'Microsoft'
    },
    {
      id: 3,
      name: 'Deepa Nair',
      role: 'Design Engineer at Tesla',
      course: 'Mechanical Engineering',
      year: '2022',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'The mechanical engineering program at Cube College is world-class. The labs, equipment, and faculty expertise gave me the confidence to work on cutting-edge automotive technology at Tesla. Forever grateful!',
      company: 'Tesla'
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9IiNlM2U3ZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNSw1Ii8+PC9zdmc+')] opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-full border border-gray-300 mb-6"
          >
            <StarIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-sm font-medium">Student Success Stories</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            What Our <span className="text-gray-900">Alumni Say</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Hear from our successful graduates who are now leading professionals in top companies worldwide
          </motion.p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                {/* Quote Icon */}
                <div className="flex justify-center mb-8">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-center text-gray-800 leading-relaxed mb-8 font-medium">
                  "{testimonials[currentIndex].text}"
                </blockquote>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full border-4 border-white/30 mr-4"
                  />
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-700 text-sm mb-1">
                      {testimonials[currentIndex].role}
                    </p>
                    <div className="flex items-center justify-center text-xs text-gray-600">
                      <span>{testimonials[currentIndex].course}</span>
                      <span className="mx-2">•</span>
                      <span>Class of {testimonials[currentIndex].year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          >
            <ChevronRightIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-8">Our alumni work at top companies worldwide</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {['Google', 'Microsoft', 'Tesla', 'Intel', 'L&T', 'TCS', 'Infosys', 'Amazon'].map((company) => (
              <div key={company} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <span className="text-gray-800 font-semibold text-lg">{company}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
