import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  LightBulbIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Sample research data
const researchProjects = [
  {
    id: 1,
    title: 'AI for Sustainable Energy',
    lead: 'Dr. Sarah Johnson',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2026-06-30',
    budget: '$250,000',
    teamSize: 8,
    description: 'Developing AI models to optimize renewable energy distribution and reduce waste in power grids.'
  },
  {
    id: 2,
    title: 'Blockchain in Healthcare',
    lead: 'Dr. Michael Chen',
    status: 'Active',
    startDate: '2025-03-01',
    endDate: '2026-12-31',
    budget: '$180,000',
    teamSize: 6,
    description: 'Exploring blockchain applications for secure and efficient healthcare data management.'
  },
  {
    id: 3,
    title: 'Quantum Computing Algorithms',
    lead: 'Dr. Emily Zhang',
    status: 'Upcoming',
    startDate: '2025-06-01',
    endDate: '2027-05-31',
    budget: '$350,000',
    teamSize: 10,
    description: 'Developing novel quantum algorithms for complex computational problems in various industries.'
  }
];

const fundingOpportunities = [
  {
    id: 1,
    name: 'National Science Foundation Grant',
    amount: '$500,000',
    deadline: '2025-12-15',
    status: 'Open',
    category: 'Federal'
  },
  {
    id: 2,
    name: 'Tech Innovation Challenge',
    amount: '$250,000',
    deadline: '2025-10-30',
    status: 'Open',
    category: 'Corporate'
  },
  {
    id: 3,
    name: 'Sustainable Development Fund',
    amount: '$175,000',
    deadline: '2025-09-15',
    status: 'Upcoming',
    category: 'NGO'
  }
];

const publications = [
  {
    id: 1,
    title: 'Advancements in Neural Networks for Image Recognition',
    authors: 'Dr. Sarah Johnson, Dr. Robert Kim',
    journal: 'Journal of Artificial Intelligence Research',
    year: 2025,
    citation: 'Johnson, S., & Kim, R. (2025). Journal of AI Research, 12(3), 45-67.',
    link: '#'
  },
  {
    id: 2,
    title: 'Blockchain Applications in Supply Chain Management',
    authors: 'Dr. Michael Chen, Dr. Lisa Wang',
    journal: 'International Journal of Blockchain Technologies',
    year: 2024,
    citation: 'Chen, M., & Wang, L. (2024). IJBT, 8(2), 112-130.',
    link: '#'
  },
  {
    id: 3,
    title: 'Quantum Machine Learning: Current State and Future Prospects',
    authors: 'Dr. Emily Zhang, Dr. David Park',
    journal: 'Quantum Computing Review',
    year: 2025,
    citation: 'Zhang, E., & Park, D. (2025). QCR, 5(1), 78-95.',
    link: '#'
  }
];

const ITCResearch = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'Upcoming': 'bg-yellow-100 text-yellow-800',
      'Open': 'bg-blue-100 text-blue-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">ITC Research Portal</h1>
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <LightBulbIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">12</p>
                <span className="ml-2 text-sm text-green-600 font-medium">+2 this month</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Funding</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">$2.8M</p>
                <span className="ml-2 text-sm text-green-600 font-medium">+15% YoY</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Publications</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">48</p>
                <span className="ml-2 text-sm text-green-600 font-medium">+8 this year</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Research Projects
            </button>
            <button
              onClick={() => setActiveTab('funding')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'funding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Funding Opportunities
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'publications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Publications
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Research Projects</h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Project
                </button>
              </div>
              
              <div className="space-y-4">
                {researchProjects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project.lead}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {project.teamSize} team members
                          </span>
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 text-right">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Budget:</span> {project.budget}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </p>
                        <button className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                          View Details <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'funding' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Funding Opportunities</h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Opportunity
                </button>
              </div>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Opportunity
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Deadline
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {fundingOpportunities.map((funding) => (
                      <tr key={funding.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {funding.name}
                          <p className="text-xs text-gray-500 mt-1">{funding.category} Funding</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {funding.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(funding.deadline)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getStatusBadge(funding.status)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href="#" className="text-blue-600 hover:text-blue-900">
                            Apply<span className="sr-only">, {funding.name}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'publications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Publications</h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Publication
                </button>
              </div>
              
              <div className="space-y-6">
                {publications.map((pub) => (
                  <div key={pub.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900">{pub.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{pub.authors}</p>
                    <p className="mt-1 text-sm text-gray-500">{pub.journal}, {pub.year}</p>
                    <p className="mt-2 text-sm text-gray-700">{pub.citation}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <a 
                        href={pub.link} 
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Publication
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </a>
                      <div className="flex space-x-3">
                        <button className="text-gray-400 hover:text-gray-500">
                          <span className="sr-only">Cite</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2H8a2 2 0 01-2-2v-2" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-500">
                          <span className="sr-only">Share</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <LightBulbIcon className="h-4 w-4 text-blue-600" />
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-medium">Dr. Sarah Johnson</span> submitted a new research proposal: "AI for Sustainable Energy"
              </p>
              <p className="mt-1 text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-medium">Research Grant</span> from National Science Foundation approved for $250,000
              </p>
              <p className="mt-1 text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-purple-600" />
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-800">
                New publication: "Advancements in Neural Networks for Image Recognition" published in Journal of AI Research
              </p>
              <p className="mt-1 text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITCResearch;
