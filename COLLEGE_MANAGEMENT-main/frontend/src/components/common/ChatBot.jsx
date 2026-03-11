import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm the Cube Arts Admissions Bot. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')

  const quickQuestions = [
    "Admission process",
    "Course details",
    "Fee structure",
    "Placement statistics",
    "Hostel facilities"
  ]

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('admission') || message.includes('apply')) {
      return "For admissions, you can apply online through our admissions portal. The application process includes filling out the form, uploading documents, and paying the application fee. Would you like me to guide you through the process?"
    } else if (message.includes('course') || message.includes('program')) {
      return "We offer 15+ undergraduate courses including Computer Science, Electronics, Mechanical, Civil, and Electrical Engineering. Each program is designed with industry-relevant curriculum. Which specific course interests you?"
    } else if (message.includes('fee') || message.includes('cost')) {
      return "Our fee structure varies by course. For B.Tech programs, fees range from ₹60,000 to ₹75,000 per semester. We also offer scholarships for meritorious students. Would you like detailed fee information for a specific course?"
    } else if (message.includes('placement')) {
      return "We have an excellent placement record with 95% placement rate. Our students are placed in top companies like TCS, Infosys, Wipro, and many more. The average package is ₹4.5 LPA with highest being ₹12 LPA."
    } else if (message.includes('hostel')) {
      return "We provide separate hostel facilities for boys and girls with modern amenities. The hostels are well-maintained with 24/7 security, Wi-Fi, and recreational facilities. Would you like to know about hostel fees and booking process?"
    } else {
      return "I'd be happy to help you with information about admissions, courses, fees, placements, or facilities. You can also call our admissions office at +91 44 1234 5678 for detailed assistance."
    }
  }

  const handleQuickQuestion = (question) => {
    setInputText(question)
    handleSendMessage()
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#032A51] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-opacity-90"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-dark-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Admissions Bot</h3>
                <p className="text-sm opacity-90">Ask me anything!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-dark-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors duration-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-dark-600 hover:bg-dark-700 text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
