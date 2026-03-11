import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';

// Core Components
import AdminOverview from '../components/admin/AdminOverview';
import StudentManagement from '../components/admin/StudentManagement';     
import AddStudent from '../components/admin/AddStudent';
import AddUsers from '../components/admin/AddUsers';
import UserCreatedSuccess from '../components/admin/UserCreatedSuccess';   
import StudentCredentials from '../components/admin/StudentCredentials';   
import FeesList from '../components/admin/FeesListWithErrorBoundary';      
import FeeDetail from '../components/admin/FeeDetail';
import PaymentForm from '../components/admin/PaymentForm';
import FeeManagement from '../components/admin/FeeManagement';
import NewFeeForm from '../components/admin/NewFeeForm';
import NotificationManagement from '../pages/admin/notifications/NotificationManagement';
import NotificationRecipients from '../pages/admin/notifications/NotificationRecipients';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import MarksEntry from '../components/admin/MarksEntry';
import Admissions from '../components/admin/NewAdmissions';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';       
import AIAssistant from '../components/admin/AIAssistant';
import Settings from '../components/admin/Settings';
import TestComponent from '../components/admin/TestComponent';
import InternalMarks from '../pages/admin/InternalMarks';

// Faculty
import FacultyManagement from '../pages/admin/FacultyManagement';
import FacultyAttendance from '../pages/admin/FacultyAttendance';
import FacultyCredentials from '../pages/admin/FacultyCredentials';        
import FacultyMapping from '../pages/admin/FacultyMapping';
import RelievingRequestManagement from '../pages/admin/hr/RelievingRequestManagement';
import DocumentManager from '../pages/admin/hr/DocumentManager';
import ClearanceManagement from '../pages/admin/clearance/Index';
// Infrastructure & Facilities
import FacilitiesManagement from '../pages/admin/FacilitiesManagement';    
import InfrastructureFacilities from '../pages/admin/infrastructure/InfrastructureFacilities';
import CampusMap from '../pages/admin/infrastructure/CampusMap';
import ClassroomAllocation from '../pages/admin/infrastructure/ClassroomAllocation';
import SmartClassroomTracking from '../pages/admin/infrastructure/SmartClassroomTracking';
import LabEquipmentManagement from '../pages/admin/infrastructure/LabEquipmentManagement';
import AuditoriumBooking from '../pages/admin/infrastructure/AuditoriumBooking';

// Academic
import AcademicSupport from '../pages/admin/academic/AcademicSupport';     
import LibraryManagement from '../pages/admin/academic/LibraryManagement'; 
import LaboratoryScheduling from '../pages/admin/academic/LaboratoryScheduling';
import LibraryScheduling from '../pages/admin/academic/LibraryScheduling'; 
import ITCResearch from '../pages/admin/academic/ITCResearch';
import StudentSupport from '../pages/admin/academic/StudentSupport';       
import ResearchInnovation from '../pages/admin/academic/ResearchInnovation';
import LibraryCatalog from '../pages/admin/academic/library/LibraryCatalog';
import LibraryLoans from '../pages/admin/academic/library/LibraryLoans';   
import LibraryFines from '../pages/admin/academic/library/LibraryFines';   
import LibraryMembers from '../pages/admin/academic/library/LibraryMembers';
import LibraryReservations from '../pages/admin/academic/library/LibraryReservations';

// Health & Safety
import HealthSafety from '../pages/admin/health/HealthSafety';
import HealthCenter from '../pages/admin/health/HealthCenter';
import Security from '../pages/admin/health/Security';
import LostFound from '../pages/admin/health/LostFound';
import SecurityDashboard from '../pages/admin/security/SecurityDashboard'; 

// Sports & Recreation
import SportsManagement from '../pages/admin/sports/SportsManagement';     
import EquipmentBooking from '../pages/admin/sports/EquipmentBooking';
import GroundReservation from '../pages/admin/sports/GroundReservation';   
import FitnessLog from '../pages/admin/sports/FitnessLog';
import EventTracker from '../pages/admin/sports/EventTracker';

// IT & Digital Services
import ITDigitalServices from '../pages/admin/it/ITDigitalServices';       
import WifiAccess from '../pages/admin/it/WifiAccess';
import DeviceManagement from '../pages/admin/it/DeviceManagement';
import ComputerLabs from '../pages/admin/it/ComputerLabs';
import SoftwareLicenses from '../pages/admin/it/SoftwareLicenses';

// Academic Management
import Departments from '../components/academics/Departments';
import CourseManagement from '../components/admin/CourseManagement';
import Subjects from '../components/academics/Subjects';
import Exams from '../components/academics/Exams';
import StudentResults from '../components/academics/StudentResults';       
import MarksStagingResults from '../components/academics/MarksStagingResults';
import ExamAnalytics from '../pages/admin/academics/ExamAnalytics';        

// Hostel
import StatusManagement from '../components/admin/StatusManagement';       
import VotesManagement from '../components/admin/hostel/VotesManagement';  

// Clubs
import ClubsDashboard from '../components/admin/clubs/ClubsDashboard';     
import ClubMembers from '../components/admin/clubs/ClubMembers';
import ClubEvents from '../components/admin/clubs/ClubEvents';
import ClubGallery from '../components/admin/clubs/ClubGallery';
import ClubAwards from '../components/admin/clubs/ClubAwards';
import ClubForm from '../components/admin/clubs/ClubForm';
import ResumeUpload from '../components/student/ResumeUpload';
import RealReportsAnalytics from '../pages/admin/analytics/RealReportsAnalytics';
import AnalyticsDashboard from '../pages/admin/analytics/AnalyticsDashboard';
import AdmissionAnalytics from '../pages/admin/analytics/AdmissionAnalytics';
import PerformanceAnalytics from '../pages/admin/analytics/PerformanceAnalytics';
import FeeAnalytics from '../pages/admin/analytics/FeeAnalytics';
import EnrollmentAnalytics from '../pages/admin/analytics/EnrollmentAnalytics';
import UtilizationAnalytics from '../pages/admin/analytics/UtilizationAnalytics';
import FacultySchedule from '../pages/admin/FacultySchedule';
import ResearchPapers from '../pages/admin/ResearchPapers';
import HostelManagement from '../pages/admin/hostel/index.jsx';
import FoodMenu from '../pages/admin/hostel/FoodMenu';
import HostelRules from '../pages/admin/hostel/HostelRules';
import Allocations from '../pages/admin/hostel/Allocations';
import Announcements from '../pages/admin/hostel/Announcements';
import Feedbacks from '../pages/admin/hostel/Feedbacks';
import LeaveManagement from '../pages/admin/hostel/LeaveManagement';       
import MenuItemsManagement from '../components/hostel/MenuItemsManagement';
import PollsManagement from '../components/admin/PollsManagement';
import SignupCredentials from '../pages/admin/students/SignupCredentials';

// Finance
import FinanceDashboard from '../components/finance/FinanceDashboard';
import StudentFees from '../components/finance/StudentFees';
import StaffPayroll from '../components/finance/StaffPayroll';
import Expenses from '../components/finance/Expenses';
import Vendors from '../components/finance/Vendors';
import BudgetAllocation from '../components/finance/BudgetAllocation';
import Maintenance from '../components/finance/Maintenance';
import FinanceAIAssistant from '../components/finance/AIAssistant';

// HR Management



// Payroll Management
import PayrollDashboard from '../pages/hr/PayrollDashboard';
import PayrollList from '../pages/hr/PayrollList';
import PayrollCalculation from '../pages/hr/PayrollCalculation';
import HRApprovalWorkflow from '../pages/hr/HRApprovalWorkflow';
import PayslipGeneration from '../pages/hr/PayslipGeneration';
import NotificationCenter from '../pages/hr/NotificationCenter';

// Quality Management
import QualityDashboard from '../pages/quality/Dashboard';
import QualityFaculty from '../pages/quality/Faculty';
import QualityAnalytics from '../pages/quality/Analytics';
import QualityAudits from '../pages/quality/Audits';
import QualityGrievances from '../pages/quality/Grievances';
import QualityPolicies from '../pages/quality/Policies';
import QualityAccreditation from '../pages/quality/Accreditation';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminDashboard />}>
        <Route index element={<Navigate to="dashboard" replace />} />      
        <Route path="dashboard" element={<AdminOverview />} />
        
        {/* Student Management */}
+        <Route path="students">
+          <Route index element={<StudentManagement />} />
+          <Route path="add" element={<AddStudent />} />
+          <Route path="addusers" element={<AddUsers />} />
+          <Route path="success" element={<UserCreatedSuccess />} />        
+          <Route path=":id/edit" element={<AddStudent />} />
+          <Route path="credentials" element={<StudentCredentials />} />    
+          <Route path="signup-credentials" element={<SignupCredentials />} />
+        </Route>
+        
+        {/* Fees Management */}
+        <Route path="fees">
+          <Route index element={<FeesList />} />
+          <Route path=":id" element={<FeeDetail />} />
+          <Route path="new" element={<NewFeeForm />} />
+          <Route path="management" element={<FeeManagement />} />
+          <Route path="payments/new" element={<PaymentForm />} />
+          <Route path=":id/pay" element={<PaymentForm />} />
+        </Route>
+        
+        {/* Notifications */}
+        <Route path="notifications">
+          <Route index element={<NotificationManagement />} />
+          <Route path="recipients" element={<NotificationRecipients />} /> 
+        </Route>
+        
+        {/* Faculty Management */}
+        <Route path="faculty">
+          <Route index element={<FacultyManagement />} />
+          <Route path="all" element={<FacultyManagement />} />
+          <Route path="attendance" element={<FacultyAttendance />} />      
+          <Route path="credentials" element={<FacultyCredentials />} />    
+          <Route path="mapping" element={<FacultyMapping />} />
+          <Route path="research-papers" element={<ResearchPapers />} />    
+        </Route>
+        
+        {/* HR Management */}
+        <Route path="hr/relieving-requests" element={<RelievingRequestManagement />} />
+        <Route path="hr/document-manager" element={<DocumentManager />} /> 
+        <Route path="hr/clearance" element={<ClearanceManagement />} />    
+        
+        {/* Test Route */}
+        <Route 
         path="test-attendance" 
         element={
+            <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
+              <h1 className="text-2xl font-bold mb-4">Test Route - This should appear</h1>
+              <p>If you can see this, routing is working!</p>
+              <button 
                onClick={() => alert('Test button clicked!')}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Button
              </button>
            </div>
          } />
+        
+        {/* Attendance Management */}
+        <Route path="attendance" element={<AttendanceManagement />} />     
+        
+        {/* Admissions */}
+        <Route path="admissions" element={<Admissions />} />
+        
+        {/* Hostel Management */}
+        <Route path="hostel" element={<HostelManagement />}>
+          <Route index element={<Navigate to="dashboard" replace />} />    
+          <Route path="dashboard" element={<HostelManagement />} />        
+          <Route path="announcements" element={<Announcements />} />       
+          <Route path="food-menu" element={<FoodMenu />} />
+          <Route path="menu-items" element={<MenuItemsManagement />} />    
+          <Route path="rules" element={<HostelRules />} />
+          <Route path="allocations" element={<Allocations />} />
+          <Route path="polls" element={<PollsManagement />} />
+          <Route path="feedbacks" element={<Feedbacks />} />
+          <Route path="leave-management" element={<LeaveManagement />} />  
+        </Route>
+        
+        {/* Infrastructure */}
+        <Route path="infrastructure">
+          <Route index element={<InfrastructureFacilities />} />
+          <Route path="campus-map" element={<CampusMap />} />
+          <Route path="classroom-allocation" element={<ClassroomAllocation />} />
+          <Route path="smart-classroom" element={<SmartClassroomTracking />} />
+          <Route path="lab-equipment" element={<LabEquipmentManagement />} />
+          <Route path="auditorium" element={<AuditoriumBooking />} />      
+        </Route>
+        
+        {/* Academic Support */}
+        <Route path="academic">
+          <Route index element={<AcademicSupport />} />
+
+          {/* Library Routes */}
+          <Route path="library" element={<LibraryManagement />}>
+            <Route index element={<Navigate to="catalog" replace />} />    
+            <Route path="catalog" element={<LibraryCatalog />} />
+            <Route path="loans" element={<LibraryLoans />} />
+            <Route path="fines" element={<LibraryFines />} />
+            <Route path="members" element={<LibraryMembers />} />
+            <Route path="reservations" element={<LibraryReservations />} />
+            <Route path="scheduling" element={<LibraryScheduling />} />
+          </Route>
+
+          {/* Other Academic Routes */}
+          <Route path="laboratories" element={<LaboratoryScheduling />} /> 
+          <Route path="itc-research" element={<ITCResearch />} />
+          <Route path="student-support" element={<StudentSupport />} />    
+          <Route path="research" element={<ResearchInnovation />} />
+        </Route>
+        
+        {/* Health & Safety */}
+        <Route path="health">
+          <Route index element={<HealthSafety />} />
+          <Route path="health-center" element={<HealthCenter />} />        
+          <Route path="lost-found" element={<LostFound />} />
+        </Route>
+        
+        {/* Faculty Schedule */}
+        <Route path="faculty-schedule" element={<FacultySchedule />} />
+        
+        {/* Security */}
+        <Route path="security">
+          <Route index element={<SecurityDashboard />} />
+          <Route path="incidents" element={<Security />} />
+        </Route>
+        
+        {/* Facilities Management */}
+        <Route path="facilities" element={<FacilitiesManagement />} />     
+        
       {/* Hostel */}
+        <Route path="hostel">
+          <Route index element={<HostelManagement />} />
+          <Route path="announcements" element={<Announcements />} />       
+          <Route path="food-menu" element={<FoodMenu />} />
+          <Route path="rules" element={<HostelRules />} />
+          <Route path="status" element={<StatusManagement />} />
+          <Route path="votes" element={<VotesManagement />} />
+        </Route>
+        
+        {/* Main Analytics Dashboard */}
+        <Route path="analytics" element={<AnalyticsDashboard />}>
+          <Route index element={<Navigate to="overview" replace />} />     
+          <Route path="overview" element={<RealReportsAnalytics />} />     
+          <Route path="admissions" element={<AdmissionAnalytics />} />     
+          <Route path="performance" element={<PerformanceAnalytics />} />  
+          <Route path="fees" element={<FeeAnalytics />} />
+          <Route path="enrollment" element={<EnrollmentAnalytics />} />    
+          <Route path="utilization" element={<UtilizationAnalytics />} />  
+        </Route>
+        
        {/* Redirect all old report paths to the new analytics dashboard */}
        <Route path="reports" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="reports/*" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="real-reports" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="real-reports/*" element={<Navigate to="/admin/analytics/admission" replace />} />
        
        {/* AI Assistant */}
        <Route path="ai-assistant" element={<AIAssistant />} />

        {/* Finance Management */}
        <Route path="finance">
          <Route index element={<FinanceDashboard />} />
          <Route path="dashboard" element={<FinanceDashboard />} />
          <Route path="student-fees" element={<StudentFees />} />
          <Route path="staff-payroll" element={<StaffPayroll />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="budget" element={<BudgetAllocation />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="ai-assistant" element={<FinanceAIAssistant />} />
        </Route>

       

        {/* Payroll Management */}
        <Route path="payroll">
          <Route index element={<PayrollDashboard />} />
          <Route path="dashboard" element={<PayrollDashboard />} />
          <Route path="list" element={<PayrollList />} />
          <Route path="calculation" element={<PayrollCalculation />} />
          <Route path="approval" element={<HRApprovalWorkflow />} />
          <Route path="payslip" element={<PayslipGeneration />} />
          <Route path="notifications" element={<NotificationCenter />} />
        </Route>

        {/* Quality Management */}
        <Route path="quality">
          <Route index element={<QualityDashboard />} />
          <Route path="dashboard" element={<QualityDashboard />} />
          <Route path="faculty" element={<QualityFaculty />} />
          <Route path="analytics" element={<QualityAnalytics />} />
          <Route path="audits" element={<QualityAudits />} />
          <Route path="grievances" element={<QualityGrievances />} />
          <Route path="policies" element={<QualityPolicies />} />
          <Route path="accreditation" element={<QualityAccreditation />} />
        </Route>
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
        
        {/* Sports & Recreation */}
        <Route path="sports">
          <Route index element={<SportsManagement />} />
          <Route path="equipment" element={<EquipmentBooking />} />        
          <Route path="grounds" element={<GroundReservation />} />
          <Route path="fitness" element={<FitnessLog />} />
          <Route path="events" element={<EventTracker />} />
        </Route>
        
        {/* IT & Digital Services */}
        <Route path="it">
          <Route index element={<ITDigitalServices />} />
          <Route path="wifi" element={<WifiAccess />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="labs" element={<ComputerLabs />} />
          <Route path="software" element={<SoftwareLicenses />} />
        </Route>
        
        {/* Academics */}
        <Route path="academics">
          <Route index element={<Navigate to="departments" replace />} />  
          <Route path="departments" element={<Departments />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam-analytics" element={<ExamAnalytics />} />      
          <Route path="results">
            <Route index element={<StudentResults />} />
            <Route path="staging" element={<MarksStagingResults />} />
          </Route>
          <Route path="marks" element={<MarksEntry />} />
        </Route>
        
        {/* Clubs & Activities */}
        <Route path="clubs">
          <Route index element={<ClubsDashboard />} />
          <Route path="new" element={<ClubForm />} />
          <Route path=":clubId/members" element={<ClubMembers />} />       
          <Route path=":clubId/events" element={<ClubEvents />} />
          <Route path=":clubId/gallery" element={<ClubGallery />} />       
          <Route path=":clubId/awards" element={<ClubAwards />} />
          <Route path=":clubId/edit" element={<ClubForm />} />
        </Route>
        
        {/* Internal Marks */}
        <Route path="internal-marks" element={<InternalMarks />} />        
        
        {/* Test Component */}
        <Route path="test" element={<TestComponent />} />
        
        {/* Resume Analyzer */}
        <Route path="resume-analyzer" element={<ResumeUpload />} />        
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;