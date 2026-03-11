import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Statistic, Row, Col, Tag, Divider, DatePicker } from 'antd';
import { DollarOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';

const { Option } = Select;
const { RangePicker } = DatePicker;

const FeeManagement = () => {
  const { user } = useAuth();
  const [feeSummary, setFeeSummary] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // Fetch fee summary for student
  const fetchFeeSummary = async () => {
    try {
      const response = await axios.get('/api/student/fee-summary');
      if (response.data.success) {
        setFeeSummary(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch fee summary');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch departments');
    }
  };

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      const response = await axios.get('/api/fee-structures');
      if (response.data.success) {
        setFeeStructures(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch fee structures');
    }
  };

  // Handle fee payment submission
  const handlePayment = async (values) => {
    try {
      const response = await axios.post('/api/fee-payments', {
        ...values,
        status: 'completed',
        transaction_id: `TXN${Date.now()}` 
      });
      
      if (response.data.success) {
        message.success('Payment recorded successfully');
        setIsPaymentModalVisible(false);
        paymentForm.resetFields();
        fetchFeeSummary();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to record payment');
    }
  };

  // Handle fee structure creation
  const handleCreateFeeStructure = async (values) => {
    try {
      const response = await axios.post('/api/fee-structures', values);
      if (response.data.success) {
        message.success('Fee structure created successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchFeeStructures();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to create fee structure');
    }
  };

  useEffect(() => {
    fetchFeeSummary();
    fetchDepartments();
    fetchFeeStructures();
  }, []);

  // Columns for payment history table
  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'} icon={status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Get current academic year
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  return (
    <div className="fee-management">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Fee Summary" 
            loading={loading}
            extra={
              user?.role === 'admin' ? (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalVisible(true)}
                >
                  Add Fee Structure
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<DollarOutlined />} 
                  onClick={() => setIsPaymentModalVisible(true)}
                >
                  Make Payment
                </Button>
              )
            }
          >
            {feeSummary ? (
              <>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Total Fee"
                        value={feeSummary.total_fee}
                        precision={2}
                        prefix="₹"
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Total Paid"
                        value={feeSummary.total_paid}
                        precision={2}
                        prefix="₹"
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Balance"
                        value={feeSummary.balance}
                        precision={2}
                        prefix="₹"
                        valueStyle={{ color: feeSummary.balance > 0 ? '#cf1322' : '#3f8600' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider orientation="left">Recent Payments</Divider>
                <Table 
                  columns={paymentColumns} 
                  dataSource={feeSummary.payment_history || []} 
                  rowKey="id"
                  pagination={false}
                />
              </>
            ) : (
              <p>No fee information available</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* Fee Structure Modal (Admin Only) */}
      <Modal
        title="Add Fee Structure"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFeeStructure}
          initialValues={{ academic_year: academicYear }}
        >
          <Form.Item
            name="name"
            label="Fee Structure Name"
            rules={[{ required: true, message: 'Please enter a name for the fee structure' }]}
          >
            <Input placeholder="e.g., B.Tech CSE 2023-24" />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select placeholder="Select Department">
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="academic_year"
            label="Academic Year"
            rules={[{ required: true, message: 'Please select academic year' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Total Fee Amount (₹)"
            rules={[{ 
              required: true, 
              message: 'Please enter the fee amount' 
            }]}
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Fee Structure
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal (Student) */}
      <Modal
        title="Make Fee Payment"
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
          initialValues={{ 
            academic_year: academicYear,
            semester: feeSummary?.current_semester || 1
          }}
        >
          <Form.Item
            name="fee_structure_id"
            label="Fee Type"
            rules={[{ required: true, message: 'Please select fee type' }]}
          >
            <Select placeholder="Select Fee Type">
              {feeStructures.map(fee => (
                <Option key={fee.id} value={fee.id}>
                  {fee.name} (₹{fee.amount.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="academic_year"
            label="Academic Year"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="semester"
            label="Semester"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[{ 
              required: true, 
              message: 'Please enter the payment amount' 
            }]}
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="transaction_id"
            label="Transaction ID (Optional)"
          >
            <Input placeholder="Enter transaction reference if available" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Record Payment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeManagement;
