import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import { 
  ChartBarIcon, 
  LightBulbIcon, 
  TrophyIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

const StudentCareerInsights = ({ children }) => {
  const { user } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCareerInsights()
  }, [user])

  const fetchCareerInsights = async () => {
    try {
      if (!user) return

      // Mock AI-powered career insights data
      const mockInsights = {
        overall_performance: {
          score: 78,
          grade: 'B+',
          rank: 45,
          total_students: 120
        },
        subject_analysis: [
          { subject: 'Data Structures', score: 85, strength: 'high', trend: 'improving' },
          { subject: 'Database Systems', score: 82, strength: 'high', trend: 'stable' },
          { subject: 'Web Technologies', score: 79, strength: 'medium', trend: 'improving' },
          { subject: 'Computer Networks', score: 72, strength: 'medium', trend: 'declining' },
          { subject: 'Operating Systems', score: 68, strength: 'low', trend: 'stable' },
          { subject: 'Software Engineering', score: 75, strength: 'medium', trend: 'improving' }
        ],
        career_tracks: [
          {
            title: 'Full Stack Developer',
            match_percentage: 85,
            description: 'Based on your strong performance in Web Technologies and Database Systems',
            required_skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js'],
            current_skills: ['HTML/CSS', 'JavaScript', 'SQL'],
            skill_gap: ['React.js', 'Node.js', 'MongoDB']
          },
          {
            title: 'Data Analyst',
            match_percentage: 78,
            description: 'Your analytical skills and database knowledge make this a good fit',
            required_skills: ['Python', 'SQL', 'Tableau', 'Statistics'],
            current_skills: ['SQL', 'Basic Statistics'],
            skill_gap: ['Python', 'Tableau', 'Advanced Statistics']
          },
          {
            title: 'Software Engineer',
            match_percentage: 82,
            description: 'Strong foundation in data structures and programming concepts',
            required_skills: ['Java', 'Python', 'System Design', 'Algorithms'],
            current_skills: ['Java', 'Data Structures'],
            skill_gap: ['Python', 'System Design', 'Advanced Algorithms']
          }
        ],
        learning_paths: [
          {
            title: 'React.js Mastery',
            priority: 'high',
            duration: '8 weeks',
            description: 'Complete React.js course to boost your full-stack development skills',
            modules: ['React Basics', 'State Management', 'Hooks', 'Redux', 'Testing']
          },
          {
            title: 'Database Optimization',
            priority: 'medium',
            duration: '6 weeks',
            description: 'Advanced database concepts and query optimization',
            modules: ['Indexing', 'Query Optimization', 'NoSQL', 'Database Design']
          },
          {
            title: 'System Design Fundamentals',
            priority: 'medium',
            duration: '10 weeks',
            description: 'Learn to design scalable systems',
            modules: ['Scalability', 'Load Balancing', 'Caching', 'Microservices']
          }
        ],
        recommendations: [
          {
            type: 'improvement',
            title: 'Focus on Computer Networks',
            description: 'Your performance in Computer Networks is declining. Consider additional study sessions.',
            action: 'Schedule extra practice sessions'
          },
          {
            type: 'opportunity',
            title: 'Leverage Database Strength',
            description: 'Your strong database skills can be applied to data science roles.',
            action: 'Explore data science courses'
          },
          {
            type: 'skill_gap',
            title: 'Learn Modern Frameworks',
            description: 'Adding React.js and Node.js to your skillset will significantly boost your employability.',
            action: 'Enroll in full-stack development course'
          }
        ]
      }

      setInsights(mockInsights)
    } catch (error) {
      console.error('Error fetching career insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'high':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return '↗️'
      case 'declining':
        return '↘️'
      case 'stable':
        return '→'
      default:
        return '→'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  if (children) {
    return children;
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Insights</h2>
        <p className="text-gray-600">No insights data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Career Insights</h2>
        <p className="text-gray-600">Personalized analysis of your academic performance and career recommendations</p>
      </div>

      {/* Overall Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Performance Score</h4>
            <p className="text-2xl font-bold text-blue-600">{insights.overall_performance.score}/100</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrophyIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Current Grade</h4>
            <p className="text-2xl font-bold text-green-600">{insights.overall_performance.grade}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">#{insights.overall_performance.rank}</div>
            <h4 className="font-semibold text-gray-900">Class Rank</h4>
            <p className="text-sm text-gray-600">out of {insights.overall_performance.total_students}</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {Math.round((1 - insights.overall_performance.rank / insights.overall_performance.total_students) * 100)}%
            </div>
            <h4 className="font-semibold text-gray-900">Percentile</h4>
            <p className="text-sm text-gray-600">Top performer</p>
          </div>
        </div>
      </div>

      {/* Subject Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Strength Analysis</h3>
        
        <div className="space-y-4">
          {insights.subject_analysis.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(subject.strength)}`}>
                    {subject.strength}
                  </span>
                  <span className="text-lg">{getTrendIcon(subject.trend)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        subject.strength === 'high' ? 'bg-green-500' :
                        subject.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{subject.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Track Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended Career Tracks</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {insights.career_tracks.map((track, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{track.title}</h4>
                <span className="text-lg font-bold text-royal-600">{track.match_percentage}%</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{track.description}</p>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Your Skills:</h5>
                <div className="flex flex-wrap gap-1">
                  {track.current_skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Skills to Learn:</h5>
                <div className="flex flex-wrap gap-1">
                  {track.skill_gap.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-royal-500 h-2 rounded-full"
                  style={{ width: `${track.match_percentage}%` }}
                ></div>
              </div>
              
              <button className="w-full bg-royal-600 text-white py-2 px-4 rounded-lg hover:bg-royal-700 transition-colors duration-200">
                Explore Path
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Personalized Learning Paths</h3>
        
        <div className="space-y-4">
          {insights.learning_paths.map((path, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpenIcon className="h-5 w-5 text-royal-600" />
                    <h4 className="font-semibold text-gray-900">{path.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(path.priority)}`}>
                      {path.priority} priority
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{path.description}</p>
                  <p className="text-sm text-gray-500">Duration: {path.duration}</p>
                </div>
                <button className="bg-royal-600 text-white px-4 py-2 rounded-lg hover:bg-royal-700 transition-colors duration-200">
                  Start Learning
                </button>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Modules:</h5>
                <div className="flex flex-wrap gap-2">
                  {path.modules.map((module, moduleIndex) => (
                    <span key={moduleIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI Recommendations</h3>
        
        <div className="space-y-4">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className={`border-l-4 p-4 rounded-lg ${
              rec.type === 'improvement' ? 'border-red-500 bg-red-50' :
              rec.type === 'opportunity' ? 'border-green-500 bg-green-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {rec.type === 'improvement' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                  {rec.type === 'opportunity' && <LightBulbIcon className="h-5 w-5 text-green-500" />}
                  {rec.type === 'skill_gap' && <BriefcaseIcon className="h-5 w-5 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                  <p className="text-gray-700 mb-2">{rec.description}</p>
                  <p className="text-sm font-medium text-gray-900">Recommended Action: {rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentCareerInsights
