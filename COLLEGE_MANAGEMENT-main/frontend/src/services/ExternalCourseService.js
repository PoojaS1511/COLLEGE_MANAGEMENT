const CURATED_COURSES = [
  {
    id: 'yt_fullstack_freecodecamp',
    title: 'Full-Stack Web Development (freeCodeCamp)',
    platform: 'YouTube',
    provider: 'freeCodeCamp.org',
    url: 'https://www.youtube.com/playlist?list=PLWKjhJtqVAbkArDMazoARtNz1aMwNWmvC',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLWKjhJtqVAbkArDMazoARtNz1aMwNWmvC',
    category: 'Web Development',
    level: 'Beginner',
    duration: '12+ hours of video lessons',
    rating: 4.9,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Quincy Larson & Team',
    description: 'Hands-on full stack JavaScript series covering HTML, CSS, React, APIs, and more.',
    status: 'Available',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    type: 'video_playlist',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'khan_academy_algorithms',
    title: 'Algorithms & Data Structures',
    platform: 'Khan Academy',
    provider: 'Khan Academy',
    url: 'https://www.khanacademy.org/computing/computer-science/algorithms',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLSQl0a2vh4HB0Zk2un0n0K2_Jg3xw2iMh',
    category: 'AI & Data Science',
    level: 'Intermediate',
    duration: 'Self-paced',
    rating: 4.8,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Khan Academy Team',
    description: 'Visual explanations for core algorithms, runtime analysis, graph search, and sorting.',
    status: 'Available',
    skills: ['Algorithms', 'Problem Solving', 'Data Structures'],
    type: 'video_playlist',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'mit_ocw_python',
    title: 'MIT OCW – Intro to Computer Science (Python)',
    platform: 'MIT OpenCourseWare',
    provider: 'MIT',
    url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLUl4u3cNGP62K2DJc2sxun4L-AY1cYDuo',
    category: 'Computer Science',
    level: 'Beginner',
    duration: '9 weeks',
    rating: 4.9,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Prof. Ana Bell',
    description: 'Python-based introduction to computational thinking and problem solving.',
    status: 'Available',
    skills: ['Python', 'Computational Thinking', 'Problem Solving'],
    type: 'video_playlist',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'saylor_project_management',
    title: 'Project Management – Saylor Academy',
    platform: 'Saylor Academy',
    provider: 'Saylor',
    url: 'https://learn.saylor.org/course/view.php?id=87',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLq-gm0yRYwTiisJE9oNvKcJsteVEhDWUp',
    category: 'Business',
    level: 'Intermediate',
    duration: 'Self-paced (~40 hours)',
    rating: 4.7,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Saylor Academy Faculty',
    description: 'PMI-aligned course covering planning, scheduling, budgeting, and risk management.',
    status: 'Available',
    skills: ['Project Planning', 'Risk Management', 'Team Leadership'],
    type: 'video_playlist',
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'coursera_google_data_analytics',
    title: 'Google Data Analytics Professional Certificate',
    platform: 'Coursera',
    provider: 'Google Career Certificates',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    category: 'AI & Data Science',
    level: 'Beginner',
    duration: '6 months (flexible)',
    rating: 4.8,
    language: 'English',
    price: 'Paid',
    is_free: false,
    instructor: 'Google Analysts',
    description: 'Industry-recognized credential for spreadsheets, SQL, visualization, and analytics.',
    status: 'Available',
    skills: ['Data Analysis', 'SQL', 'Tableau', 'Spreadsheets'],
    type: 'link',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'udemy_complete_python',
    title: 'Complete Python Bootcamp',
    platform: 'Udemy',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/complete-python-bootcamp/',
    category: 'Programming',
    level: 'All Levels',
    duration: '22 hours on-demand video',
    rating: 4.7,
    language: 'English',
    price: 'Paid',
    is_free: false,
    instructor: 'Jose Portilla',
    description: 'Comprehensive Python course from basics through advanced concepts with projects.',
    status: 'Available',
    skills: ['Python', 'OOP', 'Data Analysis'],
    type: 'link',
    image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'futurelearn_cybersecurity',
    title: 'Introduction to Cyber Security',
    platform: 'FutureLearn',
    provider: 'The Open University',
    url: 'https://www.futurelearn.com/courses/introduction-to-cyber-security',
    category: 'Security',
    level: 'Beginner',
    duration: '8 weeks (3 hrs/week)',
    rating: 4.6,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'The Open University Faculty',
    description: 'Foundational course covering cyber threats, mitigation strategies, and best practices.',
    status: 'Available',
    skills: ['Cyber Security', 'Risk Assessment', 'Network Security'],
    type: 'link',
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'google_digital_garage_marketing',
    title: 'Fundamentals of Digital Marketing',
    platform: 'Google Digital Garage',
    provider: 'Google',
    url: 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing',
    category: 'Business',
    level: 'Beginner',
    duration: '40 hours',
    rating: 4.8,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Google Trainers',
    description: 'Accredited training for SEO, SEM, social media, analytics, and digital strategy.',
    status: 'Available',
    skills: ['Digital Marketing', 'SEO', 'Analytics'],
    type: 'link',
    image: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=900&q=60'
  },
  {
    id: 'alison_soft_skills',
    title: 'Essential Soft Skills Training',
    platform: 'Alison',
    provider: 'Alison',
    url: 'https://alison.com/course/essential-soft-skills',
    category: 'Career Development',
    level: 'All Levels',
    duration: '2-3 hours',
    rating: 4.5,
    language: 'English',
    price: 'Free',
    is_free: true,
    instructor: 'Alison Instructors',
    description: 'Compact course covering communication, teamwork, problem solving, and leadership.',
    status: 'Available',
    skills: ['Communication', 'Collaboration', 'Career Readiness'],
    type: 'link',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=60'
  }
];

// Debug: Log when the module is loaded
console.log('[ExternalCourseService] Module initialized');
console.log(`[ExternalCourseService] Found ${CURATED_COURSES.length} curated courses`);
if (CURATED_COURSES.length > 0) {
  console.log('[ExternalCourseService] First course sample:', {
    id: CURATED_COURSES[0].id,
    title: CURATED_COURSES[0].title,
    platform: CURATED_COURSES[0].platform
  });
}

const ExternalCourseService = {
  searchCourses: (query = '', limit = 20) => {
    console.log(`[ExternalCourseService] Searching courses with query: "${query}"`);
    
    return new Promise((resolve) => {
      try {
        const searchTerm = query.toLowerCase().trim();
        const filtered = CURATED_COURSES.filter(course => {
          if (!course || typeof course !== 'object') return false;
          return (
            (course.title && course.title.toLowerCase().includes(searchTerm)) ||
            (course.description && course.description.toLowerCase().includes(searchTerm)) ||
            (Array.isArray(course.skills) && course.skills.some(skill => 
              skill && skill.toLowerCase().includes(searchTerm)
            ))
          );
        }).slice(0, limit);
        
        console.log(`[ExternalCourseService] Found ${filtered.length} courses matching "${query}"`);
        setTimeout(() => resolve(filtered), 100);
      } catch (error) {
        console.error('[ExternalCourseService] Error in searchCourses:', error);
        resolve([]);
      }
    });
  },
  
  getAllCuratedCourses: () => {
    console.log(`[ExternalCourseService] Returning ${CURATED_COURSES.length} curated courses`);
    // Create a deep copy to prevent any accidental mutations
    return JSON.parse(JSON.stringify(CURATED_COURSES));
  }
};

export default ExternalCourseService;
