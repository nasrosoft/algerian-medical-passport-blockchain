// Contract ABIs for frontend interaction
// These ABIs are extracted from the compiled contracts

export const IDENTITY_MANAGEMENT_ABI = [
  // Constructor
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  // Functions
  {
    inputs: [
      { internalType: "address", name: "_walletAddress", type: "address" },
      { internalType: "uint8", name: "_entityType", type: "uint8" },
      { internalType: "string", name: "_encryptedPersonalData", type: "string" },
      { internalType: "string", name: "_publicKey", type: "string" }
    ],
    name: "registerMedicalID",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_medicalId", type: "uint256" }],
    name: "verifyIdentity",
    outputs: [
      { internalType: "bool", name: "isValid", type: "bool" },
      { internalType: "uint8", name: "entityType", type: "uint8" },
      { internalType: "address", name: "walletAddress", type: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_address", type: "address" }],
    name: "getMedicalIdByAddress",
    outputs: [{ internalType: "uint256", name: "medicalId", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalRegisteredIdentities",
    outputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "medicalId", type: "uint256" },
      { indexed: true, internalType: "address", name: "walletAddress", type: "address" },
      { indexed: false, internalType: "uint8", name: "entityType", type: "uint8" },
      { indexed: true, internalType: "address", name: "registeredBy", type: "address" }
    ],
    name: "IdentityRegistered",
    type: "event"
  }
];

export const MEDICAL_RECORDS_ABI = [
  // Constructor
  {
    inputs: [{ internalType: "address", name: "_identityContractAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  // Functions
  {
    inputs: [
      { internalType: "uint256", name: "_patientMedicalId", type: "uint256" },
      { internalType: "uint8", name: "_recordType", type: "uint8" },
      { internalType: "string", name: "_encryptedData", type: "string" },
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_summary", type: "string" }
    ],
    name: "createRecord",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_recordId", type: "uint256" }],
    name: "getRecord",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "recordId", type: "uint256" },
          { internalType: "uint256", name: "patientMedicalId", type: "uint256" },
          { internalType: "uint256", name: "doctorMedicalId", type: "uint256" },
          { internalType: "uint8", name: "recordType", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "string", name: "encryptedData", type: "string" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "summary", type: "string" },
          { internalType: "uint256", name: "createdDate", type: "uint256" },
          { internalType: "uint256", name: "lastUpdatedDate", type: "uint256" },
          { internalType: "address", name: "createdBy", type: "address" },
          { internalType: "address", name: "lastUpdatedBy", type: "address" }
        ],
        internalType: "struct MedicalRecords.MedicalRecord",
        name: "record",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_patientMedicalId", type: "uint256" }],
    name: "getPatientHistory",
    outputs: [{ internalType: "uint256[]", name: "recordIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalRecords",
    outputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "recordId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "patientMedicalId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "doctorMedicalId", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "recordType", type: "uint8" },
      { indexed: false, internalType: "address", name: "createdBy", type: "address" }
    ],
    name: "RecordCreated",
    type: "event"
  }
];

export const PRESCRIPTION_MANAGEMENT_ABI = [
  // Constructor
  {
    inputs: [{ internalType: "address", name: "_identityContractAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  // Functions
  {
    inputs: [
      { internalType: "uint256", name: "_patientMedicalId", type: "uint256" },
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "dosage", type: "string" },
          { internalType: "string", name: "frequency", type: "string" },
          { internalType: "uint256", name: "quantity", type: "uint256" },
          { internalType: "uint256", name: "quantityDispensed", type: "uint256" },
          { internalType: "string", name: "instructions", type: "string" },
          { internalType: "string", name: "genericAlternatives", type: "string" }
        ],
        internalType: "struct PrescriptionManagement.Medication[]",
        name: "_medications",
        type: "tuple[]"
      },
      { internalType: "string", name: "_diagnosis", type: "string" },
      { internalType: "string", name: "_additionalInstructions", type: "string" },
      { internalType: "uint256", name: "_expiryDate", type: "uint256" },
      { internalType: "uint8", name: "_urgency", type: "uint8" },
      { internalType: "bool", name: "_allowGenericSubstitution", type: "bool" },
      { internalType: "uint256", name: "_maxRefills", type: "uint256" }
    ],
    name: "issuePrescription",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_prescriptionId", type: "uint256" }],
    name: "verifyPrescription",
    outputs: [
      { internalType: "bool", name: "isValid", type: "bool" },
      {
        components: [
          { internalType: "uint256", name: "prescriptionId", type: "uint256" },
          { internalType: "uint256", name: "patientMedicalId", type: "uint256" },
          { internalType: "uint256", name: "doctorMedicalId", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint8", name: "urgency", type: "uint8" },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "dosage", type: "string" },
              { internalType: "string", name: "frequency", type: "string" },
              { internalType: "uint256", name: "quantity", type: "uint256" },
              { internalType: "uint256", name: "quantityDispensed", type: "uint256" },
              { internalType: "string", name: "instructions", type: "string" },
              { internalType: "string", name: "genericAlternatives", type: "string" }
            ],
            internalType: "struct PrescriptionManagement.Medication[]",
            name: "medications",
            type: "tuple[]"
          },
          { internalType: "string", name: "diagnosis", type: "string" },
          { internalType: "string", name: "additionalInstructions", type: "string" },
          { internalType: "uint256", name: "issuedDate", type: "uint256" },
          { internalType: "uint256", name: "expiryDate", type: "uint256" },
          { internalType: "uint256", name: "lastDispensedDate", type: "uint256" },
          { internalType: "address", name: "issuedBy", type: "address" },
          { internalType: "bool", name: "allowGenericSubstitution", type: "bool" },
          { internalType: "uint256", name: "maxRefills", type: "uint256" },
          { internalType: "uint256", name: "refillsUsed", type: "uint256" }
        ],
        internalType: "struct PrescriptionManagement.Prescription",
        name: "prescription",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_patientMedicalId", type: "uint256" }],
    name: "getPatientPrescriptions",
    outputs: [{ internalType: "uint256[]", name: "prescriptionIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalPrescriptions",
    outputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "prescriptionId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "patientMedicalId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "doctorMedicalId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "expiryDate", type: "uint256" },
      { indexed: false, internalType: "address", name: "issuedBy", type: "address" }
    ],
    name: "PrescriptionIssued",
    type: "event"
  }
];

// Export all ABIs as a single object for easy access
export const CONTRACT_ABIS = {
  IdentityManagement: IDENTITY_MANAGEMENT_ABI,
  MedicalRecords: MEDICAL_RECORDS_ABI,
  PrescriptionManagement: PRESCRIPTION_MANAGEMENT_ABI,
} as const;