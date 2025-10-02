// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IdentityManagement.sol";

/**
 * @title ConsentManagement
 * @dev Smart contract for managing consent and data access permissions
 * Similar to Hyperledger Fabric Private Data Collections (PDCs)
 * Implements consent model for: patientCore, clinicalNotes, prescriptions
 */
contract ConsentManagement is AccessControl, ReentrancyGuard {
    
    // Reference to the Identity Management contract
    IdentityManagement public identityContract;
    
    // Role definitions
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant CLINIC_ROLE = keccak256("CLINIC_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    
    // Enum for data scopes (similar to PDC collections)
    enum DataScope {
        PatientCore,     // Address, phone, national ID, emergency contact
        ClinicalNotes,   // Diagnoses, notes (restricted to providers)
        Prescriptions,   // Prescription details
        FullAccess       // All patient data
    }
    
    // Enum for consent status
    enum ConsentStatus {
        Active,
        Revoked,
        Expired
    }
    
    // Structure for consent record
    struct ConsentRecord {
        uint256 patientMedicalId;
        uint256 granteeMedicalId;      // Who is granted access
        DataScope scope;               // What data they can access
        ConsentStatus status;
        uint256 validFrom;
        uint256 validTo;               // 0 means no expiry
        address grantedBy;
        address revokedBy;
        string purpose;                // Purpose of data access
        bool emergencyOverride;        // Can be accessed in emergencies
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Structure for emergency access settings
    struct EmergencyAccess {
        bool enabled;
        uint256 enabledAt;
        address enabledBy;
        string conditions;             // Conditions under which emergency access is valid
    }
    
    // Mappings
    mapping(bytes32 => ConsentRecord) public consents; // consentId => ConsentRecord
    mapping(uint256 => bytes32[]) public patientConsents; // patientMedicalId => consentIds[]
    mapping(uint256 => bytes32[]) public granteeConsents; // granteeMedicalId => consentIds[]
    mapping(uint256 => EmergencyAccess) public emergencyAccessSettings; // patientMedicalId => EmergencyAccess
    mapping(uint256 => mapping(uint256 => mapping(DataScope => bytes32))) public activeConsents; // patient => grantee => scope => consentId
    
    // Events
    event ConsentGranted(
        bytes32 indexed consentId,
        uint256 indexed patientMedicalId,
        uint256 indexed granteeMedicalId,
        DataScope scope,
        uint256 validTo,
        address grantedBy
    );
    
    event ConsentRevoked(
        bytes32 indexed consentId,
        uint256 indexed patientMedicalId,
        uint256 indexed granteeMedicalId,
        address revokedBy,
        string reason
    );
    
    event ConsentExpired(
        bytes32 indexed consentId,
        uint256 indexed patientMedicalId,
        uint256 indexed granteeMedicalId
    );
    
    event EmergencyAccessToggled(
        uint256 indexed patientMedicalId,
        bool enabled,
        address toggledBy
    );
    
    // Modifiers
    modifier onlyPatient() {
        require(identityContract.hasRole(PATIENT_ROLE, msg.sender), "Caller is not a patient");
        _;
    }
    
    modifier onlyHealthcareProvider() {
        require(
            identityContract.hasRole(DOCTOR_ROLE, msg.sender) ||
            identityContract.hasRole(HOSPITAL_ROLE, msg.sender) ||
            identityContract.hasRole(CLINIC_ROLE, msg.sender) ||
            identityContract.hasRole(PHARMACY_ROLE, msg.sender),
            "Caller is not a healthcare provider"
        );
        _;
    }
    
    modifier validMedicalId(uint256 _medicalId) {
        (bool isValid, , ) = identityContract.verifyIdentity(_medicalId);
        require(isValid, "Invalid medical ID");
        _;
    }
    
    modifier validConsentId(bytes32 _consentId) {
        require(consents[_consentId].patientMedicalId != 0, "Invalid consent ID");
        _;
    }
    
    /**
     * @dev Constructor to set up the contract
     * @param _identityContractAddress Address of the IdentityManagement contract
     */
    constructor(address _identityContractAddress) {
        require(_identityContractAddress != address(0), "Invalid identity contract address");
        identityContract = IdentityManagement(_identityContractAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Grant consent for data access (similar to PDC access)
     * @param _granteeMedicalId Medical ID of the grantee
     * @param _scope Data scope to grant access to
     * @param _validTo Expiry timestamp (0 for no expiry)
     * @param _purpose Purpose of data access
     * @param _emergencyOverride Whether this can be accessed in emergencies
     */
    function grantConsent(
        uint256 _granteeMedicalId,
        DataScope _scope,
        uint256 _validTo,
        string memory _purpose,
        bool _emergencyOverride
    ) external onlyPatient validMedicalId(_granteeMedicalId) nonReentrant returns (bytes32) {
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(patientMedicalId != 0, "Patient not registered");
        require(patientMedicalId != _granteeMedicalId, "Cannot grant consent to self");
        
        // Verify that grantee is a valid healthcare provider
        (, IdentityManagement.EntityType entityType, ) = identityContract.verifyIdentity(_granteeMedicalId);
        require(
            entityType == IdentityManagement.EntityType.Doctor ||
            entityType == IdentityManagement.EntityType.Hospital ||
            entityType == IdentityManagement.EntityType.Clinic ||
            entityType == IdentityManagement.EntityType.Pharmacy,
            "Grantee must be a healthcare provider"
        );
        
        if (_validTo != 0) {
            require(_validTo > block.timestamp, "Expiry date must be in the future");
        }
        require(bytes(_purpose).length > 0, "Purpose required");
        
        // Generate unique consent ID
        bytes32 consentId = keccak256(
            abi.encodePacked(patientMedicalId, _granteeMedicalId, _scope, block.timestamp, block.number)
        );
        
        // Revoke any existing consent for the same patient-grantee-scope combination
        bytes32 existingConsentId = activeConsents[patientMedicalId][_granteeMedicalId][_scope];
        if (existingConsentId != 0) {
            _revokeConsent(existingConsentId, "Replaced by new consent");
        }
        
        // Create new consent record
        consents[consentId] = ConsentRecord({
            patientMedicalId: patientMedicalId,
            granteeMedicalId: _granteeMedicalId,
            scope: _scope,
            status: ConsentStatus.Active,
            validFrom: block.timestamp,
            validTo: _validTo,
            grantedBy: msg.sender,
            revokedBy: address(0),
            purpose: _purpose,
            emergencyOverride: _emergencyOverride,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Update mappings
        patientConsents[patientMedicalId].push(consentId);
        granteeConsents[_granteeMedicalId].push(consentId);
        activeConsents[patientMedicalId][_granteeMedicalId][_scope] = consentId;
        
        emit ConsentGranted(consentId, patientMedicalId, _granteeMedicalId, _scope, _validTo, msg.sender);
        
        return consentId;
    }
    
    /**
     * @dev Revoke consent for data access
     * @param _consentId The consent ID to revoke
     * @param _reason Reason for revocation
     */
    function revokeConsent(bytes32 _consentId, string memory _reason) 
        external validConsentId(_consentId) {
        ConsentRecord storage consent = consents[_consentId];
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(
            consent.patientMedicalId == patientMedicalId ||
            identityContract.hasRole(GOVERNMENT_ROLE, msg.sender),
            "Only patient or government can revoke consent"
        );
        require(consent.status == ConsentStatus.Active, "Consent is not active");
        require(bytes(_reason).length > 0, "Revocation reason required");
        
        _revokeConsent(_consentId, _reason);
    }
    
    /**
     * @dev Internal function to revoke consent
     */
    function _revokeConsent(bytes32 _consentId, string memory _reason) internal {
        ConsentRecord storage consent = consents[_consentId];
        consent.status = ConsentStatus.Revoked;
        consent.revokedBy = msg.sender;
        consent.updatedAt = block.timestamp;
        
        // Clear active consent mapping
        activeConsents[consent.patientMedicalId][consent.granteeMedicalId][consent.scope] = 0;
        
        emit ConsentRevoked(_consentId, consent.patientMedicalId, consent.granteeMedicalId, msg.sender, _reason);
    }
    
    /**
     * @dev Check if a grantee has valid consent for specific data scope
     * @param _patientMedicalId Patient's medical ID
     * @param _granteeMedicalId Grantee's medical ID
     * @param _scope Data scope to check
     * @return hasAccess Whether access is granted
     * @return consentId The active consent ID (if any)
     * @return expiryDate When the consent expires
     */
    function checkConsent(
        uint256 _patientMedicalId,
        uint256 _granteeMedicalId,
        DataScope _scope
    ) external view validMedicalId(_patientMedicalId) validMedicalId(_granteeMedicalId) 
      returns (bool hasAccess, bytes32 consentId, uint256 expiryDate) {
        
        consentId = activeConsents[_patientMedicalId][_granteeMedicalId][_scope];
        
        if (consentId == 0) {
            // Check for full access consent
            consentId = activeConsents[_patientMedicalId][_granteeMedicalId][DataScope.FullAccess];
        }
        
        if (consentId != 0) {
            ConsentRecord storage consent = consents[consentId];
            
            // Check if consent is still valid
            bool isNotExpired = (consent.validTo == 0 || consent.validTo > block.timestamp);
            bool isActive = (consent.status == ConsentStatus.Active);
            
            hasAccess = isActive && isNotExpired;
            expiryDate = consent.validTo;
            
            // Mark as expired if needed
            if (isActive && !isNotExpired) {
                // Note: We can't modify state in a view function
                // This would need to be handled by a separate cleanup function
            }
        }
        
        // Check emergency access
        if (!hasAccess && emergencyAccessSettings[_patientMedicalId].enabled) {
            ConsentRecord storage consent = consents[consentId];
            hasAccess = consent.emergencyOverride;
        }
        
        return (hasAccess, consentId, expiryDate);
    }
    
    /**
     * @dev Toggle emergency access (allows providers to access data in emergencies)
     * @param _enabled Whether to enable emergency access
     * @param _conditions Conditions under which emergency access is valid
     */
    function toggleEmergencyAccess(bool _enabled, string memory _conditions) external onlyPatient {
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(patientMedicalId != 0, "Patient not registered");
        
        emergencyAccessSettings[patientMedicalId] = EmergencyAccess({
            enabled: _enabled,
            enabledAt: block.timestamp,
            enabledBy: msg.sender,
            conditions: _conditions
        });
        
        emit EmergencyAccessToggled(patientMedicalId, _enabled, msg.sender);
    }
    
    /**
     * @dev Get patient's active consents
     * @param _patientMedicalId Patient's medical ID
     * @return consentIds Array of active consent IDs
     */
    function getPatientConsents(uint256 _patientMedicalId) 
        external view validMedicalId(_patientMedicalId) 
        returns (bytes32[] memory consentIds) {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(
            callerMedicalId == _patientMedicalId ||
            identityContract.hasRole(GOVERNMENT_ROLE, msg.sender),
            "Only patient or government can view all consents"
        );
        
        return patientConsents[_patientMedicalId];
    }
    
    /**
     * @dev Get provider's granted consents
     * @param _providerMedicalId Provider's medical ID
     * @return consentIds Array of consent IDs where this provider has access
     */
    function getProviderConsents(uint256 _providerMedicalId) 
        external view validMedicalId(_providerMedicalId) 
        returns (bytes32[] memory consentIds) {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(
            callerMedicalId == _providerMedicalId ||
            identityContract.hasRole(GOVERNMENT_ROLE, msg.sender),
            "Only provider or government can view provider consents"
        );
        
        return granteeConsents[_providerMedicalId];
    }
    
    /**
     * @dev Get consent details
     * @param _consentId Consent ID to query
     * @return consent The consent record
     */
    function getConsent(bytes32 _consentId) 
        external view validConsentId(_consentId) 
        returns (ConsentRecord memory consent) {
        consent = consents[_consentId];
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(
            callerMedicalId == consent.patientMedicalId ||
            callerMedicalId == consent.granteeMedicalId ||
            identityContract.hasRole(GOVERNMENT_ROLE, msg.sender),
            "No permission to view this consent"
        );
        
        return consent;
    }
    
    /**
     * @dev Cleanup expired consents (can be called by anyone)
     * @param _consentIds Array of consent IDs to check and cleanup
     */
    function cleanupExpiredConsents(bytes32[] memory _consentIds) external {
        for (uint256 i = 0; i < _consentIds.length; i++) {
            bytes32 consentId = _consentIds[i];
            ConsentRecord storage consent = consents[consentId];
            
            if (consent.status == ConsentStatus.Active && 
                consent.validTo != 0 && 
                consent.validTo <= block.timestamp) {
                
                consent.status = ConsentStatus.Expired;
                consent.updatedAt = block.timestamp;
                
                // Clear active consent mapping
                activeConsents[consent.patientMedicalId][consent.granteeMedicalId][consent.scope] = 0;
                
                emit ConsentExpired(consentId, consent.patientMedicalId, consent.granteeMedicalId);
            }
        }
    }
}