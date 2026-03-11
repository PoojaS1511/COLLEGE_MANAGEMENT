import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import NotificationService from '../../../services/notificationService';
import { supabase } from '../../../lib/supabase';

const { Title } = Typography;
const { Option } = Select;

const NotificationRecipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchRecipients = async () => {
    setLoading(true);
    const { data, error } = await NotificationService.getNotificationRecipients();
    if (data) {
      setRecipients(data);
    } else {
      message.error(error || 'Failed to fetch notification recipients');
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    const { data, error } = await NotificationService.getNotifications();
    if (data) {
      setNotifications(data);
    } else {
      message.error(error || 'Failed to fetch notifications');
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (data) {
      setUsers(data);
    } else {
      message.error(error?.message || 'Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchRecipients();
    fetchNotifications();
    fetchUsers();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setEditingRecipient(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      notification_id: record.notification_id,
      user_id: record.user_id,
      is_read: record.is_read
    });
    setEditingRecipient(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    const { success, error } = await NotificationService.deleteNotificationRecipient(id);
    if (success) {
      message.success('Recipient deleted successfully');
      fetchRecipients();
    } else {
      message.error(error || 'Failed to delete recipient');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const recipientData = {
        notification_id: values.notification_id,
        user_id: values.user_id,
        is_read: values.is_read || false
      };

      if (editingRecipient) {
        const { success, error } = await NotificationService.updateNotificationRecipient(
          editingRecipient.id,
          recipientData
        );
        if (success) {
          message.success('Recipient updated successfully');
        } else {
          message.error(error || 'Failed to update recipient');
        }
      } else {
        const { success, error } = await NotificationService.createNotificationRecipient(recipientData);
        if (success) {
          message.success('Recipient created successfully');
        } else {
          message.error(error || 'Failed to create recipient');
        }
      }

      setIsModalVisible(false);
      fetchRecipients();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Notification',
      dataIndex: ['notifications', 'title'],
      key: 'notification',
      render: (title, record) => (
        <div className="max-w-xs">
          <div className="font-medium">{title || 'No title'}</div>
          {record.notifications?.message && (
            <div className="text-xs text-gray-500 truncate">
              {record.notifications.message}
            </div>
          )}
          <div className="text-xs text-gray-400">
            {record.notifications?.created_at ? new Date(record.notifications.created_at).toLocaleString() : ''}
          </div>
        </div>
      )
    },
    {
      title: 'Recipient',
      dataIndex: ['profiles', 'name'],
      key: 'user',
      render: (name, record) => (
        <div>
          <div className="font-medium">{name || 'Unknown User'}</div>
          <div className="text-xs text-gray-500">{record.profiles?.email || ''}</div>
          {record.profiles?.role && (
            <Tag color="blue" className="text-xs mt-1">
              {record.profiles.role}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_read',
      key: 'status',
      render: (isRead) => (
        <Tag color={isRead ? 'green' : 'orange'}>
          {isRead ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Read At',
      dataIndex: 'read_at',
      key: 'read_at',
      render: (readAt) => readAt ? new Date(readAt).toLocaleString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this recipient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="mb-0">Notification Recipients</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Recipient
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={recipients}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ is_read: false }}
        >
          <Form.Item
            name="notification_id"
            label="Notification"
            rules={[{ required: true, message: 'Please select a notification' }]}
          >
            <Select
              showSearch
              placeholder="Select a notification"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {notifications.map(notification => (
                <Option key={notification.id} value={notification.id}>
                  {notification.title} - {new Date(notification.created_at).toLocaleDateString()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="user_id"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              showSearch
              placeholder="Select a user"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="is_read"
            label="Status"
            valuePropName="checked"
          >
            <Checkbox>Mark as read</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationRecipients;
