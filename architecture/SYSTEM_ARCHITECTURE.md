# System Architecture - Algerian Medical Passport Blockchain

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          Algerian Medical Passport Blockchain                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐   │
│  │ Government  │  │   Doctors   │         │  Hospitals  │         │   Clinics   │   │
│  │   Portal    │  │   Portal    │         │   Portal    │         │   Portal    │   │
│  └──────┬──────┘  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘   │
│         │                │                       │                       │          │
│         │       ┌───────────────┐         ┌─────────────┐                │          │
│         │       │   Pharmacies  │         │  Patients   │                │          │
│         │       │     Portal    │         │   Portal    │                │          │
│         │       └────────┬──────┘         └──────┬──────┘                │          │
│         │                │                       │                       │          │
│         └────────────────┼───────────────────────┼───────────────────────┘          │
│                          │                       │                                  │
│  ┌───────────────────────┴───────────────────────┴──────────────────────────────┐   │
│  │                       │        Web3 Layer     │                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                Smart Contracts Layer                                    │ │   │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │ │   │
│  │  │  │   Identity   │ │   Medical    │ │ Prescription │ │   Access     │    │ │   │
│  │  │  │  Management  │ │   Records    │ │  Management  │ │   Control    │    │ │   │
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │ │   │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                    │                                         │   │
│  │  ┌─────────────────────────────────┴─────────────────────────────────────┐   │   │
│  │  │                      Blockchain Network                               │   │   │
│  │  │                      (Ethereum/Polygon)                               │   │   │
│  │  └───────────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         Off-Chain Storage                                   │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │    │
│  │  │     IPFS     │ │  Traditional │ │   Encrypted  │ │   Backup     │        │    │
│  │  │   Storage    │ │   Database   │ │   Storage    │ │   Systems    │        │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Stakeholders & Roles

### 2.1 Government

- **Primary Role**: Identity verification and system regulation
- **Permissions**:
  - Issue medical IDs
  - Verify healthcare provider credentials
  - Access aggregated health statistics (anonymized)
  - Manage system-wide policies

### 2.2 Doctors

- **Primary Role**: Medical diagnosis and treatment
- **Permissions**:
  - Create medical records (with patient consent)
  - Issue prescriptions
  - Access patient history (with consent)
  - Update treatment plans

### 2.3 Pharmacies

- **Primary Role**: Medication dispensing
- **Permissions**:
  - Verify prescriptions
  - Dispense medications
  - Update prescription status
  - Access prescription history

### 2.4 Hospitals

- **Primary Role**: Comprehensive medical care and patient management
- **Permissions**:
  - Access patient records during admission
  - Create and update inpatient medical records
  - Manage multiple doctor consultations
  - Coordinate treatment across departments
  - Issue discharge summaries
  - Emergency access for critical patients

### 2.5 Clinics

- **Primary Role**: Outpatient care and specialized services
- **Permissions**:
  - Schedule and manage appointments
  - Access relevant patient history
  - Create outpatient medical records
  - Coordinate with primary care doctors
  - Manage specialized treatment records
  - Refer patients to hospitals when needed

### 2.6 Patients

- **Primary Role**: Data ownership and access control
- **Permissions**:
  - Control access to personal data
  - View complete medical history
  - Grant/revoke permissions
  - Emergency access controls
  - Choose preferred healthcare providers
  - Manage appointment scheduling

## 3. Smart Contract Architecture

### 3.1 IdentityManagement Contract

```solidity
// Core functions:
- registerMedicalID()
- verifyIdentity()
- updateCredentials()
- revokeAccess()
```

### 3.2 MedicalRecords Contract

```solidity
// Core functions:
- createRecord()
- updateRecord()
- getPatientHistory()
- grantAccess()
- revokeAccess()
```

### 3.3 PrescriptionManagement Contract

```solidity
// Core functions:
- issuePrescription()
- verifyPrescription()
- dispenseMedication()
- updatePrescriptionStatus()
```

### 3.4 AccessControl Contract

```solidity
// Core functions:
- setPermissions()
- checkPermissions()
- emergencyAccess()
- auditTrail()
```

## 4. Data Flow Architecture

### 4.1 Patient Registration Flow

1. Patient visits government office
2. Identity verification (physical documents)
3. Medical ID creation on blockchain
4. Private key generation and secure delivery
5. Patient profile activation

### 4.2 Medical Consultation Flow

1. Patient grants access to doctor
2. Doctor reviews patient history
3. Doctor creates new medical record
4. Record encrypted and stored on IPFS
5. Record hash stored on blockchain
6. Patient notified of new record

### 4.3 Prescription Flow

1. Doctor issues prescription (during consultation)
2. Prescription details stored on blockchain
3. Patient receives prescription notification
4. Patient visits pharmacy
5. Pharmacy verifies prescription on blockchain
6. Medication dispensed
7. Prescription marked as fulfilled

### 4.4 Hospital Admission Flow

1. Patient grants hospital access during admission
2. Hospital staff accesses patient's medical history
3. Multiple doctors can collaborate on treatment
4. All treatments and procedures recorded on blockchain
5. Discharge summary created and stored
6. Patient's medical records updated with hospital stay
7. Follow-up care instructions shared with primary doctor

### 4.5 Clinic Appointment Flow

1. Patient schedules appointment through clinic portal
2. Patient grants temporary access for consultation
3. Clinic accesses relevant medical history
4. Specialized treatment or consultation performed
5. Treatment records created and stored
6. Referrals to hospitals/other specialists if needed
7. Follow-up appointments scheduled if required

## 5. Security Architecture

### 5.1 Multi-Layer Security

- **Identity Layer**: Government-verified digital identities
- **Access Layer**: Role-based permissions with patient control
- **Data Layer**: Encryption at rest and in transit
- **Network Layer**: Blockchain immutability and consensus
- **Application Layer**: Multi-signature requirements for critical operations

### 5.2 Privacy Protection

- **Zero-Knowledge Proofs**: Verify credentials without revealing data
- **Selective Disclosure**: Patients choose what data to share
- **Encryption**: All sensitive data encrypted before storage
- **Anonymization**: Statistical data aggregated without personal identifiers

## 6. Technology Stack Details

### 6.1 Blockchain Layer

- **Network**: Polygon (for lower gas fees and faster transactions)
- **Consensus**: Proof of Stake
- **Smart Contracts**: Solidity 0.8.x
- **Development Framework**: Hardhat

### 6.2 Storage Layer

- **On-Chain**: Transaction records, access permissions, hashes
- **IPFS**: Encrypted medical documents and images
- **Traditional DB**: Application metadata and caching

### 6.3 Application Layer

- **Frontend**: React.js with Web3 integration
- **Backend**: Node.js/Express API
- **Authentication**: MetaMask/WalletConnect
- **Communication**: WebSockets for real-time updates

## 7. Deployment Architecture

### 7.1 Development Environment

- Local blockchain (Hardhat Network)
- Local IPFS node
- Development database

### 7.2 Testing Environment

- Polygon Mumbai testnet
- Shared IPFS cluster
- Testing database

### 7.3 Production Environment

- Polygon Mainnet
- Distributed IPFS network
- High-availability database cluster

## 8. Compliance & Regulations

### 8.1 Data Protection

- GDPR compliance for data handling
- Right to be forgotten (off-chain data deletion)
- Consent management

### 8.2 Medical Regulations

- Algerian healthcare regulations compliance
- Medical data confidentiality
- Prescription drug tracking

### 8.3 Blockchain Regulations

- Cryptocurrency regulations in Algeria
- Smart contract legal framework
- Cross-border data transfer rules

## 9. Scalability Considerations

### 9.1 Layer 2 Solutions

- Polygon for reduced gas costs
- State channels for frequent interactions
- Sidechains for specific use cases

### 9.2 Off-Chain Scaling

- IPFS for large file storage
- Database caching for frequent queries
- API rate limiting and optimization

### 9.3 Performance Metrics

- Target: <2 second transaction confirmation
- Throughput: 1000+ transactions per second
- Storage: Unlimited off-chain capacity

## 10. Future Enhancements

### 10.1 Phase 2 Features

- AI-powered health insights
- Telemedicine integration
- Insurance claim automation

### 10.2 Phase 3 Features

- Cross-border medical records
- Research data marketplace
- Personalized medicine recommendations
