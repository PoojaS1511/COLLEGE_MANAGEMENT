import { supabase } from '../lib/supabase';
import ExternalCourseService from './ExternalCourseService';

// Cache for storing course data with separate caches for different types
const courseCaches = {
  all: {
    data: null,
    timestamp: null,
    CACHE_DURATION: 6 * 60 * 60 * 1000, // 6 hours cache
  },
  recommended: {
    data: null,
    timestamp: null,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hour cache for recommendations
  },
  userProgress: new Map() // User-specific progress cache
};

// Helper to check if cache is stale
const isCacheStale = (cache) => {
  return !cache.timestamp || (Date.now() - cache.timestamp) > cache.CACHE_DURATION;
};

// Helper to get user-specific cache key
const getUserCacheKey = (userId, type = 'progress') => `${userId}_${type}`;

const CareerPrepService = {
  /**
   * Get all career preparation courses from multiple sources with caching
   * @param {Object} options - Options for fetching courses
   * @param {boolean} options.forceRefresh - Whether to bypass cache
   * @param {string} options.query - Search query
   * @param {number} options.limit - Maximum number of courses to return
   * @returns {Promise<Array>} Array of courses
   */
  async getCourses({ forceRefresh = false, query = '', limit = 20 } = {}) {
    const cacheKey = query ? `search_${query}_${limit}` : `all_${limit}`;
    
    // Return cached data if it's still fresh and not forcing refresh
    if (!forceRefresh && courseCaches.all.data && !isCacheStale(courseCaches.all)) {
      console.log('Returning cached career courses');
      return this.filterAndLimitCourses(courseCaches.all.data, query, limit);
    }

    try {
      console.log('Fetching fresh career courses data');
      
      // Fetch in parallel: local courses and external courses
      const [localCourses, externalCourses] = await Promise.all([
        this.fetchLocalCourses(limit),
        this.fetchExternalCourses(limit)
      ]);
      
      // Combine, deduplicate, and cache results
      const allCourses = this.deduplicateCourses([...localCourses, ...externalCourses]);
      
      // Update cache
      courseCaches.all = {
        data: allCourses,
        timestamp: Date.now(),
        CACHE_DURATION: 30 * 60 * 1000
      };
      
      return this.filterAndLimitCourses(allCourses, query, limit);
    } catch (error) {
      console.error('Error in getCourses:', error);
      // Fallback to external courses only
      const externalCourses = await this.fetchExternalCourses(limit);
      return this.filterAndLimitCourses(externalCourses, query, limit);
    }
  },

  /**
   * Fetch courses from local Supabase database
   * @param {number} limit - Maximum number of courses to return
   * @returns {Promise<Array>} Array of local courses
   */
  async fetchLocalCourses(limit = 20) {
    try {
      const { data = [], error } = await supabase
        .from('career_courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data.map(course => ({
        ...course,
        isLocal: true,
        platform: course.platform || 'Local',
        type: course.type || 'course'
      }));
    } catch (error) {
      console.error('Error fetching local career courses:', error);
      return [];
    }
  },

  /**
   * Fetch courses from external providers
   * @param {number} limit - Maximum number of courses to return
   * @returns {Promise<Array>} Array of external courses
   */
  async fetchExternalCourses(limit = 20) {
    try {
      // Use the enhanced search from external service
      return await ExternalCourseService.searchCourses('', limit);
    } catch (error) {
      console.error('Error fetching external courses:', error);
      return [];
    }
  },
  
  /**
   * Filter and limit courses based on query and limit
   * @param {Array} courses - Array of courses to filter
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of courses to return
   * @returns {Array} Filtered and limited array of courses
   */
  filterAndLimitCourses(courses = [], query = '', limit = 20) {
    if (!Array.isArray(courses)) {
      console.error('Invalid courses array provided to filterAndLimitCourses');
      return [];
    }
    if (!query) return courses.slice(0, limit);
    
    const queryLower = query.toLowerCase();
    return courses
      .filter(course => {
        return (
          course.title?.toLowerCase().includes(queryLower) ||
          course.description?.toLowerCase().includes(queryLower) ||
          course.platform?.toLowerCase().includes(queryLower) ||
          course.instructor?.toLowerCase().includes(queryLower) ||
          (Array.isArray(course.skills) && 
            course.skills.some(skill => 
              skill?.toLowerCase().includes(queryLower)
            )
          )
        );
      })
      .slice(0, limit);
  },
  
  /**
   * Deduplicate courses by URL
   * @param {Array} courses - Array of courses to deduplicate
   * @returns {Array} Deduplicated array of courses
   */
  deduplicateCourses(courses) {
    const seen = new Set();
    return courses.filter(course => {
      const url = course.url?.toLowerCase();
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  },
  
  /**
   * Get course by ID, checking both local and external sources
   * @param {string} courseId - ID of the course to find
   * @returns {Promise<Object|null>} Course object or null if not found
   */
  async getCourseById(courseId) {
    if (!courseId) {
      console.error('No courseId provided to getCourseById');
      return null;
    }
    
    try {
      // Check if it's an external course
      if (courseId.startsWith('udemy_') || courseId.startsWith('coursera_') || courseId.startsWith('edx_')) {
        const [provider] = courseId.split('_');
        const externalId = courseId.replace(`${provider}_`, '');
        
        // Get all courses from the provider and find the matching one
        const courses = await ExternalCourseService[`fetch${provider.charAt(0).toUpperCase() + provider.slice(1)}Courses`]('', 50);
        return courses.find(c => c.id === courseId) || null;
      }
      
      // Check local database
      const { data: course, error } = await supabase
        .from('career_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return course || null;
    } catch (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error);
      return null;
    }
  },

  /**
   * Enroll user in a course
   * @param {string} courseId - ID of the course to enroll in
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} Enrollment data
   */
  async enrollInCourse(courseId, userId) {
    if (!courseId || !userId) {
      throw new Error('Course ID and User ID are required');
    }
    
    try {
      const { data, error } = await supabase
        .from('career_enrollments')
        .upsert(
          { 
            user_id: userId, 
            course_id: courseId,
            status: 'enrolled',
            progress: 0,
            last_accessed: new Date().toISOString()
          },
          { onConflict: 'user_id,course_id' }
        )
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate user progress cache
      courseCaches.userProgress.delete(getUserCacheKey(userId));
      
      return data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  /**
   * Get user's course progress with caching
   * @param {string} userId - ID of the user
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<Array>} Array of user's course enrollments with progress
   */
  async getUserProgress(userId, forceRefresh = false) {
    if (!userId) return [];
    
    const cacheKey = getUserCacheKey(userId);
    const cached = courseCaches.userProgress.get(cacheKey);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && cached && !isCacheStale(cached)) {
      return cached.data;
    }
    
    try {
      const { data, error } = await supabase
        .from('career_enrollments')
        .select(`
          *,
          career_courses (*)
        `)
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      
      const result = data || [];
      
      // Update cache
      courseCaches.userProgress.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        CACHE_DURATION: 5 * 60 * 1000 // 5 minutes cache for user progress
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  },

  /**
   * Update course progress for a user
   * @param {string} enrollmentId - ID of the enrollment record
   * @param {Object} progressData - Progress data to update
   * @param {string} userId - ID of the user (for cache invalidation)
   * @returns {Promise<Object>} Updated enrollment data
   */
  async updateProgress(enrollmentId, progressData, userId) {
    if (!enrollmentId || !progressData) {
      throw new Error('Enrollment ID and progress data are required');
    }
    
    try {
      const { data, error } = await supabase
        .from('career_enrollments')
        .update({
          ...progressData,
          last_accessed: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate user progress cache if userId is provided
      if (userId) {
        courseCaches.userProgress.delete(getUserCacheKey(userId));
      }
      
      return data;
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  },

  /**
   * Get recommended courses based on user's profile and progress
   * @param {string} userId - ID of the user
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<Array>} Array of recommended courses
   */
  async getRecommendedCourses(userId, forceRefresh = false) {
    // Return cached recommendations if available and not forcing refresh
    if (!forceRefresh && courseCaches.recommended.data && !isCacheStale(courseCaches.recommended)) {
      return courseCaches.recommended.data;
    }
    
    try {
      // Get user's enrolled courses to avoid recommending them again
      const userEnrollments = await this.getUserProgress(userId, forceRefresh);
      const enrolledCourseIds = new Set(userEnrollments.map(e => e.course_id));
      
      // Get all available courses
      const allCourses = await this.getCourses({ forceRefresh });
      
      // Filter out already enrolled courses
      const recommended = allCourses
        .filter(course => !enrolledCourseIds.has(course.id))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
        .slice(0, 5); // Limit to top 5 recommendations
      
      // Update cache
      courseCaches.recommended = {
        data: recommended,
        timestamp: Date.now(),
        CACHE_DURATION: 60 * 60 * 1000 // 1 hour cache for recommendations
      };
      
      return recommended;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  },
  
  /**
   * Clear all caches (useful for development or after logout)
   */
  clearCaches() {
    courseCaches.all.data = null;
    courseCaches.all.timestamp = null;
    courseCaches.recommended.data = null;
    courseCaches.recommended.timestamp = null;
    courseCaches.userProgress.clear();
  }
};

export default CareerPrepService;
