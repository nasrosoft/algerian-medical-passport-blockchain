import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const AccessControl: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ py: 8 }}>
          <Typography variant="h4" gutterBottom>
            🔐 Access Control
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will manage data access permissions.
            <br />
            Implementation coming soon...
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccessControl;