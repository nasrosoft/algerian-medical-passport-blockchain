import express from 'express';

const router = express.Router();

// GET /api/medical-records
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        patientId: 'MP-001',
        recordType: 'consultation',
        date: '2024-01-15',
        doctor: 'Dr. Ahmed Benali',
        diagnosis: 'Routine checkup',
        treatment: 'No treatment required',
        blockchainTxHash: '0xabcd...'
      },
      {
        id: '2',
        patientId: 'MP-001',
        recordType: 'vaccination',
        date: '2024-01-10',
        doctor: 'Dr. Sarah Medjani',
        diagnosis: 'COVID-19 vaccination',
        treatment: 'Pfizer vaccine administered',
        blockchainTxHash: '0xef12...'
      }
    ]
  });
});

// POST /api/medical-records
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Medical record created successfully',
    data: {
      id: '3',
      ...req.body,
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 8) + '...'
    }
  });
});

// GET /api/medical-records/:id
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      patientId: 'MP-001',
      recordType: 'consultation',
      date: '2024-01-15',
      doctor: 'Dr. Ahmed Benali',
      diagnosis: 'Detailed medical record for ID: ' + req.params.id,
      treatment: 'Sample treatment',
      blockchainTxHash: '0xabcd...'
    }
  });
});

export default router;