import React, { useState } from 'react';
import ClearanceModal from './ClearanceModal';

const ClearanceTracker = ({ request = {}, loading = false, onAction, onRefresh }) => {
    const [modalOpen, setModalOpen] = useState(null);
    
    const clearanceTypes = [
        { 
            key: 'ACADEMIC', 
            label: 'Academic Clearance',
            fields: [
                { key: 'syllabus_completed', label: 'Syllabus Completed' },
                { key: 'internal_marks_uploaded', label: 'Internal Marks Uploaded' },
                { key: 'lab_records_submitted', label: 'Lab Records Submitted' }
            ]
        },
        { 
            key: 'LIBRARY', 
            label: 'Library Clearance',
            fields: [
                { key: 'books_returned', label: 'Books Returned' },
                { key: 'fines_paid', label: 'Fines Paid' }
            ]
        },
        { 
            key: 'FINANCIAL', 
            label: 'Financial Clearance',
            fields: [
                { key: 'advance_settled', label: 'Advance Settled' },
                { key: 'salary_processed', label: 'Salary Processed' }
            ]
        },
        { 
            key: 'ASSET', 
            label: 'Asset Clearance',
            fields: [
                { key: 'laptop_returned', label: 'Laptop Returned' },
                { key: 'id_card_returned', label: 'ID Card Returned' }
            ]
        }
    ];

    const getStatus = (type) => {
        const clearanceData = request[`${type.toLowerCase()}_clearance`]?.[0];
        if (!clearanceData) return 'Not Started';
        
        const allFieldsComplete = clearanceTypes
            .find(t => t.key === type)
            .fields.every(field => clearanceData[field.key] === true);
            
        return allFieldsComplete ? 'Completed' : 'In Progress';
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleModalClose = () => {
        setModalOpen(null);
        onRefresh();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {clearanceTypes.map((type) => {
                    const status = getStatus(type.key);
                    return (
                        <div key={type.key} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{type.label}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mt-3">
                                {type.fields.map((field) => {
                                    const isComplete = request[`${type.key.toLowerCase()}_clearance`]?.[0]?.[field.key] || false;
                                    return (
                                        <div key={field.key} className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className={`text-sm ${isComplete ? 'text-gray-700' : 'text-gray-500'}`}>
                                                {field.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={() => setModalOpen(type.key)}
                                className="mt-3 w-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 px-3 rounded-md"
                                disabled={loading}
                            >
                                {status === 'Not Started' ? 'Start' : 'Update'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6">
                <h3 className="font-medium mb-2">Overall Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span>Clearance Progress</span>
                        <span className="font-medium">
                            {clearanceTypes.filter(type => getStatus(type.key) === 'Completed').length} / {clearanceTypes.length} Completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{
                                width: `${(clearanceTypes.filter(type => getStatus(type.key) === 'Completed').length / clearanceTypes.length) * 100}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={() => onAction('REJECTED')}
                    className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50"
                    disabled={loading}
                >
                    Reject Request
                </button>
                <button
                    onClick={() => onAction('APPROVED')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading || clearanceTypes.some(type => getStatus(type.key) !== 'Completed')}
                >
                    Approve Request
                </button>
            </div>

            {modalOpen && (
                <ClearanceModal
                    isOpen={!!modalOpen}
                    type={modalOpen}
                    request={request}
                    onClose={() => setModalOpen(null)}
                    onRefresh={onRefresh}
                />
            )}
        </div>
    );
};

export default ClearanceTracker;
