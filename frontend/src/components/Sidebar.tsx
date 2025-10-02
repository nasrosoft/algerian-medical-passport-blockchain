import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  LocalPharmacy as PharmacyIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  HealthAndSafety as HealthIcon,
  People as PeopleIcon,
  AccountBalance as GovernmentIcon,
  LocalHospital as HospitalIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { EntityType } from '../types';

interface SidebarProps {
  open: boolean;
  userType: EntityType;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: EntityType[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: [EntityType.Government, EntityType.Doctor, EntityType.Pharmacy, EntityType.Patient],
  },
  {
    id: 'medical-records',
    label: 'Medical Records',
    icon: <AssignmentIcon />,
    path: '/medical-records',
    roles: [EntityType.Doctor, EntityType.Patient],
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: <PharmacyIcon />,
    path: '/prescriptions',
    roles: [EntityType.Doctor, EntityType.Pharmacy, EntityType.Patient],
    badge: '3',
  },
  {
    id: 'patients',
    label: 'My Patients',
    icon: <PeopleIcon />,
    path: '/patients',
    roles: [EntityType.Doctor],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon />,
    path: '/inventory',
    roles: [EntityType.Pharmacy],
  },
  {
    id: 'access-control',
    label: 'Access Control',
    icon: <SecurityIcon />,
    path: '/access-control',
    roles: [EntityType.Patient],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    roles: [EntityType.Government],
  },
  {
    id: 'providers',
    label: 'Healthcare Providers',
    icon: <HospitalIcon />,
    path: '/providers',
    roles: [EntityType.Government],
  },
  {
    id: 'system-health',
    label: 'System Health',
    icon: <HealthIcon />,
    path: '/system-health',
    roles: [EntityType.Government],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <PersonIcon />,
    path: '/profile',
    roles: [EntityType.Government, EntityType.Doctor, EntityType.Pharmacy, EntityType.Patient],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    roles: [EntityType.Government, EntityType.Doctor, EntityType.Pharmacy, EntityType.Patient],
  },
];

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ open, userType, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getUserTypeInfo = (type: EntityType) => {
    switch (type) {
      case EntityType.Government:
        return {
          label: 'Government Official',
          color: '#1976d2',
          icon: '🏛️',
        };
      case EntityType.Doctor:
        return {
          label: 'Doctor',
          color: '#2e7d32',
          icon: '👨‍⚕️',
        };
      case EntityType.Pharmacy:
        return {
          label: 'Pharmacy',
          color: '#ed6c02',
          icon: '💊',
        };
      case EntityType.Patient:
        return {
          label: 'Patient',
          color: '#7b1fa2',
          icon: '🧑‍🤝‍🧑',
        };
      default:
        return {
          label: 'User',
          color: '#666',
          icon: '👤',
        };
    }
  };

  const userTypeInfo = getUserTypeInfo(userType);
  const filteredNavItems = navItems.filter(item => item.roles.includes(userType));

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Type Header */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${userTypeInfo.color}22 0%, ${userTypeInfo.color}11 100%)`,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: userTypeInfo.color,
              width: 48,
              height: 48,
            }}
          >
            {userTypeInfo.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap>
              {userTypeInfo.label}
            </Typography>
            <Chip
              label="Verified"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {filteredNavItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${userTypeInfo.color}15`,
                    '&:hover': {
                      backgroundColor: `${userTypeInfo.color}25`,
                    },
                  },
                  '&:hover': {
                    backgroundColor: `${userTypeInfo.color}08`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? userTypeInfo.color : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Medical Passport v1.0.0
          <br />
          Powered by Blockchain
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;