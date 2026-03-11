// Mock data for announcements
const mockAnnouncements = [
  {
    id: 'A001',
    title: 'Campus Reopening',
    content: 'The campus will reopen on September 1st with strict COVID-19 protocols in place. All students must carry their vaccination certificates.',
    category: 'general',
    priority: 'high',
    startDate: '2024-08-15',
    endDate: '2024-09-01',
    createdBy: 'Admin',
    createdAt: '2024-08-10T10:00:00Z',
    status: 'active',
    targetAudience: ['all_students', 'faculty']
  },
  {
    id: 'A002',
    title: 'Library Maintenance',
    content: 'The central library will be closed for maintenance from August 20-22, 2024. Please plan your studies accordingly.',
    category: 'facilities',
    priority: 'medium',
    startDate: '2024-08-18',
    endDate: '2024-08-22',
    createdBy: 'Library Dept',
    createdAt: '2024-08-12T14:30:00Z',
    status: 'active',
    targetAudience: ['all_students', 'faculty']
  },
  {
    id: 'A003',
    title: 'Holiday Notice',
    content: 'College will remain closed on August 30, 2024, on account of National Holiday.',
    category: 'holiday',
    priority: 'high',
    startDate: '2024-08-25',
    endDate: '2024-08-30',
    createdBy: 'Admin',
    createdAt: '2024-08-14T09:15:00Z',
    status: 'active',
    targetAudience: ['all_students', 'faculty', 'staff']
  }
];

// Mock data for messages
const mockMessages = [
  {
    id: 'M001',
    subject: 'Regarding Project Submission',
    content: 'Please submit your final year project proposal by the end of this week.',
    sender: 'Dr. Smith',
    senderId: 'FAC001',
    recipient: 'John Doe',
    recipientId: 'S1001',
    sentAt: '2024-08-10T11:30:00Z',
    read: false,
    labels: ['important', 'project']
  },
  {
    id: 'M002',
    subject: 'Fee Payment Reminder',
    content: 'This is a reminder that your fee payment is pending. Please clear the dues by August 25, 2024.',
    sender: 'Accounts Department',
    senderId: 'ACCT001',
    recipient: 'Jane Smith',
    recipientId: 'S1002',
    sentAt: '2024-08-12T15:45:00Z',
    read: true,
    labels: ['fees', 'reminder']
  },
  {
    id: 'M003',
    subject: 'Welcome to New Semester',
    content: 'Welcome back for the Fall 2024 semester. Please check the portal for your updated class schedule.',
    sender: 'Registrar Office',
    senderId: 'REG001',
    recipient: 'All Students',
    recipientId: 'all_students',
    sentAt: '2024-08-01T09:00:00Z',
    read: true,
    labels: ['welcome', 'semester']
  }
];

export const communicationService = {
  // Announcement methods
  getAnnouncements: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockAnnouncements];
        
        // Apply filters if provided
        if (filters.status) {
          results = results.filter(a => a.status === filters.status);
        }
        if (filters.priority) {
          results = results.filter(a => a.priority === filters.priority);
        }
        if (filters.category) {
          results = results.filter(a => a.category === filters.category);
        }
        
        resolve(results);
      }, 500);
    });
  },
  
  createAnnouncement: async (announcement) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAnnouncement = {
          ...announcement,
          id: `A${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        mockAnnouncements.unshift(newAnnouncement);
        resolve(newAnnouncement);
      }, 500);
    });
  },
  
  updateAnnouncement: async (id, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAnnouncements.findIndex(a => a.id === id);
        if (index !== -1) {
          mockAnnouncements[index] = {
            ...mockAnnouncements[index],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          resolve(mockAnnouncements[index]);
        } else {
          reject(new Error('Announcement not found'));
        }
      }, 500);
    });
  },
  
  // Message methods
  getInboxMessages: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = mockMessages.filter(
          msg => msg.recipientId === userId || msg.recipientId === 'all_students'
        );
        resolve(messages);
      }, 500);
    });
  },
  
  getSentMessages: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = mockMessages.filter(msg => msg.senderId === userId);
        resolve(messages);
      }, 500);
    });
  },
  
  sendMessage: async (message) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          ...message,
          id: `M${Math.floor(1000 + Math.random() * 9000)}`,
          sentAt: new Date().toISOString(),
          read: false
        };
        mockMessages.unshift(newMessage);
        resolve(newMessage);
      }, 500);
    });
  },
  
  markAsRead: async (messageId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = mockMessages.find(m => m.id === messageId);
        if (message) {
          message.read = true;
          resolve(true);
        }
        resolve(false);
      }, 500);
    });
  },
  
  // Get message statistics
  getMessageStats: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const inbox = mockMessages.filter(
          msg => msg.recipientId === userId || 
                (msg.recipientId === 'all_students' && msg.senderId !== userId)
        );
        
        const unread = inbox.filter(msg => !msg.read).length;
        
        resolve({
          totalInbox: inbox.length,
          unread,
          sent: mockMessages.filter(msg => msg.senderId === userId).length
        });
      }, 500);
    });
  }
};
