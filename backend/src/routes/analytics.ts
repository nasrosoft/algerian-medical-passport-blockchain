import express from 'express';

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPatients: 12547,
      totalDoctors: 1250,
      totalRecords: 45821,
      totalPrescriptions: 23456,
      monthlyGrowth: 8.5,
      systemUptime: '99.8%',
      blockchainTransactions: 69277,
      activeUsers: 8942
    }
  });
});

// GET /api/analytics/records
router.get('/records', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRecords: 45821,
      recordsByType: {
        consultation: 25400,
        vaccination: 8200,
        surgery: 3500,
        emergency: 4200,
        prescription: 4521
      },
      monthlyTrend: [
        { month: 'Jan', records: 3500 },
        { month: 'Feb', records: 3800 },
        { month: 'Mar', records: 4200 },
        { month: 'Apr', records: 4600 },
        { month: 'May', records: 4100 },
        { month: 'Jun', records: 4500 }
      ]
    }
  });
});

// GET /api/analytics/users
router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 13797,
      usersByRole: {
        patients: 12547,
        doctors: 1250
      },
      registrationTrend: [
        { month: 'Jan', registrations: 1200 },
        { month: 'Feb', registrations: 1350 },
        { month: 'Mar', registrations: 1100 },
        { month: 'Apr', registrations: 1450 },
        { month: 'May', registrations: 1300 },
        { month: 'Jun', registrations: 1400 }
      ]
    }
  });
});

export default router;