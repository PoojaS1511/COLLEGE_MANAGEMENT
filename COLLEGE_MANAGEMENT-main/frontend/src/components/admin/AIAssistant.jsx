import React, { useState } from 'react'
import { SparklesIcon, ChatBubbleLeftRightIcon, LightBulbIcon } from '@heroicons/react/24/outline'

const AIAssistant = () => {
  const [query, setQuery] = useState('')
  const [responses, setResponses] = useState([])

  const handleQuery = () => {
    if (!query.trim()) return

    // Mock AI responses
    const mockResponses = {
      'show cs students with attendance less than 60%': {
        type: 'data',
        result: 'Found 5 CS students with attendance < 60%: John Doe (58%), Jane Smith (55%), Mike Johnson (52%), Sarah Wilson (59%), Tom Brown (57%)'
      },
      'list students eligible for merit scholarships': {
        type: 'data',
        result: 'Found 23 students eligible for merit scholarships based on >85% marks and <5 LPA family income'
      },
      'predict dropout risks': {
        type: 'analysis',
        result: 'AI Analysis: 8 students at high dropout risk based on attendance (<50%), performance (<40%), and engagement metrics'
      }
    }

    const response = mockResponses[query.toLowerCase()] || {
      type: 'general',
      result: 'AI Assistant is processing your query. This feature will provide intelligent insights and recommendations.'
    }

    setResponses([...responses, { query, response }])
    setQuery('')
  }

  const suggestedQueries = [
    'Show CS students with < 60% attendance',
    'List students eligible for merit scholarships',
    'Predict dropout risks',
    'Generate remedial plans for failing students',
    'Show hostel occupancy trends',
    'Analyze fee payment patterns'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart AI Assistant</h1>
        <p className="text-gray-600">Natural language queries and intelligent insights</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">AI Query Interface</h2>
        </div>

        {/* Query Input */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about students, attendance, performance..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button
              onClick={handleQuery}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Queries:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-4">
          {responses.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">Query: {item.query}</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <SparklesIcon className="h-4 w-4 text-purple-600 mt-0.5" />
                      <p className="text-purple-800">{item.response.result}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12">
            <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant Ready</h3>
            <p className="text-gray-600">
              Ask natural language questions about students, attendance, performance, and more.
              The AI will provide intelligent insights and recommendations.
            </p>
          </div>
        )}
      </div>

      {/* AI Capabilities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <SparklesIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Natural Language Queries</h4>
            <p className="text-sm text-gray-600">Ask questions in plain English and get intelligent responses</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <LightBulbIcon className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Predictive Analytics</h4>
            <p className="text-sm text-gray-600">Predict dropout risks and suggest remedial actions</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Smart Recommendations</h4>
            <p className="text-sm text-gray-600">Get actionable insights and improvement suggestions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
