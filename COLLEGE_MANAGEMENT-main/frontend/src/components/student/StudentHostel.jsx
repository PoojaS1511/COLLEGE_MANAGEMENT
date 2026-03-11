import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import { 
  HomeIcon, 
  UserGroupIcon, 
  PhoneIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const StudentHostel = () => {
  const { user } = useAuth()
  const [hostelData, setHostelData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHostelData()
  }, [user])

  const fetchHostelData = async () => {
    try {
      if (!user) return

      // Mock hostel data
      const mockHostelData = {
        student: {
          id: 1,
          full_name: 'John Doe',
          hostel_required: true
        },
        hostel_info: {
          hostel_name: 'Cube Arts Hostel Block A',
          room_number: 'A-205',
          floor: '2nd Floor',
          room_type: 'Double Sharing',
          warden_name: 'Dr. Lakshmi Devi',
          warden_phone: '+91 9876543220'
        },
        roommate: {
          name: 'Mike Johnson',
          register_number: 'REG2024003',
          course: 'B.Tech MECH',
          phone: '+91 9876543212'
        },
        facilities: [
          'Wi-Fi Internet',
          '24/7 Security',
          'Mess Facility',
          'Laundry Service',
          'Recreation Room',
          'Study Hall',
          'Medical Facility',
          'Parking'
        ],
        fees: {
          monthly_fee: 8000,
          security_deposit: 15000,
          mess_charges: 4500,
          total_monthly: 12500
        },
        rules: [
          'Lights out by 11:00 PM on weekdays',
          'No outside guests after 9:00 PM',
          'Maintain cleanliness in rooms and common areas',
          'No smoking or alcohol consumption',
          'Report any maintenance issues immediately'
        ]
      }

      setHostelData(mockHostelData)

      if (studentData.hostel_required) {
        // Mock hostel allocation data
        const hostelInfo = {
          student: studentData,
          allocation: {
            hostel_name: 'Cube Hostel Block A',
            room_number: 'A-205',
            floor: '2nd Floor',
            room_type: 'Double Sharing',
            allocated_date: '2024-08-15',
            roommates: [
              { name: 'Rahul Kumar', register_no: 'REG2024002', course: 'B.Tech CSE' }
            ],
            warden: {
              name: 'Dr. Priya Sharma',
              phone: '+91 9876543210',
              email: 'warden.blocka@cubearts.edu'
            },
            facilities: [
              'Wi-Fi Internet',
              'Study Table & Chair',
              'Wardrobe',
              'Attached Bathroom',
              'Common Room',
              'Laundry Service',
              'Mess Facility',
              '24/7 Security'
            ],
            rules: [
              'Curfew time: 10:00 PM on weekdays, 11:00 PM on weekends',
              'No outside food allowed in rooms',
              'Visitors allowed only in common areas',
              'Maintain cleanliness and hygiene',
              'No loud music or disturbance after 9:00 PM',
              'Report any maintenance issues immediately',
              'Follow COVID-19 safety protocols'
            ],
            fees: {
              monthly_rent: 8000,
              security_deposit: 5000,
              mess_charges: 4500,
              total_monthly: 12500
            }
          }
        }
        setHostelData(hostelInfo)
      } else {
        setHostelData({ student: studentData, allocation: null })
      }

    } catch (error) {
      console.error('Error fetching hostel data:', error)
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

  if (!hostelData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hostel Information</h2>
        <p className="text-gray-600">No hostel data found.</p>
      </div>
    )
  }

  if (!hostelData.allocation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hostel Information</h2>
          <div className="text-center py-8">
            <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hostel Allocation</h3>
            <p className="text-gray-600 mb-6">
              You have not opted for hostel accommodation or no room has been allocated yet.
            </p>
            <button className="bg-royal-600 hover:bg-royal-700 text-white px-6 py-2 rounded-lg font-medium">
              Apply for Hostel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { allocation } = hostelData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hostel Information</h2>
        <p className="text-gray-600">Your accommodation details and hostel facilities</p>
      </div>

      {/* Room Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Room Allocation</h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <HomeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">{allocation.hostel_name}</h4>
            <p className="text-sm text-gray-600">{allocation.floor}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">{allocation.room_number}</div>
            <h4 className="font-semibold text-gray-900">Room Number</h4>
            <p className="text-sm text-gray-600">{allocation.room_type}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Roommates</h4>
            <p className="text-sm text-gray-600">{allocation.roommates.length} Person(s)</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <ClockIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Allocated Since</h4>
            <p className="text-sm text-gray-600">
              {new Date(allocation.allocated_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Roommates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Roommates</h3>
        
        {allocation.roommates.length === 0 ? (
          <p className="text-gray-600">No roommates assigned.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allocation.roommates.map((roommate, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {roommate.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{roommate.name}</h4>
                    <p className="text-sm text-gray-600">{roommate.register_no}</p>
                    <p className="text-sm text-gray-500">{roommate.course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warden Contact */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Warden Contact</h3>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-royal-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-royal-600">
                {allocation.warden.name.charAt(0)}
              </span>
            </div>
            <div className="ml-6">
              <h4 className="text-lg font-semibold text-gray-900">{allocation.warden.name}</h4>
              <p className="text-gray-600 mb-2">Hostel Warden</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span>{allocation.warden.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>📧</span>
                  <span className="ml-1">{allocation.warden.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Hostel Facilities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allocation.facilities.map((facility, index) => (
            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm text-gray-900">{facility}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Regulations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Rules & Regulations</h3>
        
        <div className="space-y-3">
          {allocation.rules.map((rule, index) => (
            <div key={index} className="flex items-start">
              <span className="text-royal-600 font-bold mr-3">{index + 1}.</span>
              <span className="text-gray-700">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Hostel Fee Structure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Monthly Charges</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Rent</span>
                <span className="font-medium">₹{allocation.fees.monthly_rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mess Charges</span>
                <span className="font-medium">₹{allocation.fees.mess_charges.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Monthly</span>
                <span className="font-bold text-royal-600">₹{allocation.fees.total_monthly.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">One-time Charges</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-medium">₹{allocation.fees.security_deposit.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-500">
                * Security deposit is refundable at the time of checkout
              </div>
            </div>
          </div>
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
                <li>Hostel fees must be paid by the 5th of every month</li>
                <li>Late payment will incur additional charges</li>
                <li>Room changes are subject to availability and approval</li>
                <li>Report any maintenance issues to the warden immediately</li>
                <li>Follow all safety and security guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentHostel
