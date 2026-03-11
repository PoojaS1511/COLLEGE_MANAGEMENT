import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  BeakerIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  fetchLabEquipment, 
  fetchEquipmentTypes, 
  fetchLabs,
  createEquipment, 
  updateEquipment, 
  deleteEquipment 
} from "../../../services/labEquipmentService";
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Spinner from '../../../components/common/Spinner';
  
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'in-use', label: 'In Use', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' }
];

const LabEquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filters, setFilters] = useState({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = useCallback(async () => {
    console.log('Loading data with filters:', filters);
    setIsLoading(true);
    setError(null);
    
    try {
      // First, try to fetch labs to verify database connection
      console.log('Attempting to fetch labs...');
      const labsData = await fetchLabs();
      console.log('Successfully fetched labs:', labsData);
      setLabs(labsData || []);
      
      // Then fetch other data in parallel
      const [types, items] = await Promise.all([
        fetchEquipmentTypes(),
        fetchLabEquipment(filters).catch(err => {
          console.error('Error in fetchLabEquipment:', err);
          throw err;
        })
      ]);
      
      console.log('Successfully loaded all data:', {
        types: types?.length,
        items: items?.length,
        labs: labsData?.length
      });
      
      setEquipmentTypes(types || []);
      setEquipment(items || []);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load equipment data';
      console.error('Error in loadData:', {
        message: errorMessage,
        error: err
      });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value || undefined }));
  };

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    reset({
      ...item,
      last_maintenance_date: item.last_maintenance_date?.split('T')[0],
      next_maintenance_date: item.next_maintenance_date?.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEquipment(null);
    reset({
      name: '',
      description: '',
      lab_id: '',
      equipment_type_id: '',
      status: 'available',
      last_maintenance_date: '',
      next_maintenance_date: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await deleteEquipment(id);
      setEquipment(prev => prev.filter(item => item.id !== id));
      toast.success('Equipment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete equipment');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const equipmentData = {
        ...data,
        last_maintenance_date: data.last_maintenance_date || null,
        next_maintenance_date: data.next_maintenance_date || null
      };

      if (selectedEquipment) {
        const updated = await updateEquipment(selectedEquipment.id, equipmentData);
        setEquipment(prev => 
          prev.map(item => item.id === selectedEquipment.id ? updated : item)
        );
        toast.success('Equipment updated successfully');
      } else {
        const newItem = await createEquipment(equipmentData);
        setEquipment(prev => [...prev, newItem]);
        toast.success('Equipment added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${selectedEquipment ? 'update' : 'add'} equipment`);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Lab Equipment Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage laboratory equipment and their status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={handleAddNew}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="w-full"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select
              name="equipment_type_id"
              value={filters.equipment_type_id || ''}
              onChange={handleFilterChange}
              className="w-full"
            >
              <option value="">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((item) => {
              const status = statusOptions.find(s => s.value === item.status) || 
                           { label: item.status, color: 'bg-gray-100 text-gray-800' };
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BeakerIcon className="h-5 w-5 text-indigo-600 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.last_maintenance_date && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{format(new Date(item.last_maintenance_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${selectedEquipment ? 'Edit' : 'Add New'} Equipment`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            id="name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <Select
            label="Type"
            id="equipment_type_id"
            {...register('equipment_type_id', { required: 'Type is required' })}
            error={errors.equipment_type_id}
          >
            <option value="">Select Type</option>
            {equipmentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Select>

          <Select
            label="Status"
            id="status"
            {...register('status', { required: 'Status is required' })}
            error={errors.status}
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Last Maintenance"
              type="date"
              id="last_maintenance_date"
              {...register('last_maintenance_date')}
            />
            <Input
              label="Next Maintenance"
              type="date"
              id="next_maintenance_date"
              {...register('next_maintenance_date')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedEquipment ? 'Update' : 'Add'} Equipment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabEquipmentManagement;
