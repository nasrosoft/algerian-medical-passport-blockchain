import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { UseWeb3Return, Web3State } from '../types';
import { SUPPORTED_NETWORKS } from '../config';

export const useWeb3 = (): UseWeb3Return => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    chainId: null,
    library: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is already connected
  const checkConnection = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          
          setWeb3State({
            account: accounts[0],
            chainId: network.chainId,
            library: provider,
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setWeb3State(prev => ({
          ...prev,
          error: 'Failed to check wallet connection',
          isConnecting: false,
        }));
      }
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setWeb3State(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to use this application.',
      }));
      return;
    }

    setWeb3State(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if we're on a supported network
      const chainId = network.chainId;
      const supportedChainIds = Object.keys(SUPPORTED_NETWORKS).map(id => parseInt(id));
      
      console.log('Current network:', {
        chainId,
        networkName: network.name,
        supportedNetworks: SUPPORTED_NETWORKS,
        supportedChainIds
      });
      
      if (!supportedChainIds.includes(chainId)) {
        const supportedNetworksList = Object.entries(SUPPORTED_NETWORKS)
          .map(([id, name]) => `${name} (${id})`)
          .join(', ');
        throw new Error(`Unsupported network. Current: ${network.name} (${chainId}). Supported networks: ${supportedNetworksList}`);
      }

      setWeb3State({
        account: accounts[0],
        chainId: network.chainId,
        library: provider,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      setWeb3State(prev => ({
        ...prev,
        error: error.message || 'Failed to connect to wallet',
        isConnecting: false,
      }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWeb3State({
      account: null,
      chainId: null,
      library: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network hasn't been added to MetaMask
      if (error.code === 4902) {
        await addNetwork(targetChainId);
      } else {
        throw error;
      }
    }
  }, []);

  // Add network to MetaMask
  const addNetwork = async (chainId: number) => {
    const networkConfigs = {
      1: {
        chainId: '0x1',
        chainName: 'Localhost 8545',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: null,
      },
      1337: {
        chainId: '0x539',
        chainName: 'Localhost 8545',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: null,
      },
      31337: {
        chainId: '0x7a69',
        chainName: 'Localhost 8545 (Hardhat)',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: null,
      },
      80001: {
        chainId: '0x13881',
        chainName: 'Polygon Mumbai Testnet',
        rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com/'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://polygonscan.com/'],
      },
    };

    const config = networkConfigs[chainId as keyof typeof networkConfigs];
    if (!config) {
      throw new Error(`Network configuration not found for chain ID ${chainId}`);
    }

    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    });
  };

  // Set up event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWeb3State(prev => ({
          ...prev,
          account: accounts[0],
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      setWeb3State(prev => ({
        ...prev,
        chainId: numericChainId,
      }));
      // Reload the page to reset any state dependent on the network
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Check for existing connection
    checkConnection();

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [checkConnection, disconnect]);

  return {
    ...web3State,
    connect,
    disconnect,
    switchNetwork,
  };
};

// Utility function to format address
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Global type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}