import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  UserCircleIcon,
  AcademicCapIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ApiService from '../../../services/api';

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const roleBadgeStyles = {
  President: 'bg-purple-100 text-purple-800',
  Secretary: 'bg-yellow-100 text-yellow-800',
  leader: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
};

const ClubMembers = () => {
  const { clubId } = useParams();
  const [members, setMembers] = useState([]);
  const [clubInfo, setClubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (clubId) {
      fetchMembers();
      fetchClubInfo();
    }
  }, [clubId]);

  const fetchClubInfo = async () => {
    try {
      const response = await ApiService.getClub(clubId);
      if (response && response.data) {
        setClubInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching club info:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`Fetching members for club ID: ${clubId}`);
      const response = await ApiService.getClubMembers(clubId);
      console.log('Members API response:', response);
      
      if (response && Array.isArray(response)) {
        // If response is an array, use it directly
        setMembers(response);
      } else if (response && response.success && Array.isArray(response.data)) {
        // If response has data array, use that
        setMembers(response.data);
      } else {
        setError('No members found or invalid response format');
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load members. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    try {
      setIsInviting(true);
      setInviteError('');
      
      const response = await ApiService.inviteClubMember({
        club_id: clubId,
        email: inviteEmail,
        role: inviteRole
      });
      
      if (response.success) {
        setInviteEmail('');
        setShowInviteModal(false);
        fetchMembers(); // Refresh the members list
      } else {
        setInviteError(response.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setInviteError('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      const response = await ApiService.updateClubMemberRole(clubId, memberId, newRole);
      if (response.success) {
        // Update the local state to reflect the change
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
      }
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await ApiService.removeClubMember(clubId, memberId);
        if (response.success) {
          // Remove the member from the local state
          setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        }
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchMembers}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Retry <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center">
            <Link 
              to="/admin/academics/clubs" 
              className="text-blue-600 hover:text-blue-800 mr-2"
            >
              &larr; Back to Clubs
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {clubInfo ? clubInfo.name : 'Club'} Members
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {clubInfo && clubInfo.description}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Manage members and their roles in this club.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search members
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="President">President</option>
                <option value="Secretary">Secretary</option>
                <option value="leader">Leader</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {member.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={member.avatar_url} alt={member.name} />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {member.name}
                          </p>
                          {member.is_faculty && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Faculty
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeStyles[member.role] || 'bg-gray-100 text-gray-800'}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                        <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[member.status] || 'bg-gray-100 text-gray-800'}`}>
                          {member.status === 'pending' ? (
                            <span className="flex items-center">
                              <ClockIcon className="mr-1 h-3 w-3" />
                              Pending
                            </span>
                          ) : member.status === 'active' ? (
                            <span className="flex items-center">
                              <CheckCircleIcon className="mr-1 h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            'Inactive'
                          )}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {member.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateMemberRole(member.id, 'member')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {member.status === 'active' && member.role !== 'admin' && (
                          <div className="relative">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                              className="text-sm rounded-md border-gray-300 py-1 pl-2 pr-8 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                              <option value="member">Member</option>
                              <option value="leader">Leader</option>
                              <option value="Secretary">Secretary</option>
                              <option value="President">President</option>
                            </select>
                          </div>
                        )}
                        {member.status === 'active' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove from club"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-10 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'No members match your search criteria.'
                  : 'Get started by inviting new members.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Invite Members
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <UserPlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Invite to Club</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Invite someone to join this club by entering their email address below.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleInviteMember} className="mt-5 sm:mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="leader">Leader</option>
                    <option value="Secretary">Secretary</option>
                    <option value="President">President</option>
                  </select>
                </div>
                {inviteError && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XMarkIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{inviteError}</h3>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isInviting}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm ${isInviting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMembers;
