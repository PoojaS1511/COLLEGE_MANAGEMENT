import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Select, Row, Col, Statistic, DatePicker, message } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const FeeReports = () => {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department_id: null,
    academic_year: null,
    date_range: null
  });

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

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.department_id) {
        params.department_id = filters.department_id;
      }
      
      if (filters.academic_year) {
        params.academic_year = filters.academic_year;
      }
      
      if (filters.date_range && filters.date_range.length === 2) {
        params.start_date = filters.date_range[0].format('YYYY-MM-DD');
        params.end_date = filters.date_range[1].format('YYYY-MM-DD');
      }
      
      const response = await axios.get('/api/fee-reports', { params });
      
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch fee reports');
    } finally {
      setLoading(false);
    }
  };

  // Generate report in specified format
  const generateReport = async (format) => {
    try {
      const params = { format };
      
      if (filters.department_id) {
        params.department_id = filters.department_id;
      }
      
      if (filters.academic_year) {
        params.academic_year = filters.academic_year;
      }
      
      if (filters.date_range && filters.date_range.length === 2) {
        params.start_date = filters.date_range[0].format('YYYY-MM-DD');
        params.end_date = filters.date_range[1].format('YYYY-MM-DD');
      }
      
      // For PDF/Excel export, we'll use a different endpoint that returns a file
      window.open(`/api/fee-reports/export?${new URLSearchParams(params).toString()}`, '_blank');
      
    } catch (error) {
      message.error(`Failed to generate ${format.toUpperCase()} report`);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  // Calculate summary statistics
  const totalCollected = reports.reduce((sum, report) => sum + report.total_collected, 0);
  const totalStudents = reports.reduce((sum, report) => sum + report.student_count, 0);
  const pendingAmount = reports.reduce((sum, report) => sum + report.pending_amount, 0);

  // Columns for reports table
  const columns = [
    {
      title: 'Department',
      dataIndex: ['department', 'name'],
      key: 'department'
    },
    {
      title: 'Academic Year',
      dataIndex: 'academic_year',
      key: 'academic_year'
    },
    {
      title: 'Total Students',
      dataIndex: 'student_count',
      key: 'student_count'
    },
    {
      title: 'Total Collected (₹)',
      dataIndex: 'total_collected',
      key: 'total_collected',
      render: (amount) => amount?.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      })
    },
    {
      title: 'Pending Amount (₹)',
      dataIndex: 'pending_amount',
      key: 'pending_amount',
      render: (amount) => amount?.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      })
    }
  ];

  return (
    <div className="fee-reports">
      <Card
        title="Fee Reports"
        extra={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={() => generateReport('pdf')}
            >
              Export PDF
            </Button>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={() => generateReport('excel')}
            >
              Export Excel
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Department"
                allowClear
                onChange={(value) => handleFilterChange('department_id', value)}
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Academic Year"
                value={filters.academic_year}
                onChange={(value) => handleFilterChange('academic_year', value)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return `${year}-${year + 1}`;
                }).map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.date_range}
                onChange={(dates) => handleFilterChange('date_range', dates)}
              />
            </Col>
          </Row>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Collected"
                value={totalCollected}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Students"
                value={totalStudents}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={pendingAmount}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={reports}
          rowKey={record => `${record.department_id}-${record.academic_year}`}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default FeeReports;
