import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Link } from 'react-router-dom';

// Lazy load icons with dynamic imports
const DynamicIcons = {
  GraduationCap: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.GraduationCap }))),
  Users: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
  Award: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Award }))),
  BookOpen: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.BookOpen }))),
  ArrowRight: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.ArrowRight })))
};

// Icon fallback component
const IconPlaceholder = ({ className }) => (
  <div className={`inline-block bg-gray-200 rounded ${className}`} style={{ width: '1em', height: '1em' }} />
);

// Optimized slide data with WebP and JPG fallbacks
const slides = [
  {
    image: {
      webp: 'https://images.unsplash.com/photo-1523050853548-8d5f5b5d8f6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80&fm=webp',
      jpg: 'https://images.unsplash.com/photo-1523050853548-8d5f5b5d8f6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      alt: 'Students in a modern campus environment',
      width: 1470,
      height: 980
    },
    title: 'Excellence in Engineering Education',
    subtitle: 'Shaping the innovators of tomorrow with cutting-edge technology and research'
  },
  {
    image: {
      webp: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80&fm=webp',
      jpg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      alt: 'Vibrant campus life',
      width: 1470,
      height: 980
    },
    title: 'Vibrant Campus Life',
    subtitle: 'Experience a dynamic community of learners and leaders'
  },
  {
    image: {
      webp: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80&fm=webp',
      jpg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
      alt: 'State-of-the-art facilities',
      width: 1471,
      height: 980
    },
    title: 'State-of-the-Art Facilities',
    subtitle: 'Learn in world-class laboratories and research centers'
  },
  {
    image: {
      webp: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80&fm=webp',
      jpg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      alt: 'College campus with students',
      width: 1470,
      height: 980
    },
    title: 'Vibrant Campus Community',
    subtitle: 'Join a diverse community of learners and innovators'
  },
  {
    image: {
      webp: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80&fm=webp',
      jpg: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      alt: 'Modern college building',
      width: 1470,
      height: 980
    },
    title: 'Modern Infrastructure',
    subtitle: 'Study in our state-of-the-art academic buildings and facilities'
  }
];

// Optimized image component
const OptimizedImage = React.memo(({ image, priority = false, onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  
  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  return (
    <div className="relative w-full h-full">
      <picture>
        <source srcSet={image.webp} type="image/webp" />
        <img
          src={image.jpg}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading={priority ? 'eager' : 'eager'} // Changed to eager to prevent lazy loading
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
        />
      </picture>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
    </div>
  );
});

// Stats component with lazy-loaded icons
const StatCard = React.memo(({ value, label, icon: Icon, color }) => (
  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div className={`text-3xl font-bold ${color} transition-transform duration-300 group-hover:scale-110`}>
        {value}
      </div>
      <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')} bg-opacity-20`}>
        <React.Suspense fallback={<IconPlaceholder />}>
          <Icon className="w-5 h-5" />
        </React.Suspense>
      </div>
    </div>
    <div className="mt-2 text-sm font-medium text-white">
      {label}
    </div>
  </div>
));

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Memoize slides to prevent unnecessary re-renders
  const memoizedSlides = useMemo(() => slides, []);

  // Track loaded state for each slide
  const [loadedSlides, setLoadedSlides] = useState({});
  const slidesRef = useRef([]);
  
  // Auto-advance slides with smooth transition
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % memoizedSlides.length);
  }, [memoizedSlides.length]);

  // Handle slide navigation with proper cleanup
  useEffect(() => {
    setIsMounted(true);
    let intervalId;
    
    // Preload all images
    const preloadImages = () => {
      return Promise.all(
        memoizedSlides.map((slide, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedSlides(prev => ({
                ...prev,
                [index]: true
              }));
              resolve();
            };
            img.onerror = resolve; // Resolve even if there's an error
            img.src = slide.image.webp;
            
            // Also load jpg fallback
            const img2 = new Image();
            img2.src = slide.image.jpg;
            
            // Store in ref for cleanup
            slidesRef.current[index] = { img, img2 };
          });
        })
      );
    };
    
    // Start preloading
    preloadImages().then(() => {
      // Start slideshow after all images are loaded
      if (!isHovered) {
        intervalId = setInterval(nextSlide, 4000);
      }
    });
    
    return () => {
      clearInterval(intervalId);
      // Clean up image objects
      slidesRef.current.forEach(slide => {
        if (slide?.img) slide.img.onload = null;
        if (slide?.img2) slide.img2.onload = null;
      });
      slidesRef.current = [];
    };
  }, [nextSlide, isHovered, memoizedSlides]);
  
  // Handle hover state changes
  useEffect(() => {
    let intervalId;
    
    if (!isHovered) {
      // Start slideshow when not hovered
      intervalId = setInterval(nextSlide, 4000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovered, nextSlide]);
  
  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Force update to trigger re-render when slides change
  const [_, forceUpdate] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);
  
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Show loading state on server-side
  if (typeof window === 'undefined' || !isMounted) {
    return (
      <div className="relative h-screen w-full bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div 
        className="relative h-screen w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Slides */}
        <div className="relative h-full w-full">
          {memoizedSlides.map((slide, index) => (
            <m.div
              key={`slide-${index}`}
              className={`absolute inset-0 w-full h-full will-change-transform ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              initial={false}
              animate={{ 
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.01
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                opacity: { 
                  duration: 0.7,
                  ease: 'easeInOut'
                },
                scale: {
                  duration: 0.8,
                  ease: 'easeInOut'
                }
              }}
            >
              <div className="relative w-full h-full">
                <OptimizedImage 
                  image={slide.image} 
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </m.div>
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-6xl mx-auto">
            <div className="space-y-8">
              {/* Badge */}
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block mt-12"
              >
                <div className="inline-flex items-center px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/20 mb-2">
                  <span className="text-sm font-medium">Ranked #1 Engineering College</span>
                </div>
              </m.div>

              {/* Main Heading */}
              <m.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  <div className="text-xl md:text-2xl font-normal text-white/90 -mt-1">Welcome to</div>
                  <div className="leading-tight">
                    <div className="block">Cube <span className="text-white">Arts & Engineering</span></div>
                    <div className="text-2xl md:text-3xl font-medium text-white/90 mt-1">College</div>
                  </div>
                </h1>
              </m.div>

              {/* Subtitle */}
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  {memoizedSlides[currentSlide].subtitle}
                </p>
              </m.div>

              {/* CTA Buttons */}
              <m.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-4 -mt-2"
              >
                <Link
                  to="/admissions"
                  className="group inline-flex items-center justify-center px-8 py-3.5 bg-[#1d395e] hover:bg-[#2a4a75] text-white text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[180px]"
                >
                  <span>Apply Now</span>
                  <React.Suspense fallback={<IconPlaceholder />}>
                    <DynamicIcons.ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </React.Suspense>
                </Link>
                <Link
                  to="/programs"
                  className="group inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105 min-w-[180px]"
                >
                  <span>Explore Programs</span>
                </Link>
              </m.div>
            </div>

            {/* Stats Grid */}
            <m.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4"
            >
              <StatCard 
                value="95%" 
                label="Placement Rate" 
                icon={DynamicIcons.Award}
                color="text-[#1d395e]"
              />
              <StatCard 
                value="100+" 
                label="Companies Visited" 
                icon={DynamicIcons.BookOpen}
                color="text-[#1d395e]"
              />
              <StatCard 
                value="₹12 LPA" 
                label="Highest Package" 
                icon={DynamicIcons.Users}
                color="text-[#1d395e]"
              />
              <StatCard 
                value="₹4.5 LPA" 
                label="Average Package" 
                icon={DynamicIcons.GraduationCap}
                color="text-[#1d395e]"
              />
            </m.div>

            {/* Slider Indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 mt-12">
              {memoizedSlides.map((_, index) => (
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
                willChange: 'transform'
              }}
            />
          </svg>
        </div>
      </div>
    </LazyMotion>
  );
};

export default React.memo(HeroSection);
