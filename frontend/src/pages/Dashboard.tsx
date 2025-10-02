import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  LocalPharmacy as PharmacyIcon,
  HealthAndSafety as HealthIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as GovernmentIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { EntityType, DashboardProps } from '../types';
import { useWeb3 } from '../hooks/useWeb3';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

const Dashboard: React.FC<DashboardProps> = ({ userType }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<number>(0);
  const { account } = useWeb3();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats(getStatsForUserType(userType));
      setRecentActivity(getRecentActivityForUserType(userType));
      setNotifications(Math.floor(Math.random() * 5) + 1);
      setLoading(false);
    }, 1000);
  }, [userType]);

  const getStatsForUserType = (type: EntityType): StatCard[] => {
    switch (type) {
      case EntityType.Government:
        return [
          {
            title: 'Total Registered Users',
            value: 12847,
            change: '+12%',
            icon: <PeopleIcon />,
            color: '#2196f3',
          },
          {
            title: 'Healthcare Providers',
            value: 1250,
            change: '+5%',
            icon: <HospitalIcon />,
            color: '#4caf50',
          },
          {
            title: 'Active Prescriptions',
            value: 3542,
            change: '+18%',
            icon: <PharmacyIcon />,
            color: '#ff9800',
          },
          {
            title: 'System Uptime',
            value: '99.9%',
            change: 'Stable',
            icon: <SecurityIcon />,
            color: '#9c27b0',
          },
        ];

      case EntityType.Doctor:
        return [
          {
            title: 'My Patients',
            value: 145,
            change: '+8%',
            icon: <PeopleIcon />,
            color: '#2196f3',
          },
          {
            title: 'Records Created',
            value: 89,
            change: '+15%',
            icon: <AssignmentIcon />,
            color: '#4caf50',
          },
          {
            title: 'Prescriptions Issued',
            value: 67,
            change: '+22%',
            icon: <PharmacyIcon />,
            color: '#ff9800',
          },
          {
            title: 'Consultations This Week',
            value: 23,
            change: '+5%',
            icon: <HealthIcon />,
            color: '#9c27b0',
          },
        ];

      case EntityType.Pharmacy:
        return [
          {
            title: 'Prescriptions Verified',
            value: 234,
            change: '+12%',
            icon: <AssignmentIcon />,
            color: '#2196f3',
          },
          {
            title: 'Medications Dispensed',
            value: 456,
            change: '+8%',
            icon: <PharmacyIcon />,
            color: '#4caf50',
          },
          {
            title: 'Active Prescriptions',
            value: 78,
            change: '+18%',
            icon: <TrendingUpIcon />,
            color: '#ff9800',
          },
          {
            title: 'Customer Satisfaction',
            value: '4.8/5',
            change: 'Excellent',
            icon: <HealthIcon />,
            color: '#9c27b0',
          },
        ];

      case EntityType.Patient:
        return [
          {
            title: 'Medical Records',
            value: 12,
            change: '+2 this month',
            icon: <AssignmentIcon />,
            color: '#2196f3',
          },
          {
            title: 'Active Prescriptions',
            value: 3,
            change: '2 ready for pickup',
            icon: <PharmacyIcon />,
            color: '#4caf50',
          },
          {
            title: 'Authorized Doctors',
            value: 5,
            change: '3 active permissions',
            icon: <HospitalIcon />,
            color: '#ff9800',
          },
          {
            title: 'Health Score',
            value: '8.5/10',
            change: 'Good',
            icon: <HealthIcon />,
            color: '#9c27b0',
          },
        ];

      default:
        return [];
    }
  };

  const getRecentActivityForUserType = (type: EntityType): ActivityItem[] => {
    const baseActivities = [
      {
        id: '1',
        type: 'info',
        description: 'System updated successfully',
        timestamp: '2 hours ago',
        status: 'success' as const,
      },
      {
        id: '2',
        type: 'warning',
        description: 'Scheduled maintenance reminder',
        timestamp: '1 day ago',
        status: 'warning' as const,
      },
    ];

    switch (type) {
      case EntityType.Government:
        return [
          {
            id: '3',
            type: 'registration',
            description: 'New doctor registered - Dr. Ahmed Ben Ali',
            timestamp: '30 minutes ago',
            status: 'info',
          },
          {
            id: '4',
            type: 'verification',
            description: 'Pharmacy license verified - Pharmacie Central',
            timestamp: '1 hour ago',
            status: 'success',
          },
          ...baseActivities,
        ];

      case EntityType.Doctor:
        return [
          {
            id: '3',
            type: 'record',
            description: 'Created medical record for Patient #1247',
            timestamp: '45 minutes ago',
            status: 'success',
          },
          {
            id: '4',
            type: 'prescription',
            description: 'Issued prescription for hypertension treatment',
            timestamp: '2 hours ago',
            status: 'info',
          },
          ...baseActivities,
        ];

      case EntityType.Pharmacy:
        return [
          {
            id: '3',
            type: 'dispensing',
            description: 'Dispensed medication for Prescription #789',
            timestamp: '20 minutes ago',
            status: 'success',
          },
          {
            id: '4',
            type: 'verification',
            description: 'Verified prescription from Dr. Sarah Khalil',
            timestamp: '1 hour ago',
            status: 'info',
          },
          ...baseActivities,
        ];

      case EntityType.Patient:
        return [
          {
            id: '3',
            type: 'access',
            description: 'Granted access to Dr. Mohamed Alami',
            timestamp: '3 hours ago',
            status: 'info',
          },
          {
            id: '4',
            type: 'prescription',
            description: 'New prescription ready for pickup',
            timestamp: '1 day ago',
            status: 'warning',
          },
          ...baseActivities,
        ];

      default:
        return baseActivities;
    }
  };

  const getWelcomeMessage = (type: EntityType) => {
    const userProfile = localStorage.getItem(`userProfile_${account}`);
    const firstName = userProfile ? JSON.parse(userProfile).firstName : 'User';

    switch (type) {
      case EntityType.Government:
        return {
          title: `Welcome back, ${firstName}`,
          subtitle: 'Monitor and manage the healthcare system',
          color: '#1976d2',
          icon: <GovernmentIcon sx={{ fontSize: 40 }} />,
        };
      case EntityType.Doctor:
        return {
          title: `Good day, Dr. ${firstName}`,
          subtitle: 'Manage your patients and medical records',
          color: '#2e7d32',
          icon: <HospitalIcon sx={{ fontSize: 40 }} />,
        };
      case EntityType.Pharmacy:
        return {
          title: `Hello, ${firstName}`,
          subtitle: 'Verify prescriptions and manage inventory',
          color: '#ed6c02',
          icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
        };
      case EntityType.Patient:
        return {
          title: `Welcome, ${firstName}`,
          subtitle: 'Access your medical records and health information',
          color: '#7b1fa2',
          icon: <PersonIcon sx={{ fontSize: 40 }} />,
        };
      default:
        return {
          title: 'Welcome',
          subtitle: 'Medical Passport Dashboard',
          color: '#1976d2',
          icon: <DashboardIcon sx={{ fontSize: 40 }} />,
        };
    }
  };

  const getQuickActions = (type: EntityType) => {
    switch (type) {
      case EntityType.Government:
        return [
          { label: 'Register Provider', color: 'primary', icon: <AddIcon /> },
          { label: 'View Analytics', color: 'secondary', icon: <AnalyticsIcon /> },
          { label: 'System Status', color: 'info', icon: <SecurityIcon /> },
          { label: 'Generate Report', color: 'warning', icon: <AssignmentIcon /> },
        ];
      case EntityType.Doctor:
        return [
          { label: 'New Patient Record', color: 'primary', icon: <AddIcon /> },
          { label: 'Issue Prescription', color: 'secondary', icon: <PharmacyIcon /> },
          { label: 'View Patients', color: 'info', icon: <PeopleIcon /> },
          { label: 'Schedule Appointment', color: 'warning', icon: <AssignmentIcon /> },
        ];
      case EntityType.Pharmacy:
        return [
          { label: 'Verify Prescription', color: 'primary', icon: <VisibilityIcon /> },
          { label: 'Dispense Medication', color: 'secondary', icon: <PharmacyIcon /> },
          { label: 'Check Inventory', color: 'info', icon: <AssignmentIcon /> },
          { label: 'Update Status', color: 'warning', icon: <EditIcon /> },
        ];
      case EntityType.Patient:
        return [
          { label: 'View Records', color: 'primary', icon: <VisibilityIcon /> },
          { label: 'Manage Access', color: 'secondary', icon: <SecurityIcon /> },
          { label: 'Prescriptions', color: 'info', icon: <PharmacyIcon /> },
          { label: 'Health Summary', color: 'warning', icon: <HealthIcon /> },
        ];
      default:
        return [];
    }
  };

  const welcomeMessage = getWelcomeMessage(userType);
  const quickActions = getQuickActions(userType);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${welcomeMessage.color}22 0%, ${welcomeMessage.color}11 100%)`,
          border: `1px solid ${welcomeMessage.color}33`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: welcomeMessage.color,
              width: 60,
              height: 60,
            }}
          >
            {welcomeMessage.icon}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              {welcomeMessage.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {welcomeMessage.subtitle}
            </Typography>
          </Box>
          <Box>
            <IconButton color="inherit">
              <NotificationsIcon />
              {notifications > 0 && (
                <Chip
                  label={notifications}
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 20,
                    height: 20,
                  }}
                />
              )}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="h2" color="primary">
                      {stat.value}
                    </Typography>
                    {stat.change && (
                      <Typography variant="body2" color="textSecondary">
                        {stat.change}
                      </Typography>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color={action.color as any}
                    startIcon={action.icon}
                    size="large"
                    sx={{
                      height: 80,
                      flexDirection: 'column',
                      gap: 1,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          activity.status === 'success'
                            ? '#4caf50'
                            : activity.status === 'warning'
                            ? '#ff9800'
                            : activity.status === 'error'
                            ? '#f44336'
                            : '#2196f3',
                        width: 32,
                        height: 32,
                      }}
                    >
                      <NotificationsIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description}
                    secondary={activity.timestamp}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Role-specific additional content */}
        {userType === EntityType.Patient && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              💡 <strong>Tip:</strong> You can control which doctors have access to your medical records. 
              Visit the Access Control page to manage permissions.
            </Alert>
          </Grid>
        )}

        {userType === EntityType.Doctor && (
          <Grid item xs={12}>
            <Alert severity="success" sx={{ mb: 2 }}>
              ✨ <strong>New Feature:</strong> You can now create prescription templates for common treatments. 
              This will save time during consultations.
            </Alert>
          </Grid>
        )}

        {userType === EntityType.Government && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              🔧 <strong>Maintenance Notice:</strong> Scheduled system maintenance on Saturday, 2AM-4AM. 
              All services will be temporarily unavailable.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Floating Action Button for primary action */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Dashboard;