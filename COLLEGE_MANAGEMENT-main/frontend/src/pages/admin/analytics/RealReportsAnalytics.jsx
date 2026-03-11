import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  UsersIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  CalculatorIcon,
  TrophyIcon,
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
  Filler
} from 'chart.js';
import AnalyticsService from "../../../services/analyticsService";

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

// Lazy load chart components
const BarChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
const LineChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const DoughnutChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));

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

const MemoizedDoughnutChart = React.memo(({ data, options }) => (
  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
    <DoughnutChart data={data} options={options} className="h-64" />
  </Suspense>
));

// StatCard component for displaying key metrics
const StatCard = ({ title, value, icon: Icon, change, isPositive }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
                  )}
                  <span className="sr-only">{isPositive ? 'Increased' : 'Decreased'} by</span>
                  {change}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const RealReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState({
    placements: true,
    exams: true,
    fees: true
  });
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    placements: null,
    exams: null,
    fees: null
  });

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch placement analytics
        const placements = await AnalyticsService.getPlacementReports();
        setAnalyticsData(prev => ({ ...prev, placements }));
        setLoading(prev => ({ ...prev, placements: false }));
        
        // Fetch exam analytics
        const exams = await AnalyticsService.getExamReports();
        setAnalyticsData(prev => ({ ...prev, exams }));
        setLoading(prev => ({ ...prev, exams: false }));
        
        // Fetch fee analytics
        const fees = await AnalyticsService.getFeeReports();
        setAnalyticsData(prev => ({ ...prev, fees }));
        setLoading(prev => ({ ...prev, fees: false }));
        
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading({ placements: false, exams: false, fees: false });
      }
    };

    fetchAnalytics();
  }, []);

  // Render loading state
  if (loading.placements && loading.exams && loading.fees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Process and prepare chart data
  const placementChartData = {
    labels: analyticsData.placements?.by_department?.map(d => d.department) || [],
    datasets: [
      {
        label: 'Average Salary',
        data: analyticsData.placements?.by_department?.map(d => d.avg_salary) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Placements',
        data: analyticsData.placements?.by_department?.map(d => d.total_placements) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        type: 'bar',
        yAxisID: 'y1',
      }
    ]
  };

  const examChartData = {
    labels: analyticsData.exams?.by_exam_type?.map(e => e.exam_type) || [],
    datasets: [
      {
        label: 'Average Score',
        data: analyticsData.exams?.by_exam_type?.map(e => e.avg_score) || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const feeChartData = {
    labels: analyticsData.fees?.monthly_totals?.map(m => m.month) || [],
    datasets: Object.entries(analyticsData.fees?.monthly_totals?.[0]?.by_fee_type || {}).map(([feeType], index) => ({
      label: feeType,
      data: analyticsData.fees?.monthly_totals?.map(month => 
        month.by_fee_type?.[feeType]?.amount || 0
      ) || [],
      backgroundColor: `hsl(${index * 137.5}, 70%, 60%})`,
      borderColor: `hsl(${index * 137.5}, 70%, 50%})`,
      borderWidth: 1,
      fill: index === 0,
    }))
  };

  const tabs = [
    {
      name: 'Placements',
      icon: BriefcaseIcon,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Placements" 
              value={analyticsData.placements?.overview?.total_placements || 0} 
              icon={UsersIcon}
              change={analyticsData.placements?.overview?.change_total_placements}
              isPositive={analyticsData.placements?.overview?.change_total_placements >= 0}
            />
            <StatCard 
              title="Avg. Salary" 
              value={`₹${(analyticsData.placements?.overview?.avg_salary || 0).toLocaleString()}`} 
              icon={CurrencyDollarIcon}
              change={analyticsData.placements?.overview?.change_avg_salary}
              isPositive={analyticsData.placements?.overview?.change_avg_salary >= 0}
            />
            <StatCard 
              title="Top Department" 
              value={analyticsData.placements?.overview?.top_department || 'N/A'} 
              icon={BuildingLibraryIcon}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Placements by Department</h3>
            <div className="h-80">
              <MemoizedBarChart 
                data={placementChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Average Salary (₹)'
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                        drawOnChartArea: false,
                      },
                      title: {
                        display: true,
                        text: 'Number of Placements'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Companies</h3>
              <div className="space-y-4">
                {analyticsData.placements?.top_companies?.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{company.company}</span>
                    <span className="text-sm text-gray-500">{company.placements} placements</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Distribution</h3>
              <div className="h-64">
                <MemoizedDoughnutChart 
                  data={{
                    labels: analyticsData.placements?.salary_distribution?.map(d => 
                      `₹${d.range_start.toLocaleString()}-${(d.range_start + 10000).toLocaleString()}` 
                    ) || [],
                    datasets: [{
                      data: analyticsData.placements?.salary_distribution?.map(d => d.count) || [],
                      backgroundColor: [
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(129, 140, 248, 0.7)',
                        'rgba(167, 139, 250, 0.7)',
                        'rgba(217, 70, 239, 0.7)',
                      ],
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Exams',
      icon: AcademicCapIcon,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Exams" 
              value={analyticsData.exams?.overview?.total_exams || 0} 
              icon={DocumentTextIcon}
            />
            <StatCard 
              title="Avg. Score" 
              value={Math.round(analyticsData.exams?.overview?.overall_avg_score * 100) / 100 || 0} 
              icon={ChartBarIcon}
            />
            <StatCard 
              title="Top Performing" 
              value={analyticsData.exams?.overview?.highest_avg_score || 'N/A'} 
              icon={TrophyIcon}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Exam Type</h3>
            <div className="h-80">
              <MemoizedLineChart 
                data={examChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Average Score (%)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Statistics</h3>
              <div className="space-y-4">
                {analyticsData.exams?.by_exam_type?.map((exam, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{exam.exam_type}</span>
                      <span className="text-sm text-gray-500">
                        {exam.avg_score}% avg. score
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${exam.avg_score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
              <div className="h-64">
                {analyticsData.exams?.grade_distribution && (
                  <MemoizedDoughnutChart 
                    data={{
                      labels: Object.keys(analyticsData.exams.grade_distribution[Object.keys(analyticsData.exams.grade_distribution)[0]] || {}).map(g => `Grade ${g}`),
                      datasets: Object.entries(analyticsData.exams.grade_distribution).map(([examType, grades], i) => ({
                        label: examType,
                        data: Object.values(grades).map(g => g.percentage),
                        backgroundColor: [
                          'rgba(79, 70, 229, 0.7)',
                          'rgba(99, 102, 241, 0.7)',
                          'rgba(129, 140, 248, 0.7)',
                          'rgba(167, 139, 250, 0.7)',
                        ][i % 4],
                        borderWidth: 1,
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Fees',
      icon: CurrencyDollarIcon,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Collected" 
              value={`₹${(analyticsData.fees?.overview?.total_collected || 0).toLocaleString()}`} 
              icon={CurrencyDollarIcon}
            />
            <StatCard 
              title="Total Transactions" 
              value={analyticsData.fees?.overview?.total_transactions || 0} 
              icon={DocumentTextIcon}
            />
            <StatCard 
              title="Avg. Transaction" 
              value={`₹${(analyticsData.fees?.overview?.avg_transaction || 0).toLocaleString()}`} 
              icon={CalculatorIcon}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Fee Collection</h3>
            <div className="h-80">
              <MemoizedLineChart 
                data={feeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount (₹)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Status</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.fees?.fee_status || {}).map(([feeType, statuses]) => (
                  <div key={feeType} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{feeType}</span>
                      <span className="text-gray-500">
                        ₹{statuses.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      {statuses.map((status, i) => (
                        <div 
                          key={i}
                          className={`h-full inline-block ${
                            status.status === 'paid' ? 'bg-green-500' : 
                            status.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${status.percentage}%`,
                            marginLeft: i > 0 ? '-4px' : '0' 
                          }}
                          title={`${status.status}: ${status.percentage}%`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      {statuses.map((status, i) => (
                        <span key={i}>
                          {status.status}: {status.percentage}%
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
              <div className="h-64">
                <MemoizedDoughnutChart 
                  data={{
                    labels: analyticsData.fees?.payment_methods?.map(m => m.method) || [],
                    datasets: [{
                      data: analyticsData.fees?.payment_methods?.map(m => m.total_amount) || [],
                      backgroundColor: [
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(129, 140, 248, 0.7)',
                        'rgba(167, 139, 250, 0.7)',
                        'rgba(217, 70, 239, 0.7)',
                      ],
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {loading[tabs[activeTab].name.toLowerCase()] && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs[activeTab].component}
      </div>
    </div>
  );
};

export default RealReportsAnalytics;
