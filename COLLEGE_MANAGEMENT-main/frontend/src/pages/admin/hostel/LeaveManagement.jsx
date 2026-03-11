import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, message, Descriptions, Badge } from 'antd';
import { supabase } from '../../../../src/lib/supabase';
import { 
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
const { Option } = Select;

const statusColors = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error'
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchLeaves = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      
      // Build the base query
      let query = supabase
        .from('leave_applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search text filter
      if (searchText) {
        query = query.or(
          `name.ilike.%${searchText}%,roll_number.ilike.%${searchText}%,room_number.ilike.%${searchText}%`
        );
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      setLeaves(data || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: count || 0
      }));
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      message.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      message.success('Leave application approved');
      fetchLeaves(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error approving leave:', error);
      message.error('Failed to approve leave application');
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      message.success('Leave application rejected');
      fetchLeaves(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      message.error('Failed to reject leave application');
    }
  };

  const showDetail = (record) => {
    setSelectedLeave(record);
    setIsDetailVisible(true);
  };

  const handleCancel = () => {
    setIsDetailVisible(false);
    setSelectedLeave(null);
  };

  const handleTableChange = (pagination) => {
    fetchLeaves(pagination.current, pagination.pageSize);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchLeaves(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchLeaves(pagination.current, pagination.pageSize);
  }, [statusFilter]);

  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="cursor-pointer hover:text-blue-500" onClick={() => showDetail(record)}>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-sm">{record.roll_number}</div>
          <div className="text-gray-400 text-xs">{record.branch} - {record.year} Year</div>
        </div>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (text) => <div className="font-mono">{text || 'N/A'}</div>,
    },
    {
      title: 'Leave Date',
      dataIndex: 'date_of_stay',
      key: 'date',
      render: (date, record) => (
        <div>
          <div>{dayjs(date).format('MMM D, YYYY')}</div>
          <div className="text-gray-500 text-sm">{record.time}</div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <PhoneOutlined className="mr-1" /> {record.student_mobile}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <PhoneOutlined className="mr-1" /> {record.parent_mobile}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'} className="capitalize">
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created',
      render: (date) => dayjs(date).fromNow(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => showDetail(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="text" 
                icon={<CheckCircleOutlined className="text-green-500" />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(record.id);
                }}
              />
              <Button 
                type="text" 
                danger 
                icon={<CloseCircleOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(record.id);
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card 
        title={
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <CalendarOutlined className="mr-2" />
                Leave Applications
              </h2>
              <Space>
                <Input.Search
                  placeholder="Search by name, roll no, or room"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  allowClear
                  onClear={() => setStatusFilter('all')}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">
                    <Badge status="processing" text="Pending" />
                  </Option>
                  <Option value="approved">
                    <Badge status="success" text="Approved" />
                  </Option>
                  <Option value="rejected">
                    <Badge status="error" text="Rejected" />
                  </Option>
                </Select>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => fetchLeaves(pagination.current, pagination.pageSize)}
                  loading={loading}
                />
              </Space>
            </div>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Table 
          columns={columns} 
          dataSource={leaves} 
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leave applications`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => showDetail(record)
          })}
        />
      </Card>

      {/* Leave Detail Modal */}
      <Modal
        title="Leave Application Details"
        visible={isDetailVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedLeave && (
          <div className="space-y-6">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Student Name" span={2}>
                <div className="font-medium">{selectedLeave.name}</div>
                <div className="text-gray-500">{selectedLeave.roll_number}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Branch & Year">
                {selectedLeave.branch} - {selectedLeave.year} Year
              </Descriptions.Item>
              <Descriptions.Item label="Semester">
                {selectedLeave.semester || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Room Number">
                {selectedLeave.room_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Hostel">
                {selectedLeave.hostel_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Leave Date & Time">
                <div>{dayjs(selectedLeave.date_of_stay).format('dddd, MMMM D, YYYY')}</div>
                <div className="text-gray-600">{selectedLeave.time}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Contact" span={2}>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2" />
                    <span>Student: {selectedLeave.student_mobile}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2" />
                    <span>Parent: {selectedLeave.parent_mobile || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2" />
                    <span>{selectedLeave.email}</span>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Advisor Info" span={2}>
                {selectedLeave.informed_advisor === 'yes' ? (
                  <div>
                    <div><UserOutlined className="mr-2" /> {selectedLeave.advisor_name || 'N/A'}</div>
                    <div><PhoneOutlined className="mr-2" /> {selectedLeave.advisor_mobile || 'N/A'}</div>
                  </div>
                ) : 'Not informed'}
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                <div className="whitespace-pre-line bg-gray-50 p-3 rounded">
                  {selectedLeave.reason || 'No reason provided'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag 
                  color={statusColors[selectedLeave.status] || 'default'}
                  className="text-sm px-3 py-1"
                >
                  {selectedLeave.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted" span={2}>
                {dayjs(selectedLeave.created_at).format('MMMM D, YYYY h:mm A')}
                {selectedLeave.updated_at && (
                  <div className="text-gray-500 text-sm">
                    Last updated: {dayjs(selectedLeave.updated_at).format('MMMM D, YYYY h:mm A')}
                  </div>
                )}
              </Descriptions.Item>
            </Descriptions>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button onClick={handleCancel}>Close</Button>
              {selectedLeave.status === 'pending' && (
                <>
                  <Button 
                    type="primary" 
                    danger 
                    onClick={() => {
                      handleReject(selectedLeave.id);
                      handleCancel();
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      handleApprove(selectedLeave.id);
                      handleCancel();
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagement;
