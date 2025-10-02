import express from 'express';

const router = express.Router();

// GET /api/identity/profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient',
      medicalId: 'MP-001',
      verified: true
    }
  });
});

// PUT /api/identity/profile
router.put('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: req.body
  });
});

// GET /api/identity/blockchain-address
router.get('/blockchain-address', (req, res) => {
  res.json({
    success: true,
    address: '0x1234567890123456789012345678901234567890',
    network: 'localhost'
  });
});

export default router;