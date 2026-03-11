import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ClearanceTracker from '../../../components/admin/clearance/ClearanceTracker';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClearanceManagement = () => {
    const [requests, setRequests] = useState([]);
    const [faculties, setFaculties] = useState({});
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch relieving_requests, faculties, and departments
            console.log('Fetching relieving_requests...');
            const { data: relievingRequests, error: requestsError } = await supabase
                .from('relieving_requests')
                .select('*')
                .order('applied_date', { ascending: false })
                .limit(100);

            if (requestsError) {
                console.error('Error fetching relieving_requests:', requestsError);
                throw requestsError;
            }

            console.log('Fetching faculties...');
            const { data: facultiesData, error: facultiesError } = await supabase
                .from('faculties')
                .select('*');

            if (facultiesError) {
                console.error('Error fetching faculties:', facultiesError);
                throw facultiesError;
            }

            console.log('Fetching departments...');
            const { data: departmentsData, error: departmentsError } = await supabase
                .from('departments')
                .select('*');

            if (departmentsError) {
                console.error('Error fetching departments:', departmentsError);
                throw departmentsError;
            }

            // 2. Create maps for faculties and departments
            const facultiesMap = {};
            facultiesData.forEach(faculty => {
                facultiesMap[faculty.id] = faculty;
            });

            const departmentsMap = {};
            departmentsData.forEach(dept => {
                departmentsMap[dept.id] = dept;
            });

            setFaculties(facultiesMap);
            setDepartments(departmentsMap);

            // 3. If no requests, set empty array and return
            if (!relievingRequests || relievingRequests.length === 0) {
                setRequests([]);
                return;
            }

            // 4. Get all request IDs
            const requestIds = relievingRequests.map(r => r.id);

            // 5. Fetch clearance data in parallel
            console.log('Fetching clearance data...');
            const [
                { data: academicData = [], error: academicError },
                { data: libraryData = [], error: libraryError },
                { data: financialData = [], error: financialError },
                { data: assetData = [], error: assetError }
            ] = await Promise.all([
                supabase
                    .from('academic_clearance')
                    .select('*')
                    .in('request_id', requestIds)
                    .then(({ data, error }) => {
                        if (error) console.error('Academic clearance error:', error);
                        return { data: data || [], error };
                    }),
                supabase
                    .from('library_clearance')
                    .select('*')
                    .in('request_id', requestIds)
                    .then(({ data, error }) => {
                        if (error) console.error('Library clearance error:', error);
                        return { data: data || [], error };
                    }),
                supabase
                    .from('financial_clearance')
                    .select('*')
                    .in('request_id', requestIds)
                    .then(({ data, error }) => {
                        if (error) console.error('Financial clearance error:', error);
                        return { data: data || [], error };
                    }),
                supabase
                    .from('asset_clearance')
                    .select('*')
                    .in('request_id', requestIds)
                    .then(({ data, error }) => {
                        if (error) console.error('Asset clearance error:', error);
                        return { data: data || [], error };
                    })
            ]);

            // 6. Process the data
            const requestsMap = {};

            // Initialize requests with faculty and department data
            relievingRequests.forEach(request => {
                const faculty = facultiesMap[request.faculty_id] || {};
                const department = departmentsMap[faculty.department_id] || {};

                requestsMap[request.id] = {
                    ...request,
                    faculties: {
                        ...faculty,
                        department_name: department.name || 'N/A',
                        department_code: department.code || ''
                    },
                    academic_clearance: [],
                    library_clearance: [],
                    financial_clearance: [],
                    asset_clearance: []
                };
            });

            // Map clearance data
            academicData?.forEach(item => {
                if (requestsMap[item.request_id]) {
                    requestsMap[item.request_id].academic_clearance.push(item);
                }
            });

            libraryData?.forEach(item => {
                if (requestsMap[item.request_id]) {
                    requestsMap[item.request_id].library_clearance.push(item);
                }
            });

            financialData?.forEach(item => {
                if (requestsMap[item.request_id]) {
                    requestsMap[item.request_id].financial_clearance.push(item);
                }
            });

            assetData?.forEach(item => {
                if (requestsMap[item.request_id]) {
                    requestsMap[item.request_id].asset_clearance.push(item);
                }
            });

            setRequests(Object.values(requestsMap));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load clearance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (requestId, action) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('relieving_requests')
                .update({ status: action })
                .eq('id', requestId);

            if (error) throw error;

            toast.success(`Request ${action.toLowerCase()} successfully`);
            fetchData();
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error(`Failed to ${action.toLowerCase()} request`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedRequest) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Faculty Clearance Management</h1>
            
            {selectedRequest ? (
                <div>
                    <button 
                        onClick={() => setSelectedRequest(null)}
                        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to list
                    </button>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedRequest.faculties?.full_name} - {selectedRequest.faculties?.employee_id}
                        </h2>
                        
                        <ClearanceTracker 
                            request={selectedRequest}
                            loading={loading}
                            onAction={(action) => handleAction(selectedRequest.id, action)}
                            onRefresh={fetchData}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Faculty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.faculties?.full_name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {request.faculties?.employee_id || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {request.faculties?.department_name || 'N/A'}
                                                </div>
                                                {request.faculties?.department_code && (
                                                    <div className="text-xs text-gray-500">
                                                        {request.faculties.department_code}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${request.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                                      request.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                                                      'bg-yellow-100 text-yellow-800'}`}>
                                                    {request.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {request.applied_date ? new Date(request.applied_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            {loading ? (
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                                                </div>
                                            ) : (
                                                'No clearance requests found.'
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClearanceManagement;