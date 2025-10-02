// Main configuration exports
export * from './contracts';
export * from './abis';

// Re-export commonly used items
export { 
  CONTRACT_ADDRESSES, 
  getContractAddresses, 
  isSupportedNetwork, 
  getNetworkName 
} from './contracts';

export { 
  CONTRACT_ABIS, 
  IDENTITY_MANAGEMENT_ABI, 
  MEDICAL_RECORDS_ABI, 
  PRESCRIPTION_MANAGEMENT_ABI 
} from './abis';