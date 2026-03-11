
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import FacultyModal from '@/components/common/FacultyModal';
import { useStore } from '@/store/useStore';

function FacultyManagement() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const baseFaculty = useStore(s => s.faculty);
  const demoFaculty = useMemo(() => [
    { id: '3', name: 'Dr. Alice Smith', email: 'alice.smith@university.edu', department: 'Physics', position: 'Professor', phone: '+1 (555) 345-6789', hireDate: '2018-09-10', status: 'active', role: 'faculty' },
    { id: '4', name: 'Dr. Bob Lee', email: 'bob.lee@university.edu', department: 'Chemistry', position: 'Assistant Professor', phone: '+1 (555) 456-7890', hireDate: '2021-03-15', status: 'active', role: 'faculty' },
    { id: '5', name: 'Dr. Carol White', email: 'carol.white@university.edu', department: 'Biology', position: 'Lecturer', phone: '+1 (555) 567-8901', hireDate: '2017-06-20', status: 'inactive', role: 'faculty' },
    { id: '6', name: 'Dr. David Kim', email: 'david.kim@university.edu', department: 'Mathematics', position: 'Professor', phone: '+1 (555) 678-9012', hireDate: '2016-11-05', status: 'active', role: 'faculty' },
    { id: '7', name: 'Dr. Emma Brown', email: 'emma.brown@university.edu', department: 'Computer Science', position: 'Associate Professor', phone: '+1 (555) 789-0123', hireDate: '2019-02-28', status: 'active', role: 'faculty' },
    { id: '8', name: 'Dr. Frank Green', email: 'frank.green@university.edu', department: 'Physics', position: 'Lecturer', phone: '+1 (555) 890-1234', hireDate: '2020-07-12', status: 'pending', role: 'faculty' },
    { id: '9', name: 'Dr. Grace Hall', email: 'grace.hall@university.edu', department: 'Chemistry', position: 'Professor', phone: '+1 (555) 901-2345', hireDate: '2015-04-18', status: 'active', role: 'faculty' },
    { id: '10', name: 'Dr. Henry Young', email: 'henry.young@university.edu', department: 'Biology', position: 'Assistant Professor', phone: '+1 (555) 012-3456', hireDate: '2022-01-10', status: 'active', role: 'faculty' },
    { id: '11', name: 'Dr. Ivy King', email: 'ivy.king@university.edu', department: 'Mathematics', position: 'Lecturer', phone: '+1 (555) 123-4567', hireDate: '2018-08-22', status: 'inactive', role: 'faculty' },
    { id: '12', name: 'Dr. Jack Scott', email: 'jack.scott@university.edu', department: 'Computer Science', position: 'Professor', phone: '+1 (555) 234-5678', hireDate: '2014-05-30', status: 'active', role: 'faculty' },
    { id: '13', name: 'Dr. Karen Adams', email: 'karen.adams@university.edu', department: 'Physics', position: 'Associate Professor', phone: '+1 (555) 345-6789', hireDate: '2017-10-14', status: 'active', role: 'faculty' },
    { id: '14', name: 'Dr. Liam Turner', email: 'liam.turner@university.edu', department: 'Chemistry', position: 'Lecturer', phone: '+1 (555) 456-7890', hireDate: '2016-03-19', status: 'pending', role: 'faculty' },
    { id: '15', name: 'Dr. Mia Evans', email: 'mia.evans@university.edu', department: 'Biology', position: 'Professor', phone: '+1 (555) 567-8901', hireDate: '2013-12-25', status: 'active', role: 'faculty' },
    { id: '16', name: 'Dr. Noah Clark', email: 'noah.clark@university.edu', department: 'Mathematics', position: 'Assistant Professor', phone: '+1 (555) 678-9012', hireDate: '2021-09-03', status: 'active', role: 'faculty' },
    { id: '17', name: 'Dr. Olivia Lewis', email: 'olivia.lewis@university.edu', department: 'Computer Science', position: 'Lecturer', phone: '+1 (555) 789-0123', hireDate: '2015-06-17', status: 'inactive', role: 'faculty' },
    { id: '18', name: 'Dr. Paul Walker', email: 'paul.walker@university.edu', department: 'Physics', position: 'Professor', phone: '+1 (555) 890-1234', hireDate: '2012-03-08', status: 'active', role: 'faculty' },
    { id: '19', name: 'Dr. Quinn Baker', email: 'quinn.baker@university.edu', department: 'Chemistry', position: 'Associate Professor', phone: '+1 (555) 901-2345', hireDate: '2018-11-29', status: 'active', role: 'faculty' },
    { id: '20', name: 'Dr. Ruby Carter', email: 'ruby.carter@university.edu', department: 'Biology', position: 'Lecturer', phone: '+1 (555) 012-3456', hireDate: '2017-04-02', status: 'pending', role: 'faculty' },
    { id: '21', name: 'Dr. Sam Mitchell', email: 'sam.mitchell@university.edu', department: 'Mathematics', position: 'Professor', phone: '+1 (555) 123-4567', hireDate: '2010-08-15', status: 'active', role: 'faculty' },
    { id: '22', name: 'Dr. Tina Foster', email: 'tina.foster@university.edu', department: 'Computer Science', position: 'Assistant Professor', phone: '+1 (555) 234-5678', hireDate: '2019-05-21', status: 'active', role: 'faculty' }
  ], []);
  const faculty = useMemo(() => [...baseFaculty, ...demoFaculty], [baseFaculty, demoFaculty]);
  const departments = useMemo(() => Array.from(new Set(faculty.map(f => f.department))).filter(Boolean), [faculty]);
  const filtered = useMemo(() => {
    let data = faculty;
    if (departmentFilter) data = data.filter(f => f.department === departmentFilter);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(f =>
        f.name.toLowerCase().includes(s) ||
        f.email.toLowerCase().includes(s) ||
        f.department.toLowerCase().includes(s)
      );
    }
    return data;
  }, [faculty, search, departmentFilter]);

  // Export directory as CSV
  const handleExportDirectory = () => {
    const csvRows = [
      'Name,Email,Department,Position,Phone,Hire Date,Status,Role',
      ...faculty.map(f => `${f.name},${f.email},${f.department},${f.position},${f.phone},${f.hireDate},${f.status},${f.role}`)
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty-directory.csv';
    a.click();
  };

  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementStatus, setAnnouncementStatus] = useState('');

  // Simulate sending announcement
  const handleSendAnnouncement = () => {
    setAnnouncementOpen(true);
    setAnnouncementStatus('');
  };

  const handleAnnouncementSubmit = () => {
    if (!announcementText.trim()) {
      setAnnouncementStatus('Please enter an announcement message.');
      return;
    }
    // Simulate sending to all faculty
    setAnnouncementStatus('Announcement sent to all faculty!');
    console.log('Announcement sent to all faculty!');
    setTimeout(() => {
      setAnnouncementOpen(false);
      setAnnouncementText('');
      setAnnouncementStatus('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <header className="py-8 text-center bg-gradient-hero border-b">
        <h1 className="text-4xl font-bold mb-2 text-white">Faculty Management</h1>
        <p className="text-lg opacity-90 mb-4 text-white">Add, view, and manage all faculty members</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-700" onClick={handleSendAnnouncement}>
            Send Announcement
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" onClick={handleExportDirectory} aria-label="Export Directory">
            Export Directory
          </Button>
        </div>
        {/* Announcement Modal */}
        {announcementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Send Announcement</h2>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={4}
                placeholder="Type your announcement here..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
              />
              {announcementStatus && (
                <div className="mb-2 text-green-600 animate-fade-in">{announcementStatus}</div>
              )}
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setAnnouncementOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-blue-600 text-white" onClick={handleAnnouncementSubmit}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
  {/* Toast Popup handled by toast utility */}
      </header>
      <div className="container mx-auto py-8 flex flex-col gap-8">
        {/* Main Content */}
        <main className="w-full">
          {/* AI Insights Card */}
          <section className="mb-8">
            <Card className="shadow-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-bold text-indigo-700">AI Insights</CardTitle>
                <CardDescription className="text-indigo-500">Automatically generated analytics and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-none text-indigo-700 text-sm flex flex-col items-center justify-center gap-2">
                  <li className="w-full text-center bg-indigo-50 rounded px-4 py-2">Most active department: <span className="font-semibold">Physics</span></li>
                  <li className="w-full text-center bg-indigo-50 rounded px-4 py-2">Faculty hiring trend: <span className="font-semibold">+5% this quarter</span></li>
                  <li className="w-full text-center bg-indigo-50 rounded px-4 py-2">Recommendation: <span className="font-semibold">Increase hiring in Chemistry</span></li>
                  <li className="w-full text-center bg-indigo-50 rounded px-4 py-2">Top faculty: <span className="font-semibold">Dr. Smith (CS), Dr. Lee (Physics)</span></li>
                </ul>
              </CardContent>
            </Card>
          </section>
          {/* Faculty Directory Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Faculty Directory</CardTitle>
              <CardDescription>Manage faculty records and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4 items-center">
                <Input placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
                <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="border rounded px-2 py-1">
                  <option value="">All Departments</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <Button onClick={() => setModalOpen(true)}>Add New Faculty</Button>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(faculty => (
                    <TableRow key={faculty.id}>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell>{faculty.department}</TableCell>
                      <TableCell>{faculty.position}</TableCell>
                      <TableCell>{faculty.email}</TableCell>
                      <TableCell>
                        <Badge variant={faculty.status === 'active' ? 'default' : 'outline'}>{faculty.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No faculty found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <FacultyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </main>
        {/* AI Assistant Card at the bottom */}
        <aside className="w-full bg-white/80 border shadow-lg p-6 rounded-xl mt-8">
          <div className="font-bold text-lg text-indigo-700 mb-2">AI Assistant</div>
          <div className="bg-gradient-to-br from-indigo-100 via-white to-blue-100 rounded-xl p-4 shadow">
            <div className="text-sm text-indigo-800 mb-2">How can I help you manage faculty?</div>
            <ul className="text-xs text-indigo-600 list-disc pl-4 mb-2">
              <li>Show top faculty by department</li>
              <li>Summarize faculty stats</li>
              <li>Predict next month's hiring needs</li>
              <li>Export directory</li>
            </ul>
            <input className="w-full border rounded px-2 py-1 mb-2" placeholder="Ask AI..." />
            <Button size="sm" className="w-full bg-indigo-600 text-white">Send</Button>
          </div>
          <div className="mt-6 text-xs text-indigo-400">AI answers are generated and may not be 100% accurate.</div>
        </aside>
      </div>
    </div>
  );
}

export default FacultyManagement;
