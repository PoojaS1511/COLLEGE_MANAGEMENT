import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import '@/styles/ClearanceModal.css';

const ClearanceModal = ({ isOpen, type, request, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        comments: '',
        status: 'PENDING'
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const tableName = `${type.toLowerCase()}_clearance`;
            const { data, error } = await supabase
                .from(tableName)
                .upsert({
                    faculty_id: request.faculty_id,
                    request_id: request.id,
                    ...formData,
                    status: 'PENDING',
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'faculty_id,request_id'
                });

            if (error) throw error;
            
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error updating clearance:', error);
            alert('Failed to update clearance');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{type} Clearance</h3>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="faculty-brief">
                        <p><strong>Faculty:</strong> {request.faculties?.full_name}</p>
                        <p><strong>Employee ID:</strong> {request.faculties?.employee_id}</p>
                        <p><strong>Department:</strong> {request.faculties?.department}</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="fields-group">
                            {type === 'ACADEMIC' && (
                                <>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="syllabus_completed"
                                            name="syllabus_completed"
                                            checked={formData.syllabus_completed || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="syllabus_completed">Syllabus completed</label>
                                    </div>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="internal_marks_uploaded"
                                            name="internal_marks_uploaded"
                                            checked={formData.internal_marks_uploaded || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="internal_marks_uploaded">Internal marks uploaded</label>
                                    </div>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="lab_records_submitted"
                                            name="lab_records_submitted"
                                            checked={formData.lab_records_submitted || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="lab_records_submitted">Lab records submitted</label>
                                    </div>
                                </>
                            )}
                            
                            {type === 'LIBRARY' && (
                                <>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="books_returned"
                                            name="books_returned"
                                            checked={formData.books_returned || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="books_returned">All books returned</label>
                                    </div>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="fines_paid"
                                            name="fines_paid"
                                            checked={formData.fines_paid || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="fines_paid">All fines paid</label>
                                    </div>
                                </>
                            )}
                            
                            {type === 'FINANCIAL' && (
                                <>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="advance_settled"
                                            name="advance_settled"
                                            checked={formData.advance_settled || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="advance_settled">All advances settled</label>
                                    </div>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="salary_processed"
                                            name="salary_processed"
                                            checked={formData.salary_processed || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="salary_processed">Final salary processed</label>
                                    </div>
                                </>
                            )}
                            
                            {type === 'ASSET' && (
                                <>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="laptop_returned"
                                            name="laptop_returned"
                                            checked={formData.laptop_returned || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="laptop_returned">Laptop returned</label>
                                    </div>
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="id_card_returned"
                                            name="id_card_returned"
                                            checked={formData.id_card_returned || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="id_card_returned">ID card returned</label>
                                    </div>
                                </>
                            )}
                            
                            <div className="mt-4">
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    value={formData.comments}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-approve"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClearanceModal;
