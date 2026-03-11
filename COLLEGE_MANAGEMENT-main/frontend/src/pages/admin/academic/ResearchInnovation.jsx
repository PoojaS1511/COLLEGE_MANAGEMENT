import React, { useState } from 'react';

// Mock data for research projects
const mockProjects = [
  {
    id: 1,
    title: 'AI in Renewable Energy Optimization',
    lead: 'Dr. Sarah Chen',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    funding: 125000,
    department: 'Computer Science',
    teamSize: 8,
    progress: 45,
    category: 'Artificial Intelligence'
  },
  {
    id: 2,
    title: 'Advanced Materials for Solar Cells',
    lead: 'Dr. James Wilson',
    status: 'Active',
    startDate: '2024-09-01',
    endDate: '2025-08-31',
    funding: 98000,
    department: 'Materials Science',
    teamSize: 6,
    progress: 70,
    category: 'Renewable Energy'
  },
  {
    id: 3,
    title: 'Blockchain for Supply Chain Security',
    lead: 'Dr. Priya Patel',
    status: 'Completed',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    funding: 75000,
    department: 'Information Technology',
    teamSize: 5,
    progress: 100,
    category: 'Blockchain'
  },
  {
    id: 4,
    title: 'Neural Networks for Medical Diagnosis',
    lead: 'Dr. Michael Brown',
    status: 'Proposed',
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    funding: 0,
    department: 'Computer Science',
    teamSize: 0,
    progress: 0,
    category: 'Healthcare Technology'
  },
];

// Mock data for funding opportunities
const fundingOpportunities = [
  {
    id: 1,
    name: 'National Science Foundation Grant',
    deadline: '2025-11-15',
    amount: 'Up to $500,000',
    category: 'Federal',
    status: 'Open'
  },
  {
    id: 2,
    name: 'Tech Innovation Challenge',
    deadline: '2025-10-30',
    amount: '$250,000',
    category: 'Corporate',
    status: 'Open'
  },
  {
    id: 3,
    name: 'Sustainable Development Fund',
    deadline: '2025-09-15',
    amount: '$100,000',
    category: 'Non-Profit',
    status: 'Upcoming'
  },
];

// Mock data for mentors
const mentors = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    department: 'Computer Science',
    expertise: ['AI/ML', 'Data Science', 'Renewable Energy'],
    currentProjects: 3,
    availability: 'Moderate'
  },
  {
    id: 2,
    name: 'Dr. James Wilson',
    department: 'Materials Science',
    expertise: ['Nanomaterials', 'Solar Energy', 'Material Chemistry'],
    currentProjects: 2,
    availability: 'High'
  },
  {
    id: 3,
    name: 'Dr. Priya Patel',
    department: 'Information Technology',
    expertise: ['Blockchain', 'Cybersecurity', 'Distributed Systems'],
    currentProjects: 4,
    availability: 'Low'
  },
];

const ResearchInnovation = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewFunding, setShowNewFunding] = useState(false);
  const [showNewMentor, setShowNewMentor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = mockProjects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-600">Lead: {project.lead} • {project.department}</p>
          <div className="mt-2 flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : project.status === 'Completed' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {project.startDate} to {project.endDate}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            ${project.funding.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Funding</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex -space-x-2">
          {[...Array(Math.min(project.teamSize, 5))].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white"></div>
          ))}
          {project.teamSize > 5 && (
            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
              +{project.teamSize - 5}
            </div>
          )}
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View Details
        </button>
      </div>
    </div>
  );

  const FundingOpportunityCard = ({ opportunity }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{opportunity.name}</h3>
          <p className="text-sm text-gray-600">{opportunity.amount} • {opportunity.category}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          opportunity.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {opportunity.status}
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Deadline: <span className="font-medium">{opportunity.deadline}</span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Apply Now
        </button>
      </div>
    </div>
  );

  const MentorCard = ({ mentor }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start">
        <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 font-medium">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{mentor.name}</h3>
          <p className="text-sm text-gray-600">{mentor.department} Department</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {mentor.expertise.map((skill, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="mr-4">{mentor.currentProjects} active projects</span>
            <span>Availability: </span>
            <span className={`ml-1 font-medium ${
              mentor.availability === 'High' ? 'text-green-600' : 
              mentor.availability === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {mentor.availability}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Request Mentorship
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Research & Innovation Cell</h1>
        <p className="text-gray-600">Manage research projects, funding opportunities, and mentorship programs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Research Projects
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'funding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Funding Opportunities
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mentors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mentors
          </button>
          <button
            onClick={() => setActiveTab('publications')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'publications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Publications
          </button>
        </nav>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-shrink-0">
          {activeTab === 'projects' && (
            <button
              onClick={() => setShowNewProject(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Project
            </button>
          )}
          {activeTab === 'funding' && (
            <button
              onClick={() => setShowNewFunding(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Funding Opportunity
            </button>
          )}
          {activeTab === 'mentors' && (
            <button
              onClick={() => setShowNewMentor(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              </svg>
              Add Mentor
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
        
        {activeTab === 'funding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundingOpportunities.map(opportunity => (
              <FundingOpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
        
        {activeTab === 'mentors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
        
        {activeTab === 'publications' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Research Publications</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                List of all research papers, articles, and publications by faculty and students.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">No publications found</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  There are no publications to display at this time.
                </dd>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {mockProjects.filter(p => p.status === 'Active').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Funding</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ${mockProjects.reduce((sum, p) => sum + p.funding, 0).toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Research Staff</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {mentors.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Publications</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">0</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchInnovation;
