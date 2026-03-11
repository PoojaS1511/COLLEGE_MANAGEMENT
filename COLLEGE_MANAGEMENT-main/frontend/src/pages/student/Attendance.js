import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Progress, 
  Tag, 
  Row, 
  Col, 
  Typography, 
  Select, 
  DatePicker, 
  message, 
  Spin, 
  Empty 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useStudent } from '../../contexts/StudentContext';
import './Attendance.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Function to calculate statistics from attendance data
const calculateStats = (data) => {
  if (!data || data.length === 0) return null;

  const subjectStats = {};
  
  data.forEach(record => {
    if (!record.subjects) return;
    
    const subjectName = record.subjects.name;
    const subjectCode = record.subjects.code;
    
    if (!subjectStats[subjectName]) {
      subjectStats[subjectName] = {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        code: subjectCode || ''
      };
    }
    
    const stats = subjectStats[subjectName];
    stats.total++;
    
    if (record.status === 'present') {
      stats.present++;
    } else if (record.status === 'absent') {
      stats.absent++;
    } else if (record.status === 'late') {
      stats.late++;
    }
  });
  
  // Calculate percentages and find best/worst subjects
  let bestSubject = { name: 'N/A', percentage: 0 };
  let worstSubject = { name: 'N/A', percentage: 100 };
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalClasses = 0;
  
  Object.entries(subjectStats).forEach(([subject, stats]) => {
    const present = stats.present + (stats.late * 0.5); // Late counts as half present
    const total = stats.total;
    const percentage = Math.round((present / total) * 100);
    
    stats.percentage = percentage;
    totalPresent += present;
    totalAbsent += stats.absent;
    totalClasses += total;
    
    if (percentage > bestSubject.percentage) {
      bestSubject = { name: subject, percentage };
    }
    if (percentage < worstSubject.percentage) {
      worstSubject = { name: subject, percentage };
    }
  });
  
  const totalPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  
  return {
    present: Math.round(totalPresent),
    absent: totalAbsent,
    total: totalClasses,
    percentage: totalPercentage,
    bestSubject,
    worstSubject,
    subjectStats
  };
};

const Attendance = () => {
  const { student } = useStudent();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get the student ID from the context or local storage
      const studentId = student?.id || localStorage.getItem('studentId');
      if (!studentId) {
        throw new Error('Student ID not found');
      }

      // Build query parameters
      const params = { student_id: studentId };
      
      // Add date range filter if selected
      if (dateRange.length === 2) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      
      // Add subject filter if selected
      if (selectedSubject && selectedSubject !== 'all') {
        params.subject_id = selectedSubject;
      }

      // Make API call to get attendance data
      const response = await axios.get('/api/attendance', { params });
      
      if (response.data.success) {
        setAttendanceData(response.data.data);
        setStats(calculateStats(response.data.data));
        
        // Extract unique subjects for filter
        const uniqueSubjects = [...new Set(
          response.data.data
            .filter(record => record.subjects)
            .map(record => ({
              id: record.subjects.id,
              name: record.subjects.name,
              code: record.subjects.code
            }))
            .map(JSON.stringify)
        )].map(JSON.parse);
        
        setSubjects(uniqueSubjects);
      } else {
        message.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      message.error('Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange, selectedSubject]);

  // Handle date range change
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  // Handle subject filter change
  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date)
    },
    {
      title: 'Subject',
      dataIndex: ['subjects', 'name'],
      key: 'subject',
      render: (_, record) => (
        <div>
          <div>{record.subjects?.name || 'N/A'}</div>
          <div className="text-muted">{record.subjects?.code || ''}</div>
        </div>
      )
    },
    {
      title: 'Faculty',
      dataIndex: ['faculty', 'full_name'],
      key: 'faculty',
      render: (_, record) => record.faculty?.full_name || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        switch(status) {
          case 'present':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'absent':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'late':
            color = 'warning';
            icon = <ClockCircleOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
          </Tag>
        );
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks) => remarks || '-'
    }
  ];

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p>Loading attendance data...</p>
      </div>
    );
  }
  
  return (
    <div className="attendance-container">
      <Title level={2} className="mb-4">My Attendance</Title>
      
      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <div className="filter-item">
              <Text strong className="d-block mb-2">Date Range</Text>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={handleDateChange} 
                disabledDate={current => current && current > new Date()}
              />
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="filter-item">
              <Text strong className="d-block mb-2">Subject</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Subject"
                value={selectedSubject}
                onChange={handleSubjectChange}
                allowClear
                loading={loading}
              >
                <Option value="all">All Subjects</Option>
                {subjects.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={8}>
            <Card className="stat-card">
              <div className="stat-title">Overall Attendance</div>
              <div className="stat-value">{stats.percentage}%</div>
              <Progress 
                percent={stats.percentage} 
                status={stats.percentage >= 75 ? 'success' : stats.percentage >= 50 ? 'normal' : 'exception'} 
                showInfo={false}
                className="mt-2"
              />
              <div className="stat-detail">
                <span>{stats.present} Present</span>
                <span>{stats.absent} Absent</span>
                <span>{stats.total} Total Classes</span>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="stat-card best-subject">
              <div className="stat-title">Best Subject</div>
              <div className="stat-value">
                {stats.bestSubject.name}
                <span className="stat-percentage">
                  <ArrowUpOutlined /> {stats.bestSubject.percentage}%
                </span>
              </div>
              <div className="stat-subtext">
                {stats.subjectStats[stats.bestSubject.name]?.code || ''}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="stat-card worst-subject">
              <div className="stat-title">Needs Improvement</div>
              <div className="stat-value">
                {stats.worstSubject.name}
                <span className="stat-percentage">
                  <ArrowDownOutlined /> {stats.worstSubject.percentage}%
                </span>
              </div>
              <div className="stat-subtext">
                {stats.subjectStats[stats.worstSubject.name]?.code || ''}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Subject-wise Progress */}
      {stats && Object.keys(stats.subjectStats).length > 0 && (
        <Card title="Subject-wise Attendance" className="mb-4">
          <Row gutter={[16, 16]}>
            {Object.entries(stats.subjectStats).map(([subject, data]) => (
              <Col xs={24} md={12} lg={8} key={subject}>
                <div className="subject-progress">
                  <div className="subject-header">
                    <Text strong>{subject}</Text>
                    <Text type="secondary">{data.code}</Text>
                  </div>
                  <div className="progress-container">
                    <Progress 
                      percent={data.percentage} 
                      status={data.percentage >= 75 ? 'success' : data.percentage >= 50 ? 'normal' : 'exception'} 
                      showInfo={false}
                    />
                    <div className="progress-stats">
                      <span>{data.present + data.late / 2} / {data.total} classes</span>
                      <span>{data.percentage}%</span>
                    </div>
                  </div>
                  <div className="attendance-details">
                    <span><CheckCircleOutlined className="text-success" /> {data.present} Present</span>
                    <span><ClockCircleOutlined className="text-warning" /> {data.late} Late</span>
                    <span><CloseCircleOutlined className="text-danger" /> {data.absent} Absent</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Attendance Table */}
      <Card title="Attendance Records">
        <Table
          columns={columns}
          dataSource={attendanceData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>No attendance records found</span>
                }
              />
            )
          }}
        />
      </Card>
    </div>
  );
};

export default Attendance;
        _isMock: true  // Flag to identify mock data
      });
    }
  }
  
  return mockData;
};

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Attendance = () => {
  const { student } = useStudent();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ]);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!student?.id) {
        console.log('No student ID available, using mock data');
        const mockData = generateMockAttendanceData();
        setAttendanceData(mockData);
        setLoading(false);
        return;
      }

      try {
        console.log('Starting to fetch attendance data...');
        setLoading(true);
        
        // Using the authenticated student's ID
        const studentId = student.id;
        console.log('Using student ID:', studentId);
        
        // Format dates to match the database format (YYYY-MM-DD)
        const formattedStartDate = new Date(dateRange[0]).toISOString().split('T')[0];
        const formattedEndDate = new Date(dateRange[1]).toISOString().split('T')[0];
        
        console.log('Fetching attendance for date range:', { formattedStartDate, formattedEndDate });
        
        // First, try with the exact student_id
        console.log('Fetching attendance data...');
        let { data, error } = await supabase
          .from('attendance')
          .select(`
            *,
            subject_assignments!inner(
              subject_id,
              subjects!inner(
                id,
                name,
                code,
                faculty:faculty_id (id, full_name)
              )
            )
          `)
          .eq('student_id', studentId)
          .order('date', { ascending: false });
          
        console.log('Initial query results:', { data, error });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.log('No attendance records found, using mock data for student:', studentId);
          const mockData = generateMockAttendanceData(studentId);
          setAttendanceData(mockData);
          message.info('Showing sample attendance data');
          return;
        }
        
        // Transform the data to match our expected format
        const formattedData = data.map(item => ({
          id: item.id,
          subject: item.subject_assignments?.subjects?.name || 'Unknown Subject',
          subject_code: item.subject_assignments?.subjects?.code || '',
          subject_id: item.subject_assignments?.subject_id,
          date: item.date,
          status: (item.status || '').toLowerCase(),
          period: item.period_number || 'N/A',
          marked_by: item.marked_by || 'N/A',
          marked_time: item.marked_time || '00:00:00',
          student_id: item.student_id,
          faculty_name: item.subject_assignments?.subjects?.faculty?.full_name || 'N/A',
          course_id: item.course_id || ''
        }));
        
        console.log('Formatted attendance data:', formattedData);
        setAttendanceData(formattedData);
        
      } catch (error) {
        console.error('Error in fetchAttendance:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError('Failed to load attendance data');
        message.error(`Failed to load attendance data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [student?.id, dateRange]);

  // Calculate attendance statistics
  const calculateStats = () => {
    // Always use mock data if no data or if explicitly marked as mock
    if (!attendanceData || attendanceData.length === 0 || (attendanceData[0] && attendanceData[0]._isMock)) {
      const mockData = attendanceData.length > 0 ? attendanceData : generateMockAttendanceData(student?.id);
      return calculateMockStats(mockData);
    }

    const subjectStats = {};
    
    // Initialize subject stats
    attendanceData.forEach(record => {
      if (!record.subject) return; // Skip records without a subject
      
      if (!subjectStats[record.subject]) {
        subjectStats[record.subject] = { present: 0, total: 0 };
      }
      
      subjectStats[record.subject].total++;
      
      // Handle different case variations of status
      const status = (record.status || '').toUpperCase();
      if (status === 'PRESENT' || status === 'PRESENT') {
        subjectStats[record.subject].present++;
      }
    });

    // Calculate overall stats
    const present = Object.values(subjectStats).reduce(
      (sum, { present = 0 }) => sum + present, 0
    );
    const total = Object.values(subjectStats).reduce(
      (sum, { total = 0 }) => sum + total, 0
    );
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Find best and worst subjects
    let bestSubject = { name: 'N/A', percentage: 0 };
    let worstSubject = { name: 'N/A', percentage: 100 };
    
    Object.entries(subjectStats).forEach(([subject, { present = 0, total = 1 }]) => {
      const subjectPercentage = Math.round((present / total) * 100);
      
      if (subjectPercentage > bestSubject.percentage) {
        bestSubject = { 
          name: subject, 
          percentage: subjectPercentage,
          present,
          total
        };
      }
      if (subjectPercentage < worstSubject.percentage) {
        worstSubject = { 
          name: subject, 
          percentage: subjectPercentage,
          present,
          total
        };
      }
    });

    // If no subjects with attendance, reset worst subject
    if (bestSubject.name === 'N/A') {
      worstSubject = { name: 'N/A', percentage: 0 };
    }

    return {
      present,
      absent: total - present,
      total,
      percentage,
      bestSubject,
      worstSubject,
      subjectStats
    };
  };

  const stats = calculateStats();

  // Table columns for detailed view
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      }),
      width: 150,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      filters: [
        ...new Set(attendanceData.map(item => item.subject).filter(Boolean))
      ].map(subject => ({
        text: subject,
        value: subject,
      })),
      onFilter: (value, record) => record.subject === value,
      width: 200,
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      sorter: (a, b) => a.period - b.period,
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusText = status?.toUpperCase() || 'UNKNOWN';
        return (
          <Tag 
            color={
              statusText === 'PRESENT' ? 'green' : 
              statusText === 'ABSENT' ? 'red' : 'orange'
            }
            style={{ textTransform: 'capitalize' }}
          >
            {statusText.toLowerCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Present', value: 'PRESENT' },
        { text: 'Absent', value: 'ABSENT' },
        { text: 'Late', value: 'LATE' },
      ],
      onFilter: (value, record) => record.status?.toUpperCase() === value,
      width: 120,
    },
    {
      title: 'Marked By',
      dataIndex: 'marked_by',
      key: 'marked_by',
      width: 200,
    },
    {
      title: 'Time',
      dataIndex: 'marked_time',
      key: 'marked_time',
      render: (time) => time ? time.substring(0, 5) : 'N/A',
      width: 100,
    },
  ];

  // Group data by subject for overview
  const subjectAttendance = Object.entries(stats.subjectStats).map(([subject, data]) => ({
    subject,
    total: data.total,
    present: data.present,
    absent: data.total - data.present,
    percentage: Math.round((data.present / data.total) * 100)
  }));

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-header">
        <Title level={3} className="dashboard-title">Attendance</Title>
        
        <div className="dashboard-controls">
          <Select 
            value={selectedView} 
            onChange={setSelectedView}
            className="view-selector"
          >
            <Option value="overview">Overview</Option>
            <Option value="detailed">Detailed View</Option>
            <Option value="calendar">Calendar View</Option>
          </Select>
          
          <RangePicker 
            className="date-range-picker"
            onChange={(dates) => {
              if (dates) {
                setDateRange([
                  dates[0].format('YYYY-MM-DD'),
                  dates[1].format('YYYY-MM-DD')
                ]);
              } else {
                setDateRange([
                  new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
                  new Date().toISOString().split('T')[0]
                ]);
              }
            }}
            defaultValue={[
              new Date(dateRange[0]),
              new Date(dateRange[1])
            ]}
          />
          
          {selectedView === 'detailed' && (
            <Select 
              defaultValue="all" 
              className="subject-filter"
              onChange={setSelectedSubject}
              placeholder="Filter by subject"
            >
              <Option value="all">All Subjects</Option>
              {sortedSubjects.map(subject => (
                <Option key={subject} value={subject}>{subject}</Option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <div className="attendance-stats">
        <Card className="stat-card">
          <div className="stat-icon">
            <CalendarOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-label">Overall Attendance</div>
            <div className="stat-value">{stats.percentage || 0}%</div>
            <div className="stat-description">
              {stats.present || 0} of {stats.total || 0} classes
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Classes</div>
          <div className="stat-detail">
            {stats.present} Present, {stats.absent} Absent
          </div>
        </Card>
        
        <Card className="stat-card highlight">
          <div className="stat-value">
            <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            {stats.bestSubject.percentage}%
          </div>
          <div className="stat-label">Best Subject</div>
          <div className="stat-subject">{stats.bestSubject.name}</div>
          <div className="stat-detail">
            {stats.bestSubject.present} of {stats.bestSubject.total} classes
          </div>
        </Card>
        
        <Card className="stat-card highlight">
          <div className="stat-value">
            <ArrowDownOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            {stats.worstSubject.percentage}%
          </div>
          <div className="stat-label">Needs Attention</div>
          <div className="stat-subject">{stats.worstSubject.name}</div>
          <div className="stat-detail">
            {stats.worstSubject.present} of {stats.worstSubject.total} classes
          </div>
        </Card>
      </div>
      
      <div className="attendance-actions">
        <div className="view-toggle">
          <Button 
            type={selectedView === 'overview' ? 'primary' : 'default'}
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </Button>
          <Button 
            type={selectedView === 'detailed' ? 'primary' : 'default'}
            onClick={() => setSelectedView('detailed')}
          >
            Detailed
          </Button>
          <Button 
            type={selectedView === 'calendar' ? 'primary' : 'default'}
            onClick={() => setSelectedView('calendar')}
            disabled
          >
            Calendar (Coming Soon)
          </Button>
        </div>
        
        <div className="filters">
          <RangePicker 
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([
                  dates[0].format('YYYY-MM-DD'),
                  dates[1].format('YYYY-MM-DD')
                ]);
              }
            }}
            style={{ width: 250, marginRight: 16 }}
          />
          
          <Select
            value={selectedSubject}
            style={{ width: 200 }}
            onChange={setSelectedSubject}
            placeholder="Filter by subject"
            allowClear
            onClear={() => setSelectedSubject('all')}
          >
            <Option value="all">All Subjects</Option>
            {sortedSubjects.map(subject => (
              <Option key={subject} value={subject}>
                {subject}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      
      {selectedView === 'overview' && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Attendance by Subject</span>
              <span className="text-muted">
                Showing {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              </span>
            </div>
          } 
          className="subject-card"
        >
          {subjectAttendance.length > 0 ? (
            <Table 
              dataSource={subjectAttendance}
              columns={[
                { 
                  title: 'Subject', 
                  dataIndex: 'subject', 
                  key: 'subject',
                  render: (text) => <strong>{text}</strong>
                },
                { 
                  title: 'Attendance', 
                  key: 'progress',
                  render: (_, record) => (
                    <div style={{ minWidth: 250 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>{record.percentage}%</span>
                        <span className="text-muted">
                          {record.present} of {record.total} classes
                        </span>
                      </div>
                      <Progress 
                        percent={record.percentage} 
                        showInfo={false}
                        strokeColor={
                          record.percentage > 75 ? '#52c41a' : 
                          record.percentage > 50 ? '#faad14' : '#ff4d4f'
                        }
                      />
                    </div>
                  )
                },
                { 
                  title: 'Status', 
                  key: 'status',
                  width: 150,
                  render: (_, record) => (
                    <Tag 
                      color={
                        record.percentage >= 75 ? 'success' : 
                        record.percentage >= 50 ? 'warning' : 'error'
                      }
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      {record.percentage >= 75 ? 'Good' : 
                       record.percentage >= 50 ? 'Needs Improvement' : 'At Risk'}
                    </Tag>
                  )
                }
              ]}
              pagination={false}
              rowKey="subject"
              loading={loading}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InfoCircleOutlined style={{ fontSize: 24, color: '#999', marginBottom: 16 }} />
              <p>No attendance records found for the selected period.</p>
            </div>
          )}
        </Card>
      )}
      
      {selectedView === 'detailed' && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Attendance Records</span>
              <span className="text-muted">
                Showing {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              </span>
            </div>
          } 
          className="records-card"
        >
          {filteredData.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
              }}
              scroll={{ x: 'max-content' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InfoCircleOutlined style={{ fontSize: 24, color: '#999', marginBottom: 16 }} />
              <p>No attendance records found for the selected filters.</p>
            </div>
          )}
        </Card>
      )}
      
      {selectedView === 'calendar' && (
        <Card 
          title="Attendance Calendar" 
          className="calendar-card"
          extra={
            <div className="calendar-legend">
              <span className="legend-item">
                <span className="legend-color present"></span> Present
              </span>
              <span className="legend-item">
                <span className="legend-color absent"></span> Absent
              </span>
              <span className="legend-item">
                <span className="legend-color late"></span> Late
              </span>
            </div>
          }
        >
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CalendarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <h3>Calendar View Coming Soon</h3>
            <p style={{ color: '#666', maxWidth: 500, margin: '0 auto' }}>
              We're working on an interactive calendar view to help you visualize your attendance 
              patterns over time. Check back soon for this feature!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
