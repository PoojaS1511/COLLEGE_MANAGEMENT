import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Simple static imports instead of dynamic
import { GraduationCap, Users, Award, BookOpen, ArrowRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1523050853548-8d5f5b5d8f6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    alt: 'Students in a modern campus environment',
    title: 'Excellence in Engineering Education',
    subtitle: 'Shaping the innovators of tomorrow with cutting-edge technology and research'
  },
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    alt: 'Vibrant campus life',
    title: 'Vibrant Campus Life',
    subtitle: 'Experience a dynamic community of learners and leaders'
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    alt: 'State-of-the-art facilities',
    title: 'State-of-the-Art Facilities',
    subtitle: 'Learn in world-class laboratories and research centers'
  }
];

const StatCard = ({ value, label, icon: Icon, color }) => (
  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div className={`text-3xl font-bold ${color} transition-transform duration-300 group-hover:scale-110`}>
        {value}
      </div>
      <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')} bg-opacity-20`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-2 text-sm font-medium text-white">
      {label}
    </div>
  </div>
);

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovered, nextSlide]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div 
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={`slide-${index}`}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-full max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block mt-12">
              <div className="inline-flex items-center px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/20">
                <span className="text-sm font-medium">Ranked #1 Engineering College</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                <div className="text-xl md:text-2xl font-normal text-white/90 -mt-1">Welcome to</div>
                <div className="leading-tight">
                  <div className="block">Cube <span className="text-white">Arts & Engineering</span></div>
                  <div className="text-2xl md:text-3xl font-medium text-white/90 mt-1">College</div>
                </div>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 -mt-2">
              <Link
                to="/admissions"
                className="group inline-flex items-center justify-center px-8 py-3.5 bg-[#1d395e] hover:bg-[#2a4a75] text-white text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[180px]"
              >
                <span>Apply Now</span>
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="group inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105 min-w-[180px]"
              >
                <span>Explore Programs</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
            <StatCard 
              value="95%" 
              label="Placement Rate" 
              icon={Award}
              color="text-[#1d395e]"
            />
            <StatCard 
              value="100+" 
              label="Companies Visited" 
              icon={BookOpen}
              color="text-[#1d395e]"
            />
            <StatCard 
              value="₹12 LPA" 
              label="Highest Package" 
              icon={Users}
              color="text-[#1d395e]"
            />
            <StatCard 
              value="₹4.5 LPA" 
              label="Average Package" 
              icon={GraduationCap}
              color="text-[#1d395e]"
            />
          </div>

          {/* Slider Indicators */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1">
        <svg viewBox="0 0 1440 120" className="w-full h-24 md:h-32 fill-white">
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            className="transition-all duration-1000 ease-in-out"
            style={{
              transform: `translateX(${currentSlide * 10}px)`,
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
