// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IdentityManagement
 * @dev Smart contract for managing medical identity registration and verification
 * in the Algerian Medical Passport system
 */
contract IdentityManagement is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Role definitions (matching Hyperledger Fabric MSPs)
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE"); // MinistryMSP
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE"); // HospitalMSP
    bytes32 public constant CLINIC_ROLE = keccak256("CLINIC_ROLE"); // ClinicMSP
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE"); // PharmacyMSP
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE"); // Individual doctors
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    // Counter for unique medical IDs
    Counters.Counter private _medicalIdCounter;
    
    // Enum for identity status
    enum IdentityStatus {
        Pending,
        Active,
        Suspended,
        Revoked
    }
    
    // Enum for entity types (matching Hyperledger Fabric organizations)
    enum EntityType {
        Government, // Ministry
        Hospital,   // Hospital organization
        Clinic,     // Clinic organization
        Pharmacy,   // Pharmacy organization
        Doctor,     // Individual doctor (can belong to Hospital/Clinic)
        Patient     // Individual patient
    }
    
    // Structure for profile picture metadata (similar to Hyperledger Fabric version)
    struct ProfilePicture {
        string uri; // IPFS URI: ipfs://Qm...
        string sha256; // Hash of the image file
        string encryption; // Encryption method: AES-256-GCM
    }
    
    // Enhanced Patient Passport structure (based on Hyperledger Fabric design)
    struct PatientPassport {
        string patientId; // DZ-213-XXXXXX format
        string firstName;
        string lastName;
        string firstNameAr; // Arabic first name
        string lastNameAr; // Arabic last name
        string birthDate; // ISO-8601 format: 1994-07-18
        string bloodType; // O+, A+, B+, AB+, O-, A-, B-, AB-
        ProfilePicture profilePic;
        IdentityStatus status;
        uint256 createdAt;
        address createdBy;
    }
    
    // Structure to store medical identity information
    struct MedicalIdentity {
        uint256 medicalId;
        address walletAddress;
        EntityType entityType;
        IdentityStatus status;
        string encryptedPersonalData; // IPFS hash of encrypted personal data
        string publicKey; // For encryption/decryption
        uint256 registrationDate;
        uint256 lastUpdateDate;
        address registeredBy; // Government address that registered this identity
        PatientPassport patientPassport; // Only populated for patients
    }
    
    // Structure for healthcare provider credentials
    struct ProviderCredentials {
        string licenseNumber;
        string specialization; // For doctors: "Cardiology", for facilities: "General Hospital"
        string facilityId; // For doctors: which hospital/clinic they belong to
        uint256 licenseExpiryDate;
        bool isVerified;
        address verifiedBy;
        string additionalCertifications; // Additional certifications or accreditations
    }
    
    // Mappings
    mapping(uint256 => MedicalIdentity) public medicalIdentities;
    mapping(address => uint256) public addressToMedicalId;
    mapping(uint256 => ProviderCredentials) public providerCredentials;
    mapping(address => bool) public authorizedGovernmentAddresses;
    mapping(string => uint256) public patientIdToMedicalId; // DZ-213-XXXXXX => medicalId
    mapping(string => bool) public usedPatientIds; // Track used patient IDs
    
    // Events
    event IdentityRegistered(
        uint256 indexed medicalId,
        address indexed walletAddress,
        EntityType entityType,
        address indexed registeredBy
    );
    
    event IdentityStatusUpdated(
        uint256 indexed medicalId,
        IdentityStatus oldStatus,
        IdentityStatus newStatus,
        address updatedBy
    );
    
    event CredentialsUpdated(
        uint256 indexed medicalId,
        string licenseNumber,
        address updatedBy
    );
    
    event GovernmentAuthorized(address indexed governmentAddress);
    event GovernmentRevoked(address indexed governmentAddress);
    
    event PatientPassportCreated(
        uint256 indexed medicalId,
        string indexed patientId,
        string firstName,
        string lastName,
        address indexed createdBy
    );
    
    event PatientPassportUpdated(
        uint256 indexed medicalId,
        string indexed patientId,
        address updatedBy
    );
    
    // Modifiers
    modifier onlyGovernment() {
        require(hasRole(GOVERNMENT_ROLE, msg.sender), "Caller is not government");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(addressToMedicalId[msg.sender] != 0, "User not registered");
        _;
    }
    
    modifier validMedicalId(uint256 _medicalId) {
        require(_medicalId > 0 && _medicalId <= _medicalIdCounter.current(), "Invalid medical ID");
        _;
    }
    
    /**
     * @dev Constructor to set up the contract with initial admin
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNMENT_ROLE, msg.sender);
        authorizedGovernmentAddresses[msg.sender] = true;
    }
    
    /**
     * @dev Register a new medical identity
     * @param _walletAddress The wallet address for the new identity
     * @param _entityType The type of entity (Government, Doctor, Pharmacy, Patient)
     * @param _encryptedPersonalData IPFS hash of encrypted personal data
     * @param _publicKey Public key for encryption/decryption
     */
    function registerMedicalID(
        address _walletAddress,
        EntityType _entityType,
        string memory _encryptedPersonalData,
        string memory _publicKey
    ) external onlyGovernment nonReentrant returns (uint256) {
        require(_walletAddress != address(0), "Invalid wallet address");
        require(addressToMedicalId[_walletAddress] == 0, "Address already registered");
        require(bytes(_encryptedPersonalData).length > 0, "Personal data hash required");
        require(bytes(_publicKey).length > 0, "Public key required");
        
        _medicalIdCounter.increment();
        uint256 newMedicalId = _medicalIdCounter.current();
        
        // Create empty patient passport for non-patients
        PatientPassport memory emptyPassport;
        
        medicalIdentities[newMedicalId] = MedicalIdentity({
            medicalId: newMedicalId,
            walletAddress: _walletAddress,
            entityType: _entityType,
            status: IdentityStatus.Active,
            encryptedPersonalData: _encryptedPersonalData,
            publicKey: _publicKey,
            registrationDate: block.timestamp,
            lastUpdateDate: block.timestamp,
            registeredBy: msg.sender,
            patientPassport: emptyPassport
        });
        
        addressToMedicalId[_walletAddress] = newMedicalId;
        
        // Grant appropriate role based on entity type (matching Hyperledger Fabric MSPs)
        if (_entityType == EntityType.Government) {
            _grantRole(GOVERNMENT_ROLE, _walletAddress);
            authorizedGovernmentAddresses[_walletAddress] = true;
        } else if (_entityType == EntityType.Hospital) {
            _grantRole(HOSPITAL_ROLE, _walletAddress);
        } else if (_entityType == EntityType.Clinic) {
            _grantRole(CLINIC_ROLE, _walletAddress);
        } else if (_entityType == EntityType.Pharmacy) {
            _grantRole(PHARMACY_ROLE, _walletAddress);
        } else if (_entityType == EntityType.Doctor) {
            _grantRole(DOCTOR_ROLE, _walletAddress);
        } else if (_entityType == EntityType.Patient) {
            _grantRole(PATIENT_ROLE, _walletAddress);
        }
        
        emit IdentityRegistered(newMedicalId, _walletAddress, _entityType, msg.sender);
        
        return newMedicalId;
    }
    
    /**
     * @dev Register a new patient with complete passport information (Hyperledger Fabric style)
     * @param _walletAddress The wallet address for the patient
     * @param _patientId Algerian patient ID in format DZ-213-XXXXXX
     * @param _firstName Patient's first name (Latin)
     * @param _lastName Patient's last name (Latin)
     * @param _firstNameAr Patient's first name (Arabic)
     * @param _lastNameAr Patient's last name (Arabic)
     * @param _birthDate Birth date in ISO-8601 format (1994-07-18)
     * @param _bloodType Blood type (O+, A+, B+, AB+, O-, A-, B-, AB-)
     * @param _profilePicUri IPFS URI for profile picture
     * @param _profilePicSha256 SHA-256 hash of profile picture
     * @param _profilePicEncryption Encryption method (e.g., AES-256-GCM)
     * @param _publicKey Public key for encryption/decryption
     */
    function registerPatientPassport(
        address _walletAddress,
        string memory _patientId,
        string memory _firstName,
        string memory _lastName,
        string memory _firstNameAr,
        string memory _lastNameAr,
        string memory _birthDate,
        string memory _bloodType,
        string memory _profilePicUri,
        string memory _profilePicSha256,
        string memory _profilePicEncryption,
        string memory _publicKey
    ) external onlyGovernment nonReentrant returns (uint256) {
        require(_walletAddress != address(0), "Invalid wallet address");
        require(addressToMedicalId[_walletAddress] == 0, "Address already registered");
        require(bytes(_patientId).length > 0, "Patient ID required");
        require(!usedPatientIds[_patientId], "Patient ID already used");
        require(bytes(_firstName).length > 0, "First name required");
        require(bytes(_lastName).length > 0, "Last name required");
        require(bytes(_firstNameAr).length > 0, "Arabic first name required");
        require(bytes(_lastNameAr).length > 0, "Arabic last name required");
        require(bytes(_birthDate).length > 0, "Birth date required");
        require(_isValidBloodType(_bloodType), "Invalid blood type");
        require(bytes(_publicKey).length > 0, "Public key required");
        
        _medicalIdCounter.increment();
        uint256 newMedicalId = _medicalIdCounter.current();
        
        // Create profile picture metadata
        ProfilePicture memory profilePic = ProfilePicture({
            uri: _profilePicUri,
            sha256: _profilePicSha256,
            encryption: _profilePicEncryption
        });
        
        // Create patient passport
        PatientPassport memory passport = PatientPassport({
            patientId: _patientId,
            firstName: _firstName,
            lastName: _lastName,
            firstNameAr: _firstNameAr,
            lastNameAr: _lastNameAr,
            birthDate: _birthDate,
            bloodType: _bloodType,
            profilePic: profilePic,
            status: IdentityStatus.Active,
            createdAt: block.timestamp,
            createdBy: msg.sender
        });
        
        // Create medical identity with patient passport
        medicalIdentities[newMedicalId] = MedicalIdentity({
            medicalId: newMedicalId,
            walletAddress: _walletAddress,
            entityType: EntityType.Patient,
            status: IdentityStatus.Active,
            encryptedPersonalData: "", // Optional for patients using passport structure
            publicKey: _publicKey,
            registrationDate: block.timestamp,
            lastUpdateDate: block.timestamp,
            registeredBy: msg.sender,
            patientPassport: passport
        });
        
        // Update mappings
        addressToMedicalId[_walletAddress] = newMedicalId;
        patientIdToMedicalId[_patientId] = newMedicalId;
        usedPatientIds[_patientId] = true;
        
        // Grant patient role
        _grantRole(PATIENT_ROLE, _walletAddress);
        
        emit IdentityRegistered(newMedicalId, _walletAddress, EntityType.Patient, msg.sender);
        emit PatientPassportCreated(newMedicalId, _patientId, _firstName, _lastName, msg.sender);
        
        return newMedicalId;
    }
    
    /**
     * @dev Verify an identity by medical ID
     * @param _medicalId The medical ID to verify
     * @return isValid Whether the identity is valid and active
     * @return entityType The type of entity
     * @return walletAddress The wallet address associated with the ID
     */
    function verifyIdentity(uint256 _medicalId)
        external
        view
        validMedicalId(_medicalId)
        returns (bool isValid, EntityType entityType, address walletAddress)
    {
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        isValid = (identity.status == IdentityStatus.Active);
        entityType = identity.entityType;
        walletAddress = identity.walletAddress;
        
        return (isValid, entityType, walletAddress);
    }
    
    /**
     * @dev Update identity status (suspend, reactivate, revoke)
     * @param _medicalId The medical ID to update
     * @param _newStatus The new status to set
     */
    function updateIdentityStatus(uint256 _medicalId, IdentityStatus _newStatus)
        external
        onlyGovernment
        validMedicalId(_medicalId)
    {
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        IdentityStatus oldStatus = identity.status;
        
        identity.status = _newStatus;
        identity.lastUpdateDate = block.timestamp;
        
        emit IdentityStatusUpdated(_medicalId, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Update healthcare provider credentials (supports all provider types)
     * @param _medicalId The medical ID of the provider
     * @param _licenseNumber The license number
     * @param _specialization The medical specialization or facility type
     * @param _facilityId The facility ID (for doctors: which hospital/clinic they work at)
     * @param _licenseExpiryDate The license expiry date
     * @param _additionalCertifications Additional certifications
     */
    function updateProviderCredentials(
        uint256 _medicalId,
        string memory _licenseNumber,
        string memory _specialization,
        string memory _facilityId,
        uint256 _licenseExpiryDate,
        string memory _additionalCertifications
    ) external onlyGovernment validMedicalId(_medicalId) {
        require(bytes(_licenseNumber).length > 0, "License number required");
        require(bytes(_specialization).length > 0, "Specialization required");
        require(_licenseExpiryDate > block.timestamp, "License expiry date must be in the future");
        
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        require(
            identity.entityType == EntityType.Doctor || 
            identity.entityType == EntityType.Hospital ||
            identity.entityType == EntityType.Clinic ||
            identity.entityType == EntityType.Pharmacy,
            "Only healthcare providers can have credentials"
        );
        
        providerCredentials[_medicalId] = ProviderCredentials({
            licenseNumber: _licenseNumber,
            specialization: _specialization,
            facilityId: _facilityId,
            licenseExpiryDate: _licenseExpiryDate,
            isVerified: true,
            verifiedBy: msg.sender,
            additionalCertifications: _additionalCertifications
        });
        
        emit CredentialsUpdated(_medicalId, _licenseNumber, msg.sender);
    }
    
    /**
     * @dev Get medical identity information
     * @param _medicalId The medical ID to query
     */
    function getMedicalIdentity(uint256 _medicalId)
        external
        view
        validMedicalId(_medicalId)
        returns (MedicalIdentity memory)
    {
        return medicalIdentities[_medicalId];
    }
    
    /**
     * @dev Get provider credentials
     * @param _medicalId The medical ID of the provider
     */
    function getProviderCredentials(uint256 _medicalId)
        external
        view
        validMedicalId(_medicalId)
        returns (ProviderCredentials memory)
    {
        return providerCredentials[_medicalId];
    }
    
    /**
     * @dev Check if a provider's license is still valid
     * @param _medicalId The medical ID of the provider
     * @return isValid Whether the license is valid and not expired
     */
    function isProviderLicenseValid(uint256 _medicalId)
        external
        view
        validMedicalId(_medicalId)
        returns (bool isValid)
    {
        ProviderCredentials storage credentials = providerCredentials[_medicalId];
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        
        return (
            credentials.isVerified &&
            credentials.licenseExpiryDate > block.timestamp &&
            identity.status == IdentityStatus.Active
        );
    }
    
    /**
     * @dev Get medical ID by wallet address
     * @param _address The wallet address to query
     * @return medicalId The medical ID associated with the address
     */
    function getMedicalIdByAddress(address _address)
        external
        view
        returns (uint256 medicalId)
    {
        return addressToMedicalId[_address];
    }
    
    /**
     * @dev Get total number of registered identities
     * @return count The total count of medical IDs
     */
    function getTotalRegisteredIdentities() external view returns (uint256 count) {
        return _medicalIdCounter.current();
    }
    
    /**
     * @dev Authorize a new government address (only admin)
     * @param _governmentAddress The address to authorize
     */
    function authorizeGovernmentAddress(address _governmentAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_governmentAddress != address(0), "Invalid government address");
        _grantRole(GOVERNMENT_ROLE, _governmentAddress);
        authorizedGovernmentAddresses[_governmentAddress] = true;
        emit GovernmentAuthorized(_governmentAddress);
    }
    
    /**
     * @dev Revoke government authorization (only admin)
     * @param _governmentAddress The address to revoke
     */
    function revokeGovernmentAddress(address _governmentAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(GOVERNMENT_ROLE, _governmentAddress);
        authorizedGovernmentAddresses[_governmentAddress] = false;
        emit GovernmentRevoked(_governmentAddress);
    }
    
    /**
     * @dev Get patient passport by medical ID
     * @param _medicalId The medical ID to query
     * @return passport The patient passport information
     */
    function getPatientPassport(uint256 _medicalId)
        external
        view
        validMedicalId(_medicalId)
        returns (PatientPassport memory passport)
    {
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        require(identity.entityType == EntityType.Patient, "Not a patient identity");
        return identity.patientPassport;
    }
    
    /**
     * @dev Get medical ID by patient ID (DZ-213-XXXXXX format)
     * @param _patientId The patient ID to query
     * @return medicalId The medical ID associated with the patient ID
     */
    function getMedicalIdByPatientId(string memory _patientId)
        external
        view
        returns (uint256 medicalId)
    {
        return patientIdToMedicalId[_patientId];
    }
    
    /**
     * @dev Update patient passport information (for corrections or updates)
     * @param _medicalId Medical ID of the patient
     * @param _firstName New first name
     * @param _lastName New last name
     * @param _firstNameAr New Arabic first name
     * @param _lastNameAr New Arabic last name
     * @param _bloodType New blood type
     * @param _profilePicUri New profile picture URI
     * @param _profilePicSha256 New profile picture hash
     * @param _profilePicEncryption New encryption method
     */
    function updatePatientPassport(
        uint256 _medicalId,
        string memory _firstName,
        string memory _lastName,
        string memory _firstNameAr,
        string memory _lastNameAr,
        string memory _bloodType,
        string memory _profilePicUri,
        string memory _profilePicSha256,
        string memory _profilePicEncryption
    ) external onlyGovernment validMedicalId(_medicalId) {
        MedicalIdentity storage identity = medicalIdentities[_medicalId];
        require(identity.entityType == EntityType.Patient, "Not a patient identity");
        require(_isValidBloodType(_bloodType), "Invalid blood type");
        
        PatientPassport storage passport = identity.patientPassport;
        passport.firstName = _firstName;
        passport.lastName = _lastName;
        passport.firstNameAr = _firstNameAr;
        passport.lastNameAr = _lastNameAr;
        passport.bloodType = _bloodType;
        passport.profilePic.uri = _profilePicUri;
        passport.profilePic.sha256 = _profilePicSha256;
        passport.profilePic.encryption = _profilePicEncryption;
        
        identity.lastUpdateDate = block.timestamp;
        
        emit PatientPassportUpdated(_medicalId, passport.patientId, msg.sender);
    }
    
    /**
     * @dev Validate blood type format
     * @param _bloodType Blood type to validate
     * @return isValid Whether the blood type is valid
     */
    function _isValidBloodType(string memory _bloodType) private pure returns (bool isValid) {
        bytes32 bloodTypeHash = keccak256(abi.encodePacked(_bloodType));
        return (
            bloodTypeHash == keccak256(abi.encodePacked("O+")) ||
            bloodTypeHash == keccak256(abi.encodePacked("O-")) ||
            bloodTypeHash == keccak256(abi.encodePacked("A+")) ||
            bloodTypeHash == keccak256(abi.encodePacked("A-")) ||
            bloodTypeHash == keccak256(abi.encodePacked("B+")) ||
            bloodTypeHash == keccak256(abi.encodePacked("B-")) ||
            bloodTypeHash == keccak256(abi.encodePacked("AB+")) ||
            bloodTypeHash == keccak256(abi.encodePacked("AB-"))
        );
    }
    
    /**
     * @dev Verify patient passport by patient ID and return passport details
     * @param _patientId Patient ID to verify (DZ-213-XXXXXX format)
     * @return isValid Whether the patient ID is valid and active
     * @return passport The patient passport details
     */
    function verifyPatientPassport(string memory _patientId)
        external
        view
        returns (bool isValid, PatientPassport memory passport)
    {
        uint256 medicalId = patientIdToMedicalId[_patientId];
        if (medicalId == 0) {
            return (false, passport);
        }
        
        MedicalIdentity storage identity = medicalIdentities[medicalId];
        isValid = (identity.status == IdentityStatus.Active && 
                   identity.entityType == EntityType.Patient);
        
        if (isValid) {
            passport = identity.patientPassport;
        }
        
        return (isValid, passport);
    }
}
