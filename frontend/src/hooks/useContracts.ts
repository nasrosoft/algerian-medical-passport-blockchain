import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { 
  getContractAddresses, 
  CONTRACT_ABIS, 
  type ContractAddresses 
} from '../config';

export interface ContractInstances {
  identityManagement: ethers.Contract | null;
  medicalRecords: ethers.Contract | null;
  prescriptionManagement: ethers.Contract | null;
}

export const useContracts = (): ContractInstances => {
  const { library, chainId, isConnected } = useWeb3();

  const contracts = useMemo(() => {
    if (!library || !chainId || !isConnected) {
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }

    const addresses = getContractAddresses(chainId);
    if (!addresses) {
      console.warn(`No contract addresses found for chain ID: ${chainId}`);
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }

    const signer = library.getSigner();

    try {
      return {
        identityManagement: addresses.IdentityManagement 
          ? new ethers.Contract(addresses.IdentityManagement, CONTRACT_ABIS.IdentityManagement, signer)
          : null,
        medicalRecords: addresses.MedicalRecords
          ? new ethers.Contract(addresses.MedicalRecords, CONTRACT_ABIS.MedicalRecords, signer)
          : null,
        prescriptionManagement: addresses.PrescriptionManagement
          ? new ethers.Contract(addresses.PrescriptionManagement, CONTRACT_ABIS.PrescriptionManagement, signer)
          : null,
      };
    } catch (error) {
      console.error('Error creating contract instances:', error);
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }
  }, [library, chainId, isConnected]);

  return contracts;
};

// Hook for getting read-only contract instances (using provider instead of signer)
export const useReadOnlyContracts = (): ContractInstances => {
  const { library, chainId } = useWeb3();

  const contracts = useMemo(() => {
    if (!library || !chainId) {
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }

    const addresses = getContractAddresses(chainId);
    if (!addresses) {
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }

    try {
      return {
        identityManagement: addresses.IdentityManagement 
          ? new ethers.Contract(addresses.IdentityManagement, CONTRACT_ABIS.IdentityManagement, library)
          : null,
        medicalRecords: addresses.MedicalRecords
          ? new ethers.Contract(addresses.MedicalRecords, CONTRACT_ABIS.MedicalRecords, library)
          : null,
        prescriptionManagement: addresses.PrescriptionManagement
          ? new ethers.Contract(addresses.PrescriptionManagement, CONTRACT_ABIS.PrescriptionManagement, library)
          : null,
      };
    } catch (error) {
      console.error('Error creating read-only contract instances:', error);
      return {
        identityManagement: null,
        medicalRecords: null,
        prescriptionManagement: null,
      };
    }
  }, [library, chainId]);

  return contracts;
};

// Helper hook to get contract addresses for current network
export const useContractAddresses = (): ContractAddresses | null => {
  const { chainId } = useWeb3();
  
  return useMemo(() => {
    if (!chainId) return null;
    return getContractAddresses(chainId);
  }, [chainId]);
};