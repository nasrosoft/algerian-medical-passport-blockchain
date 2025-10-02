import express from 'express';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint - to be implemented',
    token: 'demo-token',
    user: {
      id: '1',
      username: 'demo-user',
      role: 'patient'
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint - to be implemented',
    user: {
      id: '2',
      username: req.body.username || 'new-user',
      role: req.body.role || 'patient'
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;