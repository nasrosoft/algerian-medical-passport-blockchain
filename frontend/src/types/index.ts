// Blockchain and Web3 Types
export interface Web3State {
  account: string | null;
  chainId: number | null;
  library: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface ContractAddresses {
  IdentityManagement: string;
  MedicalRecords: string;
  PrescriptionManagement: string;
}

// Entity Types from Smart Contract (matching enhanced Hyperledger Fabric integration)
export enum EntityType {
  Government = 0, // MinistryMSP equivalent
  Hospital = 1,   // HospitalMSP equivalent
  Clinic = 2,     // ClinicMSP equivalent
  Pharmacy = 3,   // PharmacyMSP equivalent
  Doctor = 4,     // Individual doctors
  Patient = 5,    // Individual patients
}

export enum IdentityStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
  Revoked = 3,
}

export enum RecordType {
  Consultation = 0,
  Diagnosis = 1,
  Treatment = 2,
  Laboratory = 3,
  Imaging = 4,
  Surgery = 5,
  Prescription = 6,
  Vaccination = 7,
  Emergency = 8,
}

export enum RecordStatus {
  Active = 0,
  Updated = 1,
  Deleted = 2,
}

export enum PrescriptionStatus {
  Active = 0,
  PartiallyDispensed = 1,
  Dispensed = 2,
  Expired = 3,
  Cancelled = 4,
}

export enum Urgency {
  Normal = 0,
  Urgent = 1,
  Critical = 2,
}

// Core Data Types
export interface MedicalIdentity {
  medicalId: number;
  walletAddress: string;
  entityType: EntityType;
  status: IdentityStatus;
  encryptedPersonalData: string;
  publicKey: string;
  registrationDate: number;
  lastUpdateDate: number;
  registeredBy: string;
}

export interface ProviderCredentials {
  licenseNumber: string;
  specialization: string;
  facilityId: string; // For doctors: which hospital/clinic they work at
  licenseExpiryDate: number;
  isVerified: boolean;
  verifiedBy: string;
  additionalCertifications: string; // Additional certifications or accreditations
}

// Patient Passport types (from Hyperledger Fabric integration)
export interface ProfilePicture {
  uri: string;        // IPFS URI: ipfs://Qm...
  sha256: string;     // Hash of the image file
  encryption: string; // Encryption method: AES-256-GCM
}

export interface PatientPassport {
  patientId: string;        // DZ-213-XXXXXX format
  firstName: string;        // Latin first name
  lastName: string;         // Latin last name
  firstNameAr: string;      // Arabic first name (نسيم)
  lastNameAr: string;       // Arabic last name (بن يحيى)
  birthDate: string;        // ISO-8601 format: 1994-07-18
  bloodType: string;        // O+, A+, B+, AB+, O-, A-, B-, AB-
  profilePic: ProfilePicture;
  status: IdentityStatus;
  createdAt: number;
  createdBy: string;
}

export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export interface MedicalRecord {
  recordId: number;
  patientMedicalId: number;
  doctorMedicalId: number;
  recordType: RecordType;
  status: RecordStatus;
  encryptedData: string;
  title: string;
  summary: string;
  createdDate: number;
  lastUpdatedDate: number;
  createdBy: string;
  lastUpdatedBy: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  quantity: number;
  quantityDispensed: number;
  instructions: string;
  genericAlternatives: string;
}

export interface Prescription {
  prescriptionId: number;
  patientMedicalId: number;
  doctorMedicalId: number;
  status: PrescriptionStatus;
  urgency: Urgency;
  medications: Medication[];
  diagnosis: string;
  additionalInstructions: string;
  issuedDate: number;
  expiryDate: number;
  lastDispensedDate: number;
  issuedBy: string;
  allowGenericSubstitution: boolean;
  maxRefills: number;
  refillsUsed: number;
}

export interface DispensingRecord {
  prescriptionId: number;
  pharmacyMedicalId: number;
  medicationIndex: number;
  quantityDispensed: number;
  actualMedication: string;
  dispensedDate: number;
  dispensedBy: string;
  pharmacistNotes: string;
}

export interface AccessPermission {
  hasAccess: boolean;
  grantedDate: number;
  expiryDate: number;
  grantedBy: string;
}

// Frontend-specific Types
export interface User {
  medicalId?: number;
  walletAddress: string;
  entityType: EntityType;
  personalInfo?: PersonalInfo;
  credentials?: ProviderCredentials;
  isRegistered: boolean;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// Form Types
export interface RegistrationFormData {
  walletAddress: string;
  entityType: EntityType;
  firstName: string;
  lastName: string;
  // Patient Passport specific fields
  firstNameAr?: string;      // Arabic first name (for patients)
  lastNameAr?: string;       // Arabic last name (for patients)
  patientId?: string;        // DZ-213-XXXXXX format (for patients)
  bloodType?: BloodType;     // Blood type (for patients)
  profilePicture?: File;     // Profile picture file upload
  // Standard fields
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  // Provider fields
  licenseNumber?: string;
  specialization?: string;
  facilityId?: string;       // For doctors: which hospital/clinic
  licenseExpiryDate?: string;
  additionalCertifications?: string;
}

export interface MedicalRecordFormData {
  patientMedicalId: number;
  recordType: RecordType;
  title: string;
  summary: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments?: File[];
}

export interface PrescriptionFormData {
  patientMedicalId: number;
  diagnosis: string;
  medications: MedicationFormData[];
  additionalInstructions: string;
  expiryDays: number;
  urgency: Urgency;
  allowGenericSubstitution: boolean;
  maxRefills: number;
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  quantity: number;
  instructions: string;
  genericAlternatives?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Store Types
export interface RootState {
  web3: Web3State;
  user: UserState;
  medical: MedicalState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface MedicalState {
  records: MedicalRecord[];
  prescriptions: Prescription[];
  accessPermissions: { [key: string]: AccessPermission };
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: { [key: string]: boolean };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Component Props Types
export interface DashboardProps {
  userType: EntityType;
}

export interface DataGridProps {
  rows: any[];
  columns: any[];
  loading?: boolean;
  onRowClick?: (params: any) => void;
}

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  initialData?: any;
}

// Hook Types
export interface UseWeb3Return extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface UseContractReturn {
  contract: any;
  loading: boolean;
  error: string | null;
}

// Utility Types
export interface IPFSFile {
  cid: string;
  size: number;
  type: string;
  name: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  authTag: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  roles: EntityType[];
  children?: NavItem[];
}

// Chart and Analytics Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface AnalyticsData {
  totalPatients: number;
  totalRecords: number;
  totalPrescriptions: number;
  activeProviders: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'record' | 'prescription' | 'access' | 'registration';
  description: string;
  timestamp: number;
  userType: EntityType;
  userId: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  entityType?: EntityType;
  status?: IdentityStatus | RecordStatus | PrescriptionStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  recordType?: RecordType;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Export commonly used type unions
export type StatusType = IdentityStatus | RecordStatus | PrescriptionStatus;
export type FormDataType = RegistrationFormData | MedicalRecordFormData | PrescriptionFormData;
export type EntityDataType = MedicalIdentity | MedicalRecord | Prescription;