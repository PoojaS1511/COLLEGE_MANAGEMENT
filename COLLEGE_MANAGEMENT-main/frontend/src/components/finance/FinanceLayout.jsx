import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart3,
  GraduationCap,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  PieChart,
  Wrench,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    path: '/finance/dashboard',
    description: 'Financial overview & analytics'
  },
  {
    title: 'Student Fees',
    icon: GraduationCap,
    path: '/finance/student-fees',
    description: 'Fee management & tracking'
  },
  {
    title: 'Staff Payroll',
    icon: Users,
    path: '/finance/staff-payroll',
    description: 'Salary & payroll management'
  },
  {
    title: 'Expenses',
    icon: Receipt,
    path: '/finance/expenses',
    description: 'Expense tracking'
  },
  {
    title: 'Vendors',
    icon: CreditCard,
    path: '/finance/vendors',
    description: 'Vendor management'
  },
  {
    title: 'Budget Allocation',
    icon: PieChart,
    path: '/finance/budget',
    description: 'Budget planning & monitoring'
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    path: '/finance/maintenance',
    description: 'Maintenance requests & costs'
  },
  {
    title: 'AI Assistant',
    icon: MessageSquare,
    path: '/finance/ai-assistant',
    description: 'Financial AI assistant'
  },
];

const FinanceLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log current location
  React.useEffect(() => {
    console.log('Current FinanceLayout location:', location.pathname);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const normalizePath = (p) => {
    // Ensure finance paths are routed under /admin/finance
    if (!p) return '/admin/finance';
    if (p.startsWith('/finance')) return `/admin${p}`;
    if (p.startsWith('/')) return p;
    return `/${p}`;
  };

  const handleNavigation = (path) => {
    const target = normalizePath(path);
    console.log('Navigating to:', target);
    console.log('Current location:', location.pathname);
    try {
      navigate(target);
      if (isMobile) {
        setMobileOpen(false);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: '#1d395e' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Finance Module
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
          Financial Management System
        </Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => {
          const targetPath = normalizePath(item.path);
          const isActive = location.pathname === targetPath || 
                          (item.path !== '/finance/dashboard' && location.pathname.startsWith(targetPath));
          const Icon = item.icon;
          
          console.log(`Menu item: ${item.title}, Path: ${item.path}, Target: ${targetPath}, Active: ${isActive}, Current: ${location.pathname}`);
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  },
                }}
              >
                <ListItemIcon>
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => normalizePath(item.path) === location.pathname)?.title || 'Finance Module'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {/* Centered content container so all finance submodules are aligned */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 } }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default FinanceLayout;
