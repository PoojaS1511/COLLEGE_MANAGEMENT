import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiDollarSign } from 'react-icons/fi';
import { feesManagement } from '../../data/mockData';

const FeeStructureManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: '',
    applicableTo: '',
    amount: ''
  });

  // Load fee structures on component mount
  useEffect(() => {
    loadFeeStructures();
  }, []);

  const loadFeeStructures = () => {
    // In a real app, this would be an API call
    setFeeStructures(feesManagement.feeStructure);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newFeeStructure = {
      id: editingFee ? editingFee.id : `fs_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      frequency: formData.frequency,
      applicableTo: formData.applicableTo,
      amount: parseFloat(formData.amount) || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, this would be an API call
    if (editingFee) {
      const index = feesManagement.feeStructure.findIndex(fs => fs.id === editingFee.id);
      if (index !== -1) {
        feesManagement.feeStructure[index] = newFeeStructure;
      }
    } else {
      feesManagement.feeStructure.push(newFeeStructure);
    }

    // Reset form and close modal
    setFormData({
      name: '',
      description: '',
      frequency: '',
      applicableTo: '',
      amount: ''
    });
    setEditingFee(null);
    setShowModal(false);
    loadFeeStructures();
  };

  const handleEdit = (feeStructure) => {
    setEditingFee(feeStructure);
    setFormData({
      name: feeStructure.name,
      description: feeStructure.description || '',
      frequency: feeStructure.frequency || '',
      applicableTo: feeStructure.applicableTo || '',
      amount: feeStructure.amount || ''
    });
    setShowModal(true);
  };

  const toggleFeeStructureStatus = (id, currentStatus) => {
    // In a real app, this would be an API call
    const index = feesManagement.feeStructure.findIndex(fs => fs.id === id);
    if (index !== -1) {
      feesManagement.feeStructure[index].isActive = !currentStatus;
      loadFeeStructures();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Fee Structures</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FiPlus className="me-1" /> Create New Fee Structure
        </Button>
      </div>

      {feeStructures.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FiDollarSign className="display-4 text-muted mb-3" />
            <h4>No Fee Structures Found</h4>
            <p className="text-muted">Create your first fee structure to get started</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FiPlus className="me-1" /> Create Fee Structure
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row">
          {feeStructures.map((structure) => (
            <div key={structure.id} className="col-md-6 col-lg-4 mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{structure.name}</h5>
                  <Badge bg={structure.isActive ? 'success' : 'secondary'}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted small mb-3">{structure.description}</p>
                  
                  <div className="mb-3">
                    <Table size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <td className="border-0 p-1">
                            {structure.name}
                          </td>
                          <td className="text-end border-0 p-1">{formatCurrency(structure.amount)}</td>
                        </tr>
                        <tr className="table-active">
                          <td className="border-0 p-1"><strong>Total</strong></td>
                          <td className="text-end border-0 p-1"><strong>{formatCurrency(structure.amount)}</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                    <div className="mt-2">
                      <small className="text-muted">
                        Frequency: {structure.frequency === 'semester' ? 'Per Semester' : 'Annual'}
                      </small>
                      <br />
                      <small className="text-muted">
                        Applies to: {structure.applicableTo === 'all' ? 'All Students' : 'Science/Tech Students'}
                      </small>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(structure)}
                    >
                      <FiEdit2 className="me-1" /> Edit
                    </Button>
                    <Button 
                      variant={structure.isActive ? 'outline-danger' : 'outline-success'} 
                      size="sm"
                      onClick={() => toggleFeeStructureStatus(structure.id, structure.isActive)}
                    >
                      {structure.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Fee Structure Modal */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setEditingFee(null);
          setFormData({
            name: '',
            description: '',
            frequency: '',
            applicableTo: '',
            amount: ''
          });
        }} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingFee ? 'Edit Fee Structure' : 'Create New Fee Structure'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., B.Tech 1st Year Regular"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Frequency</option>
                    <option value="semester">Per Semester</option>
                    <option value="annual">Annual</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Applicable To</Form.Label>
                  <Form.Select
                    name="applicableTo"
                    value={formData.applicableTo}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Applicable To</option>
                    <option value="all">All Students</option>
                    <option value="science-tech">Science/Tech Students</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this fee structure"
              />
            </Form.Group>

            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between">
                <strong>Total Amount:</strong>
                <strong>
                  {formatCurrency(formData.amount)}
                </strong>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setShowModal(false);
                setEditingFee(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingFee ? 'Update Fee Structure' : 'Create Fee Structure'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeStructureManagement;
