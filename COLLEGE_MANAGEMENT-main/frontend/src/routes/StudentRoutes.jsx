import { Routes, Route } from 'react-router-dom';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../components/student/StudentProfile';
import StudentAttendance from '../pages/student/StudentAttendance';
import StudentMarks from '../components/student/StudentMarks';
import StudentTimetable from '../components/student/StudentTimetable';
import FeeStructure from '../components/student/FeeStructure';
import MyFees from '../components/student/MyFees';
import StudentExaminations from '../components/student/StudentExaminations';
import StudentHostel from '../components/student/StudentHostel';
import StudentTransport from '../components/student/StudentTransport';
import StudentCalendar from '../components/student/StudentCalendar';
import StudentNotifications from '../components/student/StudentNotifications';
import StudentInternships from '../components/student/StudentInternships';
import StudentCareerInsights from '../components/student/StudentCareerInsights';
import StudentCareerAssistant from '../components/student/StudentCareerAssistant';
import StudentSettings from '../components/student/StudentSettings';
import StudentAnnouncements from '../components/student/StudentAnnouncements';
import HostelMenu from '../components/student/HostelMenu';
import Rules from '../components/student/Rules';
import Resume from '../pages/student/Resume';
import StudentAcademicOverview from '../components/student/StudentAcademicOverview';
import CareerPrepCourses from '../components/student/CareerPrepCourses';
import HostelFeedbacks from '../pages/student/HostelFeedbacks';
import LeaveRequest from '../pages/student/LeaveRequest';
import LeaveHistoryPage from '../pages/student/LeaveHistoryPage';
import RoomAllocation from '../pages/student/RoomAllocation';
import StudentResults from '../pages/student/Results';
import MessStatus from '../components/student/MessStatus';
import MenuItems from '../pages/student/MenuItems';
import Polls from '../pages/student/Polls';
import PollVote from '../pages/student/PollVote';

// Create a layout component for career-related routes
const CareerLayout = ({ children }) => (
  <div className="career-layout">
    {children}
  </div>
);

const StudentRoutes = () => {
  return (
    <Routes>
      <Route index element={<StudentProfile />} />
      <Route path="dashboard" element={<StudentProfile />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="academic" element={<StudentAcademicOverview />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="results" element={<StudentResults />} />
      <Route path="marks" element={<StudentMarks />} />
      <Route path="timetable" element={<StudentTimetable />} />
      <Route path="fee-structure" element={<FeeStructure />} />
      <Route path="my-fees" element={<MyFees />} />
      <Route path="fee-details" element={<FeeStructure />} />
      <Route path="examinations" element={<StudentExaminations />} />
      <Route path="votes" element={<Polls />} />
      <Route path="votes/:pollId" element={<PollVote />} />
      <Route path="hostel" element={<StudentHostel />} />
      <Route path="transport" element={<StudentTransport />} />
      <Route path="announcements" element={<StudentAnnouncements />} />
      <Route path="hostel-menu" element={<HostelMenu />} />
      <Route path="mess-status" element={<MessStatus />} />
      <Route path="hostel-feedbacks" element={<HostelFeedbacks />} />
      <Route path="leave-request" element={<LeaveRequest />} />
      <Route path="leave-history" element={<LeaveHistoryPage />} />
      <Route path="room-allocation" element={<RoomAllocation />} />
      <Route path="items" element={<MenuItems />} />
      <Route path="rules" element={<Rules />} />
      <Route path="calendar" element={<StudentCalendar />} />
      <Route path="notifications" element={<StudentNotifications />} />
      <Route path="settings" element={<StudentSettings />} />
      
      {/* Nested career routes */}
      <Route path="career">
        <Route index element={<StudentCareerInsights />} />
        <Route path="insights" element={<StudentCareerInsights />} />
        <Route path="resume" element={<Resume />} />
        <Route path="internships" element={<StudentInternships />} />
        <Route path="courses" element={<CareerPrepCourses />} />
        <Route path="assistant" element={<StudentCareerAssistant />} />
      </Route>
      
      {/* Keep backward compatibility for old routes */}
      <Route path="resume" element={<Resume />} />
      <Route path="internships" element={<StudentInternships />} />
      <Route path="career-assistant" element={<StudentCareerAssistant />} />
      <Route path="career-insights" element={<StudentCareerInsights />} />
    </Routes>
  );
};

export default StudentRoutes;