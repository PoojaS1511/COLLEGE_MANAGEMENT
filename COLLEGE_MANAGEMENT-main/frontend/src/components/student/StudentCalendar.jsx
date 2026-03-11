import React, { useState, useEffect } from 'react'
import { CalendarIcon, AcademicCapIcon, GiftIcon } from '@heroicons/react/24/outline'

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Mock academic calendar data
    const academicEvents = [
      // November 2025 - Added event
      { date: '2025-11-05', title: 'Cube Arts & Engineering Excellence in Education', type: 'event', description: 'Celebrating excellence in technical education and innovation' },
      // January 2025
      { date: '2025-01-01', title: 'New Year Holiday', type: 'holiday', description: 'Public Holiday' },
      { date: '2025-01-15', title: 'Semester Fee Payment Deadline', type: 'deadline', description: 'Last date for fee payment' },
      { date: '2025-01-20', title: 'Final Exams Begin', type: 'exam', description: 'Semester 5 Final Examinations' },
      { date: '2025-01-26', title: 'Republic Day', type: 'holiday', description: 'National Holiday' },
      
      // February 2025
      { date: '2025-02-05', title: 'Final Exams End', type: 'exam', description: 'Last day of examinations' },
      { date: '2025-02-10', title: 'Semester Break Begins', type: 'break', description: 'Winter vacation starts' },
      { date: '2025-02-28', title: 'Cultural Fest - Cube Fiesta', type: 'event', description: 'Annual cultural festival' },
      
      // March 2025
      { date: '2025-03-01', title: 'Cube Fiesta Day 2', type: 'event', description: 'Cultural festival continues' },
      { date: '2025-03-08', title: 'International Women\'s Day', type: 'event', description: 'Special celebration' },
      { date: '2025-03-15', title: 'Semester 6 Begins', type: 'academic', description: 'New semester starts' },
      { date: '2025-03-21', title: 'Holi', type: 'holiday', description: 'Festival of Colors' },
      
      // April 2025
      { date: '2025-04-01', title: 'April Fool\'s Day', type: 'event', description: 'Fun activities' },
      { date: '2025-04-14', title: 'Tamil New Year', type: 'holiday', description: 'Regional Holiday' },
      { date: '2025-04-22', title: 'Earth Day', type: 'event', description: 'Environmental awareness' },
      
      // May 2025
      { date: '2025-05-01', title: 'Labour Day', type: 'holiday', description: 'Public Holiday' },
      { date: '2025-05-15', title: 'IA1 Exams Begin', type: 'exam', description: 'Internal Assessment 1' },
      { date: '2025-05-25', title: 'IA1 Exams End', type: 'exam', description: 'IA1 concludes' },
      
      // June 2025
      { date: '2025-06-01', title: 'Summer Internship Begins', type: 'academic', description: 'Industry internships start' },
      { date: '2025-06-15', title: 'Project Submission Deadline', type: 'deadline', description: 'Semester projects due' },
      { date: '2025-06-21', title: 'International Yoga Day', type: 'event', description: 'Wellness activities' }
    ]
    
    setEvents(academicEvents)
  }, [])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-royal-100' : ''
          } ${isSelected ? 'bg-royal-200' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-royal-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  event.type === 'holiday' ? 'bg-red-100 text-red-800' :
                  event.type === 'exam' ? 'bg-orange-100 text-orange-800' :
                  event.type === 'event' ? 'bg-green-100 text-green-800' :
                  event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                  event.type === 'break' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const getEventsByType = () => {
    const eventTypes = {
      holiday: { title: 'Public Holidays', icon: GiftIcon, color: 'red' },
      exam: { title: 'Examinations', icon: AcademicCapIcon, color: 'orange' },
      event: { title: 'Events', icon: CalendarIcon, color: 'green' },
      deadline: { title: 'Deadlines', icon: CalendarIcon, color: 'red' },
      break: { title: 'Semester Breaks', icon: CalendarIcon, color: 'blue' },
      academic: { title: 'Academic', icon: AcademicCapIcon, color: 'purple' }
    }

    return Object.entries(eventTypes).map(([type, config]) => ({
      ...config,
      events: events.filter(event => event.type === type)
    }))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Calendar</h2>
        <p className="text-gray-600">Important dates, holidays, and academic events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
              <span>Holidays/Deadlines</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-100 rounded mr-2"></div>
              <span>Examinations</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
              <span>Breaks</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 rounded mr-2"></div>
              <span>Academic</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-600">No events scheduled for this date.</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event, index) => (
                    <div key={index} className="border-l-4 border-royal-500 pl-4">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        event.type === 'holiday' ? 'bg-red-100 text-red-800' :
                        event.type === 'exam' ? 'bg-orange-100 text-orange-800' :
                        event.type === 'event' ? 'bg-green-100 text-green-800' :
                        event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                        event.type === 'break' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
            
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .slice(0, 5)
                .map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-5 w-5 text-royal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Event Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Categories</h3>
            
            <div className="space-y-3">
              {getEventsByType().map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <category.icon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm text-gray-900">{category.title}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {category.events.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentCalendar
