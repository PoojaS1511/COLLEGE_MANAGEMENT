import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Form validation schema
const facultySchema = yup.object().shape({
  employee_id: yup.string().required('Employee ID is required'),
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .notRequired()
    .nullable(),
  gender: yup.string().required('Gender is required'),
  date_of_birth: yup.date().required('Date of birth is required'),
  address: yup.string(),
  blood_group: yup.string(),
  joining_date: yup.date().default(() => new Date()).required('Joining date is required'),
  status: yup.string().default('active').required('Status is required'),
  department_id: yup.string().required('Department is required'),
  designation: yup.string().required('Designation is required'),
  is_hod: yup.boolean().default(false),
  profile_picture: yup.string().url('Must be a valid URL'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const FacultyForm = ({
  onSubmit,
  onCancel,
  departments = [],
  initialValues = {},
  formLoading = false,
  isEdit = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(facultySchema),
    defaultValues: {
      isEdit,
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      gender: '',
      date_of_birth: '',
      address: '',
      blood_group: '',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'active',
      department_id: '',
      designation: 'Professor',
      is_hod: false,
      profile_picture: '',
      password: '',
      confirm_password: '',
      ...initialValues,
    },
  });

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Remove confirm_password and isEdit before submitting
    const { confirm_password, isEdit, ...submitData } = data;
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Edit Faculty' : 'Add New Faculty'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={formLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                <input
                  type="text"
                  {...register('employee_id')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.employee_id ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading || isEdit}
                  placeholder="e.g., FAC-CSE001"
                />
                {errors.employee_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.employee_id.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  {...register('full_name')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading || isEdit}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  {...register('password')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  {...register('confirm_password')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  placeholder="Enter 10-digit phone number"
                  onChange={(e) => {
                    // Allow only numbers
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setValue('phone', value, { shouldValidate: true });
                  }}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  {...register('gender')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white`}
                  disabled={formLoading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  placeholder="Enter full address"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  {...register('blood_group')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.blood_group ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white`}
                  disabled={formLoading}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date *</label>
                <input
                  type="date"
                  {...register('joining_date')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.joining_date ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                />
                {errors.joining_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.joining_date.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  {...register('status')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white`}
                  disabled={formLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <select
                  {...register('department_id')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.department_id ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white`}
                  disabled={formLoading}
                >
                  <option value="">Select Department</option>
                  {departments
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation *</label>
                <select
                  {...register('designation')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.designation ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white`}
                  disabled={formLoading}
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Visiting Faculty">Visiting Faculty</option>
                  <option value="Adjunct Professor">Adjunct Professor</option>
                  <option value="Emeritus Professor">Emeritus Professor</option>
                </select>
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
                )}
              </div>

              {/* Is HOD */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="is_hod"
                  {...register('is_hod')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={formLoading}
                />
                <label htmlFor="is_hod" className="ml-2 block text-sm font-medium text-gray-700">
                  Is Head of Department (HOD)
                </label>
              </div>

              {/* Profile Picture URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                <input
                  type="url"
                  {...register('profile_picture')}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.profile_picture ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  disabled={formLoading}
                  placeholder="https://example.com/profile.jpg"
                />
                {errors.profile_picture && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile_picture.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : isEdit ? 'Update Faculty' : 'Add Faculty'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyForm;