import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const AdminSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Mock admin settings data
      const mockSettings = {
        general: {
          college_name: 'Cube Arts and Engineering College',
          college_code: 'CAEC',
          academic_year: '2024-25',
          current_semester: 'Odd Semester',
          admission_status: 'open',
          fee_payment_deadline: '2025-02-15'
        },
        notifications: {
          email_notifications: true,
          sms_notifications: true,
          push_notifications: true,
          admission_alerts: true,
          fee_reminders: true,
          exam_notifications: true,
          bulk_notifications: true
        },
        academic: {
          auto_attendance_calculation: true,
          grade_calculation_method: 'weighted_average',
          minimum_attendance_percentage: 75,
          exam_hall_ticket_generation: true,
          result_publication_approval: true,
          semester_progression_rules: 'automatic'
        },
        system: {
          backup_frequency: 'daily',
          data_retention_period: 7,
          user_session_timeout: 60,
          api_rate_limiting: true,
          maintenance_mode: false,
          debug_mode: false
        },
        security: {
          two_factor_authentication: true,
          password_policy_enforcement: true,
          login_attempt_limit: 5,
          session_encryption: true,
          audit_logging: true,
          ip_whitelisting: false
        }
      }
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (section, newSettings) => {
    setSaving(true)
    try {
      // Mock settings update
      setSettings(prev => ({
        ...prev,
        [section]: newSettings
      }))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (section, key) => {
    const newSettings = {
      ...settings[section],
      [key]: !settings[section][key]
    }
    setSettings(prev => ({
      ...prev,
      [section]: newSettings
    }))
    updateSettings(section, newSettings)
  }

  const handleSelectChange = (section, key, value) => {
    const newSettings = {
      ...settings[section],
      [key]: value
    }
    setSettings(prev => ({
      ...prev,
      [section]: newSettings
    }))
    updateSettings(section, newSettings)
  }

  const handleInputChange = (section, key, value) => {
    const newSettings = {
      ...settings[section],
      [key]: value
    }
    setSettings(prev => ({
      ...prev,
      [section]: newSettings
    }))
  }

  const handleSave = (section) => {
    updateSettings(section, settings[section])
  }

  if (loading) {
    return <LoadingSpinner size="large" text="Loading admin settings..." />
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon },
    { id: 'system', name: 'System', icon: BuildingOfficeIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-royal-500 text-royal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={settings?.general?.college_name || ''}
                    onChange={(e) => handleInputChange('general', 'college_name', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College Code
                  </label>
                  <input
                    type="text"
                    value={settings?.general?.college_code || ''}
                    onChange={(e) => handleInputChange('general', 'college_code', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    value={settings?.general?.academic_year || ''}
                    onChange={(e) => handleSelectChange('general', 'academic_year', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Semester
                  </label>
                  <select
                    value={settings?.general?.current_semester || ''}
                    onChange={(e) => handleSelectChange('general', 'current_semester', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  >
                    <option value="Odd Semester">Odd Semester</option>
                    <option value="Even Semester">Even Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Status
                  </label>
                  <select
                    value={settings?.general?.admission_status || ''}
                    onChange={(e) => handleSelectChange('general', 'admission_status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="waitlist">Waitlist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Payment Deadline
                  </label>
                  <input
                    type="date"
                    value={settings?.general?.fee_payment_deadline || ''}
                    onChange={(e) => handleInputChange('general', 'fee_payment_deadline', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('general')}
                  disabled={saving}
                  className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                {Object.entries(settings?.notifications || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {key === 'email_notifications' && 'Send notifications via email'}
                        {key === 'sms_notifications' && 'Send notifications via SMS'}
                        {key === 'push_notifications' && 'Send push notifications'}
                        {key === 'admission_alerts' && 'Alerts for new admissions'}
                        {key === 'fee_reminders' && 'Automatic fee payment reminders'}
                        {key === 'exam_notifications' && 'Exam schedule and result notifications'}
                        {key === 'bulk_notifications' && 'Enable bulk notification sending'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleToggle('notifications', key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Attendance Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings?.academic?.minimum_attendance_percentage || ''}
                    onChange={(e) => handleInputChange('academic', 'minimum_attendance_percentage', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Calculation Method
                  </label>
                  <select
                    value={settings?.academic?.grade_calculation_method || ''}
                    onChange={(e) => handleSelectChange('academic', 'grade_calculation_method', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  >
                    <option value="weighted_average">Weighted Average</option>
                    <option value="simple_average">Simple Average</option>
                    <option value="best_of_attempts">Best of Attempts</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {Object.entries(settings?.academic || {}).filter(([key]) => typeof settings.academic[key] === 'boolean').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleToggle('academic', key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave('academic')}
                    disabled={saving}
                    className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings?.system?.backup_frequency || ''}
                    onChange={(e) => handleSelectChange('system', 'backup_frequency', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention Period (years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings?.system?.data_retention_period || ''}
                    onChange={(e) => handleInputChange('system', 'data_retention_period', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={settings?.system?.user_session_timeout || ''}
                    onChange={(e) => handleInputChange('system', 'user_session_timeout', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings?.system || {}).filter(([key]) => typeof settings.system[key] === 'boolean').map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleToggle('system', key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('system')}
                  disabled={saving}
                  className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Attempt Limit
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings?.security?.login_attempt_limit || ''}
                    onChange={(e) => handleInputChange('security', 'login_attempt_limit', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>

                <div className="space-y-4">
                  {Object.entries(settings?.security || {}).filter(([key]) => typeof settings.security[key] === 'boolean').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleToggle('security', key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave('security')}
                    disabled={saving}
                    className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-royal-600"></div>
              <span className="text-gray-900">Saving settings...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
