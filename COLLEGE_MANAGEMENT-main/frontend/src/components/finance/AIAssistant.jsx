import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Send, Bot, User, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import MetricCard from './MetricCard';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your financial AI assistant. I can help you with:\n\n• Financial data analysis and insights\n• Department-wise budget tracking\n• Expense and revenue trends\n• Student fee collection status\n• Staff payroll information\n• Budget allocation optimization\n• Maintenance cost analysis\n\nFeel free to ask me anything about your institution\'s finances!',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickInsights, setQuickInsights] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate quick insights on component mount
    generateQuickInsights();
  }, []);

  const generateQuickInsights = () => {
    // Mock quick insights - in real app, this would come from API
    const insights = [
      {
        title: 'Revenue Growth',
        value: '+12.5%',
        description: 'Monthly revenue increased compared to last month',
        icon: TrendingUp,
        color: 'success',
      },
      {
        title: 'Pending Dues',
        value: '₹21L',
        description: 'Total pending student fees across all departments',
        icon: AlertCircle,
        color: 'warning',
      },
      {
        title: 'Budget Utilization',
        value: '68%',
        description: 'Average budget utilization across departments',
        icon: DollarSign,
        color: 'info',
      },
    ];
    setQuickInsights(insights);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call to AI service
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Mock AI responses based on keywords
    if (lowerQuery.includes('revenue') || lowerQuery.includes('income')) {
      return `Based on the current financial data, here's the revenue analysis:\n\n**Total Revenue**: ₹1.25 Crore\n**Monthly Growth**: +12.5%\n**Top Revenue Sources**:\n1. CSE Department: ₹45L\n2. ECE Department: ₹32L\n3. Mechanical Department: ₹28L\n\n**Recommendation**: Focus on increasing fee collection from pending dues to boost revenue further.`;
    }
    
    if (lowerQuery.includes('expense') || lowerQuery.includes('spending')) {
      return `Current expense analysis:\n\n**Total Expenses**: ₹87.5L\n**Major Expense Categories**:\n1. Infrastructure: ₹25L\n2. Staff Salaries: ₹32L\n3. Equipment: ₹18L\n4. Utilities: ₹12.5L\n\n**Insight**: Infrastructure costs have increased by 8% this quarter. Consider preventive maintenance to reduce unexpected expenses.`;
    }
    
    if (lowerQuery.includes('budget') || lowerQuery.includes('allocation')) {
      return `Budget allocation overview:\n\n**Total Allocated**: ₹1.8 Crore\n**Utilization Rate**: 68%\n**Department-wise Status**:\n- CSE: 64% utilized\n- ECE: 70% utilized\n- Mechanical: 97% utilized (⚠️ High utilization)\n- Civil: 72% utilized\n- EEE: 50% utilized\n\n**Alert**: Mechanical department is approaching budget limit. Consider additional allocation or expense optimization.`;
    }
    
    if (lowerQuery.includes('fee') || lowerQuery.includes('student')) {
      return `Student fee collection status:\n\n**Total Fees**: ₹67.5L\n**Collected**: ₹46.5L (68.9%)\n**Pending**: ₹21L\n\n**Department-wise Collection**:\n- CSE: 72% collected\n- ECE: 85% collected\n- Mechanical: 50% collected\n- Civil: 100% collected\n- EEE: 48% collected\n\n**Action Required**: Follow up with Mechanical and EEE departments for pending fee collections.`;
    }
    
    if (lowerQuery.includes('payroll') || lowerQuery.includes('salary')) {
      return `Staff payroll summary:\n\n**Total Monthly Payroll**: ₹43.2L\n**Staff Count**: 156 employees\n**Average Salary**: ₹2.77L\n\n**Department-wise Payroll**:\n- CSE: ₹12.8L\n- ECE: ₹10.2L\n- Mechanical: ₹8.5L\n- Administration: ₹7.2L\n- Others: ₹4.5L\n\nAll salaries for this month have been processed successfully.`;
    }
    
    if (lowerQuery.includes('vendor') || lowerQuery.includes('payment')) {
      return `Vendor payment status:\n\n**Total Amount Due**: ₹5.65L\n**Total Amount Paid**: ₹13.4L\n**Active Vendors**: 45\n\n**Critical Payments**:\n- ABC Construction: ₹2.5L (Overdue by 15 days)\n- Tech Solutions: ₹1.8L (Due in 5 days)\n\n**Recommendation**: Prioritize payments to construction vendors to avoid project delays.`;
    }
    
    if (lowerQuery.includes('maintenance')) {
      return `Maintenance request analysis:\n\n**Total Requests**: 127\n**Pending**: 23 (18%)\n**In Progress**: 34 (27%)\n**Resolved**: 70 (55%)\n**Total Cost**: ₹3.8L\n\n**Critical Issues**:\n- Hostel water pump: Resolved\n- CSE Lab AC: In Progress\n- Library computers: Pending\n\n**Trend**: Average resolution time improved from 5 days to 3.2 days this month.`;
    }
    
    // Default response
    return `I understand you're asking about "${query}". Based on the available financial data, I can provide insights on:\n\n• Revenue and expense analysis\n• Budget allocation and utilization\n• Student fee collection status\n• Staff payroll information\n• Vendor payment tracking\n• Maintenance request analysis\n• Department-wise financial performance\n\nCould you please specify which aspect you'd like to explore further? For example, you could ask "What's the current revenue status?" or "How are we doing on budget utilization?"`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e', mb: 2 }}>
          Financial AI Assistant
        </Typography>
        
        {/* Quick Insights */}
        <Grid container spacing={2}>
          {quickInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Grid item xs={12} md={4} key={index}>
                <MetricCard
                  title={insight.title}
                  value={insight.value}
                  icon={Icon}
                  color={insight.color}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                mb: 3,
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', maxWidth: '70%', gap: 2 }}>
                {message.type === 'assistant' && (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: '#1d395e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={20} color="white" />
                  </Box>
                )}
                
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: message.type === 'user' ? '#1d395e' : '#f9fafb',
                    color: message.type === 'user' ? 'white' : 'inherit',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    mt: 1, 
                    display: 'block', 
                    opacity: 0.7 
                  }}>
                    {formatTime(message.timestamp)}
                  </Typography>
                </Paper>
                
                {message.type === 'user' && (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={20} color="#6b7280" />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#1d395e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} color="white" />
                </Box>
                <Paper sx={{ p: 3, backgroundColor: '#f9fafb' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    AI is thinking...
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me anything about your finances..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            sx={{
              px: 3,
              backgroundColor: '#1d395e',
              '&:hover': { backgroundColor: '#2a4a7a' },
              borderRadius: 2,
            }}
          >
            <Send size={20} />
          </Button>
        </Box>
        
        {/* Quick Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="Show revenue summary" 
            variant="outlined" 
            size="small"
            onClick={() => setInputValue('What is the current revenue status?')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Budget utilization" 
            variant="outlined" 
            size="small"
            onClick={() => setInputValue('How is our budget utilization across departments?')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Pending fees" 
            variant="outlined" 
            size="small"
            onClick={() => setInputValue('What are the pending student fees?')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Expense analysis" 
            variant="outlined" 
            size="small"
            onClick={() => setInputValue('Analyze our current expenses')}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;
