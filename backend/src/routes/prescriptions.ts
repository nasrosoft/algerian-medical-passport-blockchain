import express from 'express';

const router = express.Router();

// GET /api/prescriptions
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        patientId: 'MP-001',
        doctorId: 'DR-001',
        medication: 'Paracetamol 500mg',
        dosage: '2 tablets every 6 hours',
        duration: '5 days',
        date: '2024-01-15',
        status: 'active',
        blockchainTxHash: '0xabc123...'
      },
      {
        id: '2',
        patientId: 'MP-001',
        doctorId: 'DR-002',
        medication: 'Amoxicillin 250mg',
        dosage: '1 capsule every 8 hours',
        duration: '7 days',
        date: '2024-01-10',
        status: 'completed',
        blockchainTxHash: '0xdef456...'
      }
    ]
  });
});

// POST /api/prescriptions
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prescription created successfully',
    data: {
      id: '3',
      ...req.body,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 8) + '...'
    }
  });
});

// GET /api/prescriptions/:id
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      patientId: 'MP-001',
      doctorId: 'DR-001',
      medication: 'Sample medication for prescription ' + req.params.id,
      dosage: '1 tablet daily',
      duration: '30 days',
      date: '2024-01-15',
      status: 'active',
      blockchainTxHash: '0xsample...'
    }
  });
});

// PUT /api/prescriptions/:id/status
router.put('/:id/status', (req, res) => {
  res.json({
    success: true,
    message: 'Prescription status updated',
    data: {
      id: req.params.id,
      status: req.body.status,
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;