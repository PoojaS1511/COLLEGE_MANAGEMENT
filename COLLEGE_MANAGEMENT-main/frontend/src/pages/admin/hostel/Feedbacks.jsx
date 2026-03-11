import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Tag, Button, message, Select, Badge } from 'antd';
import { supabase } from '../../../../src/lib/supabase';
import { 
  ReloadOutlined,
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const statusColors = {
  pending: 'processing',
  resolved: 'success',
  'in-progress': 'warning'
};

const urgencyColors = {
  low: 'blue',
  medium: 'orange',
  high: 'red'
};

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('feedback_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      message.success('Feedback status updated');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      message.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, typeFilter]);

  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-sm">{record.roll_no}</div>
          <div className="text-gray-400 text-xs">{record.department}</div>
        </div>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room_no',
      key: 'room_no',
      render: (room) => room || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'feedback_type',
      key: 'feedback_type',
      render: (type) => (
        <Tag color="blue" className="capitalize">
          {type?.replace('-', ' ') || 'General'}
        </Tag>
      ),
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => (
        <Tag color={urgencyColors[urgency] || 'default'} className="capitalize">
          {urgency}
        </Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => (
        <div className="max-w-xs whitespace-normal">
          {text}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          defaultValue={status}
          onChange={(value) => updateStatus(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="pending">
            <Badge status="processing" text="Pending" />
          </Option>
          <Option value="in-progress">
            <Badge status="warning" text="In Progress" />
          </Option>
          <Option value="resolved">
            <Badge status="success" text="Resolved" />
          </Option>
        </Select>
      ),
    },
  ];

  const feedbackTypes = [...new Set(feedbacks.map(f => f.feedback_type).filter(Boolean))];

  return (
    <div className="p-4">
      <Card 
        title={
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageOutlined className="mr-2" />
                Hostel Feedbacks
              </h2>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchFeedbacks}
                loading={loading}
              >
                Refresh
              </Button>
            </div>
            <div className="flex space-x-4">
              <Select
                placeholder="Filter by status"
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                onClear={() => setStatusFilter('all')}
              >
                <Option value="all">All Statuses</Option>
                <Option value="pending">
                  <Badge status="processing" text="Pending" />
                </Option>
                <Option value="in-progress">
                  <Badge status="warning" text="In Progress" />
                </Option>
                <Option value="resolved">
                  <Badge status="success" text="Resolved" />
                </Option>
              </Select>
              
              <Select
                placeholder="Filter by type"
                style={{ width: 180 }}
                value={typeFilter}
                onChange={setTypeFilter}
                allowClear
                onClear={() => setTypeFilter('all')}
              >
                <Option value="all">All Types</Option>
                {feedbackTypes.map(type => (
                  <Option key={type} value={type}>
                    {type.replace('-', ' ')}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Table 
          columns={columns} 
          dataSource={feedbacks} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} feedbacks`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default Feedbacks;
