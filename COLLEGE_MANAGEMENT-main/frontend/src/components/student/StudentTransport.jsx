import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const StudentTransport = () => {
  const { user } = useAuth()
  const [transportData, setTransportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransportData()
  }, [user])

  const fetchTransportData = async () => {
    try {
      if (!user) return

      // Get current user's student ID from user object
      const currentStudentId = user?.student_id || user?.id

      if (!currentStudentId) {
        setError('Student ID not found. Please contact administrator.')
        setLoading(false)
        return
      }

      // Fetch transport students data from the correct API endpoint
      const response = await fetch(`/api/transport/students?student_id=${currentStudentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || ''}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        // Get the student record for the current user
        const studentData = result.data[0]

        // Create transport info from transport_students table data
        const transportInfo = {
          student: {
            id: studentData.id,
            student_id: studentData.student_id,
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone,
            route_id: studentData.route_id,
            route_name: studentData.route_name,
            pickup_point: studentData.pickup_point,
            status: studentData.status,
            fee_status: studentData.fee_status
          },
          allocation: {
            route_number: studentData.route_id || 'RT-01',
            route_name: studentData.route_name || 'College Route',
            bus_number: 'TN-09-AB-1234', // Default bus number
            pickup_point: studentData.pickup_point || 'College Campus',
            pickup_time: '07:30 AM',
            drop_time: '06:00 PM',
            distance: '25 km',
            duration: '45 minutes',
            driver: {
              name: 'Rajesh Kumar', // Default driver
              phone: '+91 9876543210',
              license: 'TN1234567890'
            },
            conductor: {
              name: 'Transport Staff',
              phone: '+91 9876543211'
            },
            stops: [
              { name: studentData.pickup_point || 'College Campus', time: '07:30 AM', distance: '0 km' },
              { name: 'Main Gate', time: '07:35 AM', distance: '1 km' },
              { name: 'Bus Stop A', time: '07:45 AM', distance: '5 km' },
              { name: 'Bus Stop B', time: '07:55 AM', distance: '10 km' },
              { name: 'Terminal', time: '08:05 AM', distance: '15 km' }
            ],
            fees: {
              monthly_fee: 2500,
              annual_fee: 25000,
              security_deposit: 1000
            },
            rules: [
              'Be at the pickup point 5 minutes before scheduled time',
              'Carry your ID card and transport pass',
              'No standing or moving while bus is in motion',
              'Keep the bus clean and tidy',
              'No eating or drinking inside the bus',
              'Follow COVID-19 safety protocols',
              'Report any issues to the driver or conductor'
            ]
          }
        }

        setTransportData(transportInfo)
      } else {
        // No transport data found for this user
        setTransportData(null)
      }

    } catch (error) {
      console.error('Error fetching transport data:', error)
      setError('Failed to load transport information. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  if (!transportData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Transport Information</h2>
        <p className="text-gray-600">No transport data found.</p>
      </div>
    )
  }

  if (!transportData.allocation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transport Information</h2>
          <div className="text-center py-8">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transport Allocation</h3>
            <p className="text-gray-600 mb-6">
              You have not opted for college transport or no route has been assigned yet.
            </p>
            <button className="bg-royal-600 hover:bg-royal-700 text-white px-6 py-2 rounded-lg font-medium">
              Apply for Transport
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { allocation } = transportData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transport Information</h2>
        <p className="text-gray-600">Your college transport details and route information</p>
      </div>

      {/* Route Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Route Allocation</h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">{allocation.route_number}</h4>
            <p className="text-sm text-gray-600">{allocation.route_name}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <MapPinIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Pickup Point</h4>
            <p className="text-sm text-gray-600">{allocation.pickup_point}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Pickup Time</h4>
            <p className="text-sm text-gray-600">{allocation.pickup_time}</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">{allocation.distance}</div>
            <h4 className="font-semibold text-gray-900">Distance</h4>
            <p className="text-sm text-gray-600">{allocation.duration}</p>
          </div>
        </div>
      </div>

      {/* Bus Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Bus Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Bus Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus Number:</span>
                <span className="font-medium">{allocation.bus_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{allocation.route_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Morning Pickup:</span>
                <span className="font-medium">{allocation.pickup_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Evening Drop:</span>
                <span className="font-medium">{allocation.drop_time}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Staff Details</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900">Driver</h5>
                <p className="text-sm text-gray-600">{allocation.driver.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span>{allocation.driver.phone}</span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Conductor</h5>
                <p className="text-sm text-gray-600">{allocation.conductor.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span>{allocation.conductor.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Stops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Route Stops</h3>
        
        <div className="space-y-4">
          {allocation.stops.map((stop, index) => (
            <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  stop.name === allocation.pickup_point ? 'bg-green-500' : 
                  stop.name === 'Cube Arts College' ? 'bg-royal-500' : 'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{stop.name}</h4>
                    <p className="text-sm text-gray-600">Distance: {stop.distance}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{stop.time}</p>
                    {stop.name === allocation.pickup_point && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Your Stop
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Transport Fee Structure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Monthly Fee</h4>
            <p className="text-2xl font-bold text-blue-600">₹{allocation.fees.monthly_fee.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Annual Fee</h4>
            <p className="text-2xl font-bold text-green-600">₹{allocation.fees.annual_fee.toLocaleString()}</p>
            <p className="text-sm text-green-700">Save ₹5,000</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Security Deposit</h4>
            <p className="text-2xl font-bold text-purple-600">₹{allocation.fees.security_deposit.toLocaleString()}</p>
            <p className="text-sm text-purple-700">Refundable</p>
          </div>
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Transport Rules & Guidelines</h3>
        
        <div className="space-y-3">
          {allocation.rules.map((rule, index) => (
            <div key={index} className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <span className="text-gray-700">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Transport fees must be paid by the 5th of every month</li>
                <li>Bus timings may change due to traffic or weather conditions</li>
                <li>Students must carry their transport pass and ID card</li>
                <li>Report any issues or complaints to the transport office</li>
                <li>Emergency contact numbers are available with the driver</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentTransport
