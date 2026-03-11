import React, { useState, lazy, Suspense, useMemo } from 'react';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon, 
  UsersIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Lazy load chart components
const BarChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
const LineChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const DoughnutChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Import mock data
import {
  admissionAnalytics,
  performanceReports,
  utilizationReports,
  placementReports,
  examReports,
  feeReports
} from '../../services/mockReportsData';

// Memoized chart components
const MemoizedBarChart = React.memo(({ options, data }) => (
  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
    <BarChart options={options} data={data} className="h-64" />
  </Suspense>
));

const MemoizedLineChart = React.memo(({ options, data }) => (
  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
    <LineChart options={options} data={data} className="h-64" />
  </Suspense>
));

const MemoizedDoughnutChart = React.memo(({ options, data }) => (
  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
    <DoughnutChart options={options} data={data} className="h-64" />
  </Suspense>
));

// Stat Card Component
const StatCard = React.memo(({ title, value, icon: Icon, change, changeType }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-indigo-50">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
    </div>
    {change && (
      <div className={`mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
        {changeType === 'increase' ? (
          <ArrowUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 mr-1" />
        )}
        {change}
      </div>
    )}
  </div>
));

// Tab Components
const AdmissionAnalytics = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Applications" value="12,543" icon={DocumentChartBarIcon} change="12% from last year" changeType="increase" />
      <StatCard title="Total Admissions" value="2,845" icon={UsersIcon} change="8% from last year" changeType="increase" />
      <StatCard title="Acceptance Rate" value="22.7%" icon={AcademicCapIcon} change="2.3% from last year" changeType="decrease" />
      <StatCard title="Avg. Application Score" value="87.5/100" icon={ChartBarIcon} change="1.2% from last year" changeType="increase" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Admissions</h3>
        <MemoizedBarChart 
          options={{
            responsive: true,
            indexAxis: 'y',
            elements: { bar: { borderRadius: 4 } },
            plugins: { legend: { display: false } },
          }} 
          data={admissionAnalytics.departmentWiseAdmission} 
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admission Sources</h3>
        <div className="h-64 flex items-center justify-center">
          <MemoizedDoughnutChart 
            options={{
              responsive: true,
              plugins: { legend: { position: 'right' } },
              maintainAspectRatio: false,
            }} 
            data={admissionAnalytics.admissionSources} 
          />
        </div>
      </div>
    </div>
  </div>
);

const PerformanceReports = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Average CGPA" value="8.42" icon={AcademicCapIcon} change="0.15 from last sem" changeType="increase" />
      <StatCard title="Pass Percentage" value="94.7%" icon={DocumentChartBarIcon} change="1.2% from last sem" changeType="increase" />
      <StatCard title="Top Department" value="Computer Science" icon={BuildingLibraryIcon} change="Average CGPA: 9.1" />
      <StatCard title="Students > 9.0 CGPA" value="342" icon={UsersIcon} change="28 from last sem" changeType="increase" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Performance</h3>
        <MemoizedBarChart 
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { min: 6, max: 10 } },
          }} 
          data={performanceReports.departmentPerformance} 
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Semester-wise Performance</h3>
        <MemoizedLineChart 
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { min: 6, max: 10 } },
          }} 
          data={performanceReports.semesterPerformance} 
        />
      </div>
    </div>
  </div>
);

const FacilityUtilization = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Lab Utilization" value="74.5%" icon={BuildingLibraryIcon} change="3.2% from last month" changeType="increase" />
      <StatCard title="Library Visitors" value="324/day" icon={UsersIcon} change="12% from last month" changeType="increase" />
      <StatCard title="Hostel Occupancy" value="92.3%" icon={BuildingLibraryIcon} change="1.5% from last month" changeType="decrease" />
      <StatCard title="Classroom Usage" value="68.7%" icon={AcademicCapIcon} change="2.1% from last month" changeType="increase" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Utilization by Department</h3>
        <MemoizedBarChart 
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } },
          }} 
          data={utilizationReports.labUtilization} 
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hostel Occupancy</h3>
        <div className="h-64 flex items-center justify-center">
          <MemoizedDoughnutChart 
            options={{
              responsive: true,
              plugins: { legend: { position: 'right' } },
              maintainAspectRatio: false,
            }} 
            data={utilizationReports.hostelOccupancy} 
          />
        </div>
      </div>
    </div>
  </div>
);

const PlacementReports = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Placement %" value="88.5%" icon={BriefcaseIcon} change="3.2% from last year" changeType="increase" />
      <StatCard title="Avg. Package" value="8.12 LPA" icon={CurrencyDollarIcon} change="12.5% from last year" changeType="increase" />
      <StatCard title="Highest Package" value="42.5 LPA" icon={ChartBarIcon} change="18% from last year" changeType="increase" />
      <StatCard title="Total Offers" value="1,245" icon={DocumentChartBarIcon} change="145 from last year" changeType="increase" />
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Placements</h3>
      <MemoizedBarChart 
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } },
        }} 
        data={placementReports.departmentWisePlacement} 
      />
    </div>
  </div>
);

const ExamReports = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Pass %" value="94.7%" icon={DocumentChartBarIcon} change="1.2% from last sem" changeType="increase" />
      <StatCard title="Highest CGPA" value="9.8/10" icon={AcademicCapIcon} change="0.2 from last sem" changeType="increase" />
      <StatCard title="Avg. CGPA" value="8.42/10" icon={ChartBarIcon} change="0.15 from last sem" changeType="increase" />
      <StatCard title="Failure Rate" value="2.1%" icon={DocumentChartBarIcon} change="0.5% from last sem" changeType="decrease" />
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Semester-wise Results</h3>
      <MemoizedLineChart 
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } },
        }} 
        data={examReports.semesterResults} 
      />
    </div>
  </div>
);

const FeeReports = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Collected" value="₹2.45 Cr" icon={CurrencyDollarIcon} change="12.5% from last year" changeType="increase" />
      <StatCard title="Outstanding" value="₹1.25 Cr" icon={DocumentChartBarIcon} change="5.2% from last month" changeType="decrease" />
      <StatCard title="Collection %" value="88.7%" icon={ChartBarIcon} change="2.1% from last year" changeType="increase" />
      <StatCard title="Scholarships" value="₹42.5 L" icon={AcademicCapIcon} change="8.3% from last year" changeType="increase" />
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Collection (Last 6 Months)</h3>
      <MemoizedLineChart 
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        }} 
        data={feeReports.feeCollection} 
      />
    </div>
  </div>
);

// Main Component
const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('admission');

  const tabs = [
    { id: 'admission', name: 'Admission Analytics', icon: UsersIcon, component: <AdmissionAnalytics /> },
    { id: 'performance', name: 'Performance', icon: AcademicCapIcon, component: <PerformanceReports /> },
    { id: 'facilities', name: 'Facility Usage', icon: BuildingLibraryIcon, component: <FacilityUtilization /> },
    { id: 'placements', name: 'Placements', icon: BriefcaseIcon, component: <PlacementReports /> },
    { id: 'exams', name: 'Exam Results', icon: DocumentChartBarIcon, component: <ExamReports /> },
    { id: 'fees', name: 'Fee Reports', icon: CurrencyDollarIcon, component: <FeeReports /> },
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">College Analytics Dashboard</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeComponent}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
