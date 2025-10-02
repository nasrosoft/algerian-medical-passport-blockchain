// Contract addresses for different networks
export interface ContractAddresses {
  IdentityManagement: string;
  MedicalRecords: string;
  PrescriptionManagement: string;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Ethereum Localhost (chain ID 1)
  1: {
    IdentityManagement: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MedicalRecords: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    PrescriptionManagement: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Local Hardhat Network (chain ID 1337)
  1337: {
    IdentityManagement: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MedicalRecords: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    PrescriptionManagement: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Local Hardhat Network (alternative chain ID 31337)
  31337: {
    IdentityManagement: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MedicalRecords: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    PrescriptionManagement: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Polygon Mumbai Testnet (placeholder - update when deployed)
  80001: {
    IdentityManagement: "",
    MedicalRecords: "",
    PrescriptionManagement: "",
  },
  // Polygon Mainnet (placeholder - update when deployed)
  137: {
    IdentityManagement: "",
    MedicalRecords: "",
    PrescriptionManagement: "",
  },
};

export const SUPPORTED_NETWORKS = {
  1: 'Localhost (Port 8545)',
  1337: 'Localhost',
  31337: 'Localhost (Hardhat)',
  80001: 'Polygon Mumbai',
  137: 'Polygon Mainnet',
} as const;

// Utility function to get contract addresses for current network
export const getContractAddresses = (chainId: number): ContractAddresses | null => {
  return CONTRACT_ADDRESSES[chainId] || null;
};

// Utility function to check if network is supported
export const isSupportedNetwork = (chainId: number): boolean => {
  return chainId in SUPPORTED_NETWORKS;
};

// Utility function to get network name
export const getNetworkName = (chainId: number): string => {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS] || `Unknown (${chainId})`;
};