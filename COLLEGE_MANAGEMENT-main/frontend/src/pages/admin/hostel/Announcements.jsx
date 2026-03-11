import React, { useState, useEffect } from 'react';
import { supabase } from "../../../../src/lib/supabase";
import { 
  Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Tag, DatePicker, 
  Typography, Divider, Tooltip, Row, Col, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, 
  SearchOutlined, ReloadOutlined, CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch announcements from Supabase
  const fetchAnnouncements = async (current = 1, pageSize = 10) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('announcements')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchText) {
        query = query.or(`title.ilike.%${searchText}%,content.ilike.%${searchText}%`);
      }
      
      // Apply date range filter
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        query = query
          .gte('created_at', start.startOf('day').toISOString())
          .lte('created_at', end.endOf('day').toISOString());
      }
      
      // Apply pagination
      const from = (current - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
      setPagination({
        ...pagination,
        current,
        pageSize,
        total: count || 0,
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination, filters, sorter) => {
    fetchAnnouncements(pagination.current, pagination.pageSize);
  };

  // Handle search
  const handleSearch = () => {
    fetchAnnouncements(1, pagination.pageSize);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setDateRange([]);
    fetchAnnouncements(1, pagination.pageSize);
  };

  // Show create/edit modal
  const showModal = (record = null) => {
    if (record) {
      form.setFieldsValue({
        ...record,
        created_at: record.created_at ? dayjs(record.created_at) : dayjs()
      });
      setEditingAnnouncement(record);
    } else {
      form.resetFields();
      form.setFieldsValue({
        created_at: dayjs()
      });
      setEditingAnnouncement(null);
    }
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const announcementData = {
        title: values.title,
        content: values.content,
        created_at: values.created_at.toISOString()
      };
      
      if (editingAnnouncement) {
        // Update existing announcement
        const { data, error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setAnnouncements(announcements.map(ann => 
          ann.id === data.id ? data : ann
        ));
        message.success('Announcement updated successfully');
      } else {
        // Create new announcement
        const { data, error } = await supabase
          .from('announcements')
          .insert([announcementData])
          .select()
          .single();
          
        if (error) throw error;
        
        setAnnouncements([data, ...announcements]);
        message.success('Announcement created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving announcement:', error);
      message.error(`Failed to save announcement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setAnnouncements(announcements.filter(ann => ann.id !== id));
      message.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      message.error('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  // Columns configuration for the table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <div style={{ maxWidth: 400 }}>
          <Text ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this announcement?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Initial data fetch
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="p-6">
      <Card 
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="mb-0">Announcements</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
            >
              New Announcement
            </Button>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        {/* Search and Filters */}
        <div className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Search by title or content"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={10} lg={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  onClick={handleSearch}
                  loading={loading}
                >
                  Search
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetFilters}
                  disabled={!searchText && !dateRange.length}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Announcements Table */}
        <Table
          columns={columns}
          dataSource={announcements}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} announcements`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      {/* Create/Edit Announcement Modal */}
      <Modal
        title={editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={700}
        okText={editingAnnouncement ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            created_at: dayjs()
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { max: 200, message: 'Title cannot exceed 200 characters' }
            ]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
            rules={[
              { required: true, message: 'Please enter the announcement content' },
              { max: 2000, message: 'Content cannot exceed 2000 characters' }
            ]}
          >
            <TextArea 
              rows={6} 
              placeholder="Enter the announcement content here..." 
              showCount 
              maxLength={2000}
            />
          </Form.Item>
          
          <Form.Item
            name="created_at"
            label="Publish Date & Time"
            rules={[{ required: true, message: 'Please select the publish date and time' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcements;
