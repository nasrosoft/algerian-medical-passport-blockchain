import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Stack
} from '@mui/material';
import { useWeb3 } from '../hooks/useWeb3';
import { SUPPORTED_NETWORKS } from '../config';

interface NetworkSwitcherProps {
  currentChainId: number | null;
  isConnected: boolean;
  onSwitchNetwork?: (chainId: number) => void;
}

const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  currentChainId,
  isConnected,
  onSwitchNetwork
}) => {
  const { switchNetwork } = useWeb3();

  // Only show the switcher if wallet is connected
  if (!isConnected) {
    return null;
  }

  // If we're on a supported network, don't show the switcher
  if (currentChainId && Object.keys(SUPPORTED_NETWORKS).includes(currentChainId.toString())) {
    return null;
  }

  const handleSwitchToNetwork = async (chainId: number) => {
    try {
      await switchNetwork(chainId);
      if (onSwitchNetwork) {
        onSwitchNetwork(chainId);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const currentNetworkName = currentChainId 
    ? `Unknown Network (${currentChainId})`
    : 'No network detected';

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Network Not Supported</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          You're currently connected to: <strong>{currentNetworkName}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This application requires connection to a supported network. Please switch to one of the following:
        </Typography>
        
        <Stack direction="column" spacing={1}>
          {Object.entries(SUPPORTED_NETWORKS).map(([chainId, networkName]) => (
            <Box key={chainId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {networkName} (Chain ID: {chainId})
              </Typography>
              {(chainId === '1' || chainId === '1337') && (
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => handleSwitchToNetwork(parseInt(chainId))}
                  sx={{ ml: 2 }}
                >
                  Switch to {networkName}
                </Button>
              )}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Manual Setup for Localhost Network:
          </Typography>
          <Typography variant="body2" component="div">
            If the automatic switch doesn't work, please manually add this network to MetaMask:
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><strong>Network Name:</strong> Localhost 8545</li>
              <li><strong>New RPC URL:</strong> http://localhost:8545</li>
              <li><strong>Chain ID:</strong> 1</li>
              <li><strong>Currency Symbol:</strong> ETH</li>
            </ul>
          </Typography>
        </Box>
      </Alert>
    </Box>
  );
};

export default NetworkSwitcher;