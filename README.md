# 🏛️ Algerian Medical Passport Blockchain System

<div align="center">
  <img src="frontend/public/healty1.png" alt="Algerian Medical Passport Logo" width="120" height="120">
  <h3>Revolutionizing Healthcare Through Blockchain Technology</h3>
  <p>A comprehensive, secure, and patient-controlled medical data management system for Algeria</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-16%2B-brightgreen)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0%2B-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)

</div>

---

## 🌟 Overview

The **Algerian Medical Passport** is a revolutionary blockchain-based healthcare ecosystem that provides secure, transparent, and patient-controlled medical data management. Built on cutting-edge Web3 technologies, it serves as the first comprehensive medical passport system in Algeria and the MENA region.

### ✨ Key Highlights

- 🔐 **Patient-Controlled Data**: Complete data sovereignty for patients
- 🏛️ **Government Verified**: Official medical ID issuance and regulation
- 🏢 **Multi-Stakeholder**: Serves all healthcare ecosystem participants
- 📱 **Mobile-First**: Responsive design for all devices
- 🌐 **Multi-Network**: Supports Polygon, Ethereum, and local networks
- 🔒 **Enterprise Security**: Military-grade encryption and security
- ⚡ **Real-Time**: Instant verification and updates
- 🌍 **Interoperable**: Cross-platform medical record sharing

## 🏗️ System Architecture

The system serves **six main stakeholders** in a comprehensive healthcare ecosystem:

| Stakeholder       | Role                                   | Key Capabilities                                                   |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------ |
| 🏛️ **Government** | Identity verification & regulation     | Medical ID issuance, system oversight, policy enforcement          |
| 👨‍⚕️ **Doctors**    | Medical diagnosis & prescription       | Patient record access, medical record creation, prescriptions      |
| 🏢 **Hospitals**  | Institutional care coordination        | Patient admissions, department coordination, treatment tracking    |
| 🏬 **Clinics**    | Outpatient & specialized care          | Consultation records, specialized treatments, care coordination    |
| 💊 **Pharmacies** | Prescription verification & dispensing | Real-time verification, fraud prevention, dispensing history       |
| 🧑‍🤝‍🧑 **Patients**   | Data ownership & access control        | Permission management, medical history access, emergency protocols |

## 🔧 Technology Stack

### Blockchain & Smart Contracts

- **Blockchain Networks**: Polygon, Ethereum, Hardhat Local
- **Smart Contracts**: Solidity 0.8.19
- **Development Framework**: Hardhat
- **Web3 Library**: Ethers.js v5
- **Wallet Integration**: MetaMask

### Frontend

- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks + Context
- **Form Handling**: Formik with Yup validation
- **Styling**: Responsive CSS with Mobile-First approach

### Backend

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (optional), IPFS for documents
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston

### Development & Deployment

- **Package Manager**: npm
- **Testing**: Hardhat tests, Jest
- **Linting**: ESLint, Prettier
- **Version Control**: Git
- **CI/CD Ready**: GitHub Actions compatible

## 📁 Project Structure

```
algerian-medical-passport-blockchain/
├── 📄 contracts/                    # Smart contracts (Solidity)
│   ├── IdentityManagement.sol      # Medical ID issuance & verification
│   ├── MedicalRecords.sol          # Medical record storage & access
│   ├── PrescriptionManagement.sol  # Prescription lifecycle
│   └── AccessControl.sol           # Permission management
│
├── 📱 frontend/                     # React + TypeScript application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── config/                 # Configuration files
│   │   └── types/                  # TypeScript definitions
│   └── public/
│       └── healty1.png             # Custom logo
│
├── ⚙️ backend/                      # Node.js API server
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Authentication & validation
│   │   ├── routes/                 # API routes
│   │   └── services/               # Business logic
│   └── tests/                      # Backend tests
│
├── 📋 scripts/                     # Deployment & utility scripts
│   ├── deploy.js                   # Contract deployment
│   └── setupDemo.js                # Demo data setup
│
├── 🧪 test/                        # Smart contract tests
├── 📆 demo/                        # Demo & presentation files
│   ├── EXECUTIVE_PRESENTATION.html # Executive presentation
│   └── DEMO_WALKTHROUGH.html       # Interactive demo guide
│
├── 📝 docs/                        # Documentation
│   └── SYSTEM_ARCHITECTURE.md      # Comprehensive system docs
│
├── 🏠 .env.example                 # Environment variables template
├── ⚙️ hardhat.config.js             # Hardhat configuration
├── 📦 package.json                 # Main package configuration
└── 📋 README.md                   # You are here!
```

## 🚀 Quick Start

### 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 16.0.0) - [Download here](https://nodejs.org/)
- **npm** (>= 8.0.0) - Comes with Node.js
- **MetaMask** browser extension - [Install here](https://metamask.io/)
- **Git** - [Download here](https://git-scm.com/)

### 1. 📋 Clone Repository

```bash
# Clone the repository
git clone https://github.com/nasrosoft/algerian-medical-passport-blockchain.git

# Navigate to project directory
cd algerian-medical-passport-blockchain

# Install dependencies for all packages
npm install
```

### 2. ⚙️ Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration (optional for local development)
# nano .env
```

### 3. 🔗 Deploy Smart Contracts (Local Development)

```bash
# Terminal 1: Start local Hardhat blockchain
npm run node

# Terminal 2: Deploy contracts to local network
npm run deploy:local

# Set up demo data with sample users and records
npx hardhat run scripts/setupDemo.js --network localhost
```

### 4. 🚀 Start Development Servers

```bash
# Option 1: Start all services simultaneously
npm run dev

# Option 2: Start services individually
# Frontend (Terminal 1)
cd frontend && npm start

# Backend (Terminal 2)
cd backend && npm run dev
```

### 5. 🌐 Access the Application

| Service             | URL                                                                  | Description                |
| ------------------- | -------------------------------------------------------------------- | -------------------------- |
| 📱 **Frontend**     | http://localhost:3000                                                | Main application interface |
| ⚙️ **Backend API**  | http://localhost:8000                                                | RESTful API server         |
| ❤️ **Health Check** | http://localhost:8000/health                                         | API health status          |
| 📆 **Demo Guide**   | [demo/DEMO_WALKTHROUGH.html](demo/DEMO_WALKTHROUGH.html)             | Interactive walkthrough    |
| 📊 **Presentation** | [demo/EXECUTIVE_PRESENTATION.html](demo/EXECUTIVE_PRESENTATION.html) | Executive presentation     |

## 🌐 Network Configuration

### Supported Blockchain Networks

| Network                  | Chain ID | Status     | Purpose           | RPC URL                            |
| ------------------------ | -------- | ---------- | ----------------- | ---------------------------------- |
| 🏠 **Localhost**         | 1        | ✅ Active  | Local Development | http://localhost:8545              |
| 🏠 **Localhost**         | 1337     | ✅ Active  | Hardhat Local     | http://localhost:8545              |
| 🔨 **Localhost Hardhat** | 31337    | ✅ Active  | Hardhat Network   | http://localhost:8545              |
| 🟣 **Polygon Mumbai**    | 80001    | ✅ Ready   | Testnet           | https://rpc-mumbai.maticvigil.com/ |
| 🟣 **Polygon Mainnet**   | 137      | 🚧 Planned | Production        | https://polygon-rpc.com/           |

### MetaMask Network Setup

The application automatically detects your network and provides guidance for setup. For manual configuration:

**Localhost Network:**

- **Network Name:** Localhost 8545
- **New RPC URL:** http://localhost:8545
- **Chain ID:** 1 (or 1337)
- **Currency Symbol:** ETH

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all smart contract tests
npm test

# Run tests with coverage report
npm run coverage

# Run specific test file
npx hardhat test test/IdentityManagement.test.js

# Run tests with gas reporting
npm test -- --gas
```

### Frontend & Backend Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests (if available)
npm run test:e2e
```

## 🌐 Testnet Deployment

### Deploy to Polygon Mumbai

```bash
# Set up environment variables for testnet
export PRIVATE_KEY="your_private_key"
export POLYGON_MUMBAI_URL="your_rpc_url"

# Deploy to testnet
npm run deploy:testnet

# Verify contracts
npm run verify
```

### Get Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Enter your wallet address
3. Request testnet MATIC tokens

## 🎭 Demo Users & Testing Scenarios

After running the demo setup script, you'll have the following test accounts:

### 💼 Wallet Addresses (Local Development)

| Role              | Account | Address               | Private Key Available |
| ----------------- | ------- | --------------------- | --------------------- |
| 🏛️ **Government** | #0      | Deployer account      | ✅ In Hardhat         |
| 👨‍⚕️ **Doctor 1**   | #1      | Cardiology specialist | ✅ In Hardhat         |
| 👨‍⚕️ **Doctor 2**   | #2      | General practitioner  | ✅ In Hardhat         |
| 🏢 **Hospital**   | #7      | City General Hospital | ✅ In Hardhat         |
| 🏬 **Clinic**     | #8      | Specialized clinic    | ✅ In Hardhat         |
| 💊 **Pharmacy**   | #3      | Neighborhood pharmacy | ✅ In Hardhat         |
| 🧑‍🤝‍🧑 **Patient 1**  | #4      | Adult patient         | ✅ In Hardhat         |
| 🧑‍🤝‍🧑 **Patient 2**  | #5      | Elderly patient       | ✅ In Hardhat         |
| 🧑‍🤝‍🧑 **Patient 3**  | #6      | Young adult patient   | ✅ In Hardhat         |

### Demo Scenarios

1. **Patient Registration**

   - Connect as Patient and register through the system
   - Government approves and issues medical ID

2. **Doctor-Patient Consultation**

   - Patient grants access to doctor
   - Doctor creates medical records
   - Patient can view their records

3. **Prescription Workflow**

   - Doctor issues prescription during consultation
   - Patient receives prescription notification
   - Pharmacy verifies and dispenses medication

4. **Access Control Management**

   - Patient grants/revokes doctor access
   - Time-limited permissions
   - Emergency access controls

5. **Government Analytics**
   - View system-wide statistics
   - Monitor healthcare provider activity
   - Generate anonymized reports

## 🎆 Key Features

### 🔐 Patient Data Sovereignty

- **Complete Control**: Patients own and control their medical data
- **Granular Permissions**: Grant/revoke access to specific providers
- **Time-Limited Access**: Temporary permissions with automatic expiration
- **Emergency Protocols**: Special access controls for critical situations
- **Audit Trail**: Complete history of data access and permissions

### 🏛️ Government Oversight

- **Medical ID Issuance**: Secure, blockchain-based identity verification
- **Provider Verification**: Healthcare provider license validation
- **System Analytics**: Privacy-preserving healthcare insights
- **Regulatory Compliance**: Built-in compliance with healthcare regulations
- **Policy Enforcement**: Automated enforcement of healthcare policies

### 🏢 Healthcare Provider Tools

- **Instant Access**: Real-time access to patient medical history (with permission)
- **Immutable Records**: Tamper-proof medical record creation
- **Smart Prescriptions**: Cryptographically secured prescription management
- **Multi-Stakeholder**: Seamless coordination between hospitals, clinics, and doctors
- **Treatment Tracking**: Complete treatment outcome monitoring

### 💊 Pharmacy Integration

- **Real-Time Verification**: Instant prescription authenticity validation
- **Fraud Prevention**: Blockchain-based anti-counterfeiting
- **Dispensing History**: Complete medication dispensing records
- **Inventory Management**: Track medication stock and expiration
- **Drug Interaction Alerts**: Safety warnings for medication conflicts

### 🔒 Enterprise Security

- **End-to-End Encryption**: AES-256 encryption for sensitive data
- **Multi-Signature Controls**: Multi-party authorization for critical operations
- **Role-Based Access**: Granular permission system by user type
- **Zero-Knowledge Ready**: Privacy-preserving analytics capabilities
- **GDPR Compliance**: Built-in data protection regulation adherence

### 📱 User Experience

- **Mobile-First Design**: Responsive interface for all devices
- **Multi-Language Support**: Arabic, French, English interfaces
- **Real-Time Notifications**: Instant updates on medical activities
- **Intuitive Dashboards**: Role-specific user interfaces
- **Offline Capabilities**: Essential functions work without internet

## 🚀 Production Deployment

### Deploy to Polygon Mumbai (Testnet)

```bash
# Set up environment variables
export PRIVATE_KEY="your_private_key_here"
export POLYGON_MUMBAI_URL="your_polygon_rpc_url"
export POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# Deploy to Mumbai testnet
npm run deploy:testnet

# Verify contracts on Polygonscan
npm run verify:testnet
```

### Deploy to Polygon Mainnet (Production)

```bash
# Set up mainnet environment variables
export PRIVATE_KEY="your_production_private_key"
export POLYGON_MAINNET_URL="your_polygon_mainnet_rpc"
export POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# Deploy to mainnet (use with caution)
npm run deploy:mainnet

# Verify contracts
npm run verify:mainnet
```

### Get Testnet Tokens

1. **Polygon Mumbai Faucet**: [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
2. **Alchemy Polygon Faucet**: [https://www.alchemy.com/faucets/polygon-mumbai](https://www.alchemy.com/faucets/polygon-mumbai)

## 🤝 Contributing

We welcome contributions to the Algerian Medical Passport project! Here's how you can help:

### 📨 Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue templates when available
3. Provide detailed reproduction steps
4. Include environment details (OS, Node.js version, etc.)

### 🛠️ Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### 📜 Code Standards

- Follow TypeScript/JavaScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

### 📝 Documentation

Help improve our documentation:

- Fix typos and improve clarity
- Add examples and use cases
- Translate to Arabic or French
- Create video tutorials

## 👤 Team & Contact

### 💫 Core Team

- **Project Lead**:
  [Mohammed TAMALI](https://github.com/mtamali)
  [Abdelmadjid LARBI](http://linkedin.com/in/abdelmadjid-larbi-b6073b3a)
- **Blockchain Developer**: [nasrosoft](https://github.com/nasrosoft)
- **Frontend Developer**: [nasrosoft](https://github.com/nasrosoft)
- **Backend Developer**: [nasrosoft](https://github.com/nasrosoft)

### 📬 Contact Information

- **Email**: amdlarbi@gmail.com / mtamali@gmail.com / nasrosoft.dev@gmail.com
- **Website**: [https://medical-passport.dz](https://medical-passport.dz) Loading..⏳
- **LinkedIn**: [Mohammed TAMALI](linkedin.com/in/mohammed-tamali-53353544)
- **LinkedIn**: [Abdelmadjid LARBI](http://linkedin.com/in/abdelmadjid-larbi-b6073b3a)
- **LinkedIn**: [nasrosoft](https://www.linkedin.com/in/nasrosoft/)

## 📈 Roadmap

### 🏁 Phase 1: Foundation (Completed)

- ✅ Core smart contracts development
- ✅ 6-stakeholder system implementation
- ✅ Multi-network support
- ✅ Comprehensive form validation
- ✅ Responsive UI/UX design

### 🚀 Phase 2: Enhancement (Q1 2026)

- 🔄 Mobile application (iOS/Android)
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support (Arabic/French)
- 🔄 IPFS integration for document storage
- 🔄 API marketplace for third-party integrations

### 🌍 Phase 3: Expansion (Q2-Q3 2026)

- ⏳ Regional expansion (MENA countries)
- ⏳ Insurance company integrations
- ⏳ Cross-border medical record sharing
- ⏳ Government API integration
- ⏳ Healthcare research platform

### 🤖 Phase 4: Advanced Features (Q4 2026)

- ⏳ AI-powered diagnostic assistance
- ⏳ Telemedicine platform integration
- ⏳ IoT medical device connectivity
- ⏳ Advanced privacy (homomorphic encryption)
- ⏳ Decentralized governance (DAO)

## ⭐ Show Your Support

If you find this project useful, please consider:

- ⭐ **Starring** this repository
- 👤 **Following** for updates
- 👨‍💻 **Contributing** to the codebase
- 📢 **Sharing** with your network
- 📝 **Writing** about your experience

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 📜 License Summary

- ✅ **Commercial use** allowed
- ✅ **Modification** allowed
- ✅ **Distribution** allowed
- ✅ **Private use** allowed
- ⚠️ **License and copyright notice** required
- ❌ **No warranty** provided

---

<div align="center">
  <img src="frontend/public/healty2.png" alt="Algerian Medical Passport" width="60" height="60">
  <p><strong>Built with INNO in Algeria for the future of healthcare</strong></p>
  <p>🚀 <em>Revolutionizing Healthcare Through Blockchain Technology</em> 🚀</p>
</div>
