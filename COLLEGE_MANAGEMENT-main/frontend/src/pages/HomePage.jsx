import React, { lazy, Suspense, useEffect, useRef, useState, startTransition } from 'react';

// Import the optimized hero section directly (not lazy loaded since it's critical for LCP)
import OptimizedHeroSection from '../components/home/OptimizedHeroSection-fixed';
const AboutSection = lazy(() => import('../components/home/AboutSection'));
const FeaturedPrograms = lazy(() => import('../components/home/FeaturedPrograms'));
const WhyChooseUs = lazy(() => import('../components/home/WhyChooseUs'));
const StatsSection = lazy(() => import('../components/home/StatsSection'));
const TestimonialsSection = lazy(() => import('../components/home/TestimonialsSection'));
const NewsEventsSection = lazy(() => import('../components/home/NewsEventsSection'));
const PlacementHighlights = lazy(() => import('../components/home/PlacementHighlights'));
const ChatBot = lazy(() => import('../components/common/ChatBot'));

// Loading placeholder component
const LoadingPlaceholder = ({ height = 'h-96' }) => (
  <div className={`${height} w-full bg-gray-100 animate-pulse rounded-lg`}></div>
);

// Component that will be rendered when it comes into view
const LazyComponent = ({ component: Component, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  return (
    <div ref={componentRef} className="w-full">
      {isVisible ? (
        <Suspense fallback={<LoadingPlaceholder />}>
          <Component {...props} />
        </Suspense>
      ) : (
        <LoadingPlaceholder />
      )}
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero section - now optimized and loaded immediately */}
      <OptimizedHeroSection />

      {/* Other sections load as they come into view */}
      <LazyComponent component={AboutSection} />
      <LazyComponent component={FeaturedPrograms} />
      <LazyComponent component={WhyChooseUs} />
      <LazyComponent component={StatsSection} />
      <LazyComponent component={TestimonialsSection} />
      <LazyComponent component={NewsEventsSection} />
      <LazyComponent component={PlacementHighlights} />

      {/* Chatbot loads with lower priority */}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
};

export default HomePage
