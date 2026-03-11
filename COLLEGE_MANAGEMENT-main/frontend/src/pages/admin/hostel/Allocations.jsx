import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../src/lib/supabase';
import { 
  Table, Button, Space, Modal, Form, Input, Select, 
  message, Popconfirm, Card, Typography, InputNumber 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined 
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch allocations from Supabase
  const fetchAllocations = async () => {
    console.log('Fetching allocations...');
    try {
      setLoading(true);
      
      // First, verify the Supabase connection
      console.log('Supabase client:', !!supabase ? 'Initialized' : 'Not initialized');
      
      // Check if we can query the database
      const { data, error, status } = await supabase
        .from('allocations')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Query status:', status);
      console.log('Data received:', data);
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('No data returned from allocations table');
        setAllocations([]);
        return;
      }
      
      setAllocations(data);
    } catch (error) {
      console.error('Error fetching allocations:', {
        message: error.message,
        details: error,
        stack: error.stack
      });
      message.error(`Failed to load allocations: ${error.message}`);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // Handle form submission (create/update)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('allocations')
          .update(values)
          .eq('id', editingRecord.id);

        if (error) throw error;
        message.success('Allocation updated successfully');
      } else {
        // Create new record
        const { error } = await supabase
          .from('allocations')
          .insert([{ ...values }]);

        if (error) throw error;
        message.success('Allocation created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchAllocations();
    } catch (error) {
      console.error('Error saving allocation:', error);
      message.error(error.message || 'Failed to save allocation');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      message.success('Allocation deleted successfully');
      fetchAllocations();
    } catch (error) {
      console.error('Error deleting allocation:', error);
      message.error('Failed to delete allocation');
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      bed_number: record.bed_number,
      reg_no: record.reg_no,
      department: record.department,
      fees_status: record.fees_status,
      hostel: record.hostel,
      floor: record.floor,
      room_number: record.room_number,
      status: record.status,
      email: record.email,
      name: record.name,
      student_id: record.student_id
    });
    setIsModalVisible(true);
  };

  // Filter allocations based on search text
  const filteredAllocations = allocations.filter(alloc => 
    Object.values(alloc).some(
      val => val && val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name),
    },
    {
      title: 'Reg No',
      dataIndex: 'reg_no',
      key: 'reg_no',
    },
    {
      title: 'Hostel',
      dataIndex: 'hostel',
      key: 'hostel',
      filters: Array.from(new Set(allocations.map(item => item.hostel).filter(Boolean))).map(hostel => ({
        text: hostel,
        value: hostel,
      })),
      onFilter: (value, record) => record.hostel === value,
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record) => `${record.room_number || 'N/A'}`,
    },
    {
      title: 'Bed',
      dataIndex: 'bed_number',
      key: 'bed_number',
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Fees Status',
      dataIndex: 'fees_status',
      key: 'fees_status',
      render: (status) => (
        <span style={{
          color: status === 'Paid' ? '#52c41a' : 
                 status === 'Partially Paid' ? '#faad14' : '#f5222d',
          fontWeight: 500
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{
          color: status === 'Active' ? '#52c41a' : 
                 status === 'Pending' ? '#faad14' : '#f5222d',
          fontWeight: 500
        }}>
          {status}
        </span>
      ),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this allocation?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card 
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="m-0">Hostel Allocations</Title>
            <div className="flex space-x-2">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingRecord(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                New Allocation
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchAllocations}
                loading={loading}
              />
            </div>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={filteredAllocations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} allocations`
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={`${editingRecord ? 'Edit' : 'New'} Allocation`}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'Active',
            fees_status: 'Paid',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Student Name"
              rules={[{ required: true, message: 'Please enter student name' }]}
            >
              <Input placeholder="Enter student name" />
            </Form.Item>

            <Form.Item
              name="reg_no"
              label="Registration Number"
              rules={[{ required: true, message: 'Please enter registration number' }]}
            >
              <Input placeholder="Enter registration number" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                <Option value="CSE">Computer Science</Option>
                <Option value="ECE">Electronics</Option>
                <Option value="MECH">Mechanical</Option>
                <Option value="CIVIL">Civil</Option>
                <Option value="EEE">Electrical</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="hostel"
              label="Hostel"
              rules={[{ required: true, message: 'Please select hostel' }]}
            >
              <Select placeholder="Select hostel">
                <Option value="Boys Hostel A">Boys Hostel A</Option>
                <Option value="Boys Hostel B">Boys Hostel B</Option>
                <Option value="Girls Hostel A">Girls Hostel A</Option>
                <Option value="Girls Hostel B">Girls Hostel B</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="floor"
              label="Floor"
              rules={[{ required: true, message: 'Please enter floor' }]}
            >
              <Input placeholder="Enter floor" />
            </Form.Item>

            <Form.Item
              name="room_number"
              label="Room Number"
              rules={[{ required: true, message: 'Please enter room number' }]}
            >
              <InputNumber 
                min={1} 
                className="w-full" 
                placeholder="Enter room number" 
              />
            </Form.Item>

            <Form.Item
              name="bed_number"
              label="Bed Number"
              rules={[{ required: true, message: 'Please enter bed number' }]}
            >
              <InputNumber 
                min={1} 
                className="w-full" 
                placeholder="Enter bed number" 
              />
            </Form.Item>

            <Form.Item
              name="fees_status"
              label="Fees Status"
              rules={[{ required: true, message: 'Please select fees status' }]}
            >
              <Select>
                <Option value="Paid">Paid</Option>
                <Option value="Partially Paid">Partially Paid</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="receipt_url" label="Receipt URL">
            <Input placeholder="Enter receipt URL" />
          </Form.Item>

          <Form.Item name="student_id" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Allocations;
