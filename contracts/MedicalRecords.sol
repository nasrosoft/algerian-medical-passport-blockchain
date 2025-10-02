// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IdentityManagement.sol";

/**
 * @title MedicalRecords
 * @dev Smart contract for managing medical records in the Algerian Medical Passport system
 */
contract MedicalRecords is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Reference to the Identity Management contract
    IdentityManagement public identityContract;
    
    // Role definitions
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    // Counter for unique record IDs
    Counters.Counter private _recordIdCounter;
    
    // Enum for record types
    enum RecordType {
        Consultation,
        Diagnosis,
        Treatment,
        Laboratory,
        Imaging,
        Surgery,
        Prescription,
        Vaccination,
        Emergency
    }
    
    // Enum for record status
    enum RecordStatus {
        Active,
        Updated,
        Deleted
    }
    
    // Structure for medical records
    struct MedicalRecord {
        uint256 recordId;
        uint256 patientMedicalId;
        uint256 doctorMedicalId;
        RecordType recordType;
        RecordStatus status;
        string encryptedData; // IPFS hash of encrypted medical data
        string title;
        string summary; // Non-sensitive summary for quick reference
        uint256 createdDate;
        uint256 lastUpdatedDate;
        address createdBy;
        address lastUpdatedBy;
    }
    
    // Structure for access permissions
    struct AccessPermission {
        bool hasAccess;
        uint256 grantedDate;
        uint256 expiryDate; // 0 means no expiry
        address grantedBy;
    }
    
    // Mappings
    mapping(uint256 => MedicalRecord) public medicalRecords;
    mapping(uint256 => uint256[]) public patientRecords; // patientMedicalId => recordIds[]
    mapping(uint256 => mapping(uint256 => AccessPermission)) public recordAccess; // recordId => doctorMedicalId => AccessPermission
    mapping(uint256 => mapping(uint256 => AccessPermission)) public patientAccess; // patientMedicalId => doctorMedicalId => AccessPermission
    mapping(uint256 => bool) public emergencyAccess; // patientMedicalId => hasEmergencyAccess
    
    // Events
    event RecordCreated(
        uint256 indexed recordId,
        uint256 indexed patientMedicalId,
        uint256 indexed doctorMedicalId,
        RecordType recordType,
        address createdBy
    );
    
    event RecordUpdated(
        uint256 indexed recordId,
        address updatedBy,
        uint256 updatedDate
    );
    
    event RecordDeleted(
        uint256 indexed recordId,
        address deletedBy,
        uint256 deletedDate
    );
    
    event AccessGranted(
        uint256 indexed patientMedicalId,
        uint256 indexed doctorMedicalId,
        uint256 expiryDate,
        address grantedBy
    );
    
    event AccessRevoked(
        uint256 indexed patientMedicalId,
        uint256 indexed doctorMedicalId,
        address revokedBy
    );
    
    event EmergencyAccessToggled(
        uint256 indexed patientMedicalId,
        bool enabled,
        address toggledBy
    );
    
    // Modifiers
    modifier onlyRegisteredDoctor() {
        require(hasRole(DOCTOR_ROLE, msg.sender), "Caller is not a registered doctor");
        _;
    }
    
    modifier onlyRegisteredPatient() {
        require(hasRole(PATIENT_ROLE, msg.sender), "Caller is not a registered patient");
        _;
    }
    
    modifier validRecordId(uint256 _recordId) {
        require(_recordId > 0 && _recordId <= _recordIdCounter.current(), "Invalid record ID");
        _;
    }
    
    modifier validMedicalId(uint256 _medicalId) {
        (bool isValid, , ) = identityContract.verifyIdentity(_medicalId);
        require(isValid, "Invalid medical ID");
        _;
    }
    
    modifier hasRecordAccess(uint256 _recordId, uint256 _doctorMedicalId) {
        MedicalRecord storage record = medicalRecords[_recordId];
        require(
            _hasAccessToPatient(record.patientMedicalId, _doctorMedicalId) ||
            emergencyAccess[record.patientMedicalId],
            "No access to this record"
        );
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
     * @dev Create a new medical record
     * @param _patientMedicalId Medical ID of the patient
     * @param _recordType Type of medical record
     * @param _encryptedData IPFS hash of encrypted medical data
     * @param _title Title of the record
     * @param _summary Non-sensitive summary
     */
    function createRecord(
        uint256 _patientMedicalId,
        RecordType _recordType,
        string memory _encryptedData,
        string memory _title,
        string memory _summary
    ) external onlyRegisteredDoctor validMedicalId(_patientMedicalId) nonReentrant returns (uint256) {
        uint256 doctorMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(doctorMedicalId != 0, "Doctor not registered");
        
        // Check if doctor has access to patient
        require(
            _hasAccessToPatient(_patientMedicalId, doctorMedicalId) ||
            emergencyAccess[_patientMedicalId],
            "No access to create records for this patient"
        );
        
        require(bytes(_encryptedData).length > 0, "Encrypted data required");
        require(bytes(_title).length > 0, "Title required");
        
        _recordIdCounter.increment();
        uint256 newRecordId = _recordIdCounter.current();
        
        medicalRecords[newRecordId] = MedicalRecord({
            recordId: newRecordId,
            patientMedicalId: _patientMedicalId,
            doctorMedicalId: doctorMedicalId,
            recordType: _recordType,
            status: RecordStatus.Active,
            encryptedData: _encryptedData,
            title: _title,
            summary: _summary,
            createdDate: block.timestamp,
            lastUpdatedDate: block.timestamp,
            createdBy: msg.sender,
            lastUpdatedBy: msg.sender
        });
        
        patientRecords[_patientMedicalId].push(newRecordId);
        
        emit RecordCreated(newRecordId, _patientMedicalId, doctorMedicalId, _recordType, msg.sender);
        
        return newRecordId;
    }
    
    /**
     * @dev Update an existing medical record
     * @param _recordId ID of the record to update
     * @param _encryptedData New encrypted data
     * @param _title New title
     * @param _summary New summary
     */
    function updateRecord(
        uint256 _recordId,
        string memory _encryptedData,
        string memory _title,
        string memory _summary
    ) external onlyRegisteredDoctor validRecordId(_recordId) nonReentrant {
        MedicalRecord storage record = medicalRecords[_recordId];
        require(record.status == RecordStatus.Active, "Record is not active");
        
        uint256 doctorMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(doctorMedicalId != 0, "Doctor not registered");
        
        // Only the original doctor or doctors with access can update
        require(
            record.doctorMedicalId == doctorMedicalId ||
            _hasAccessToPatient(record.patientMedicalId, doctorMedicalId),
            "No permission to update this record"
        );
        
        require(bytes(_encryptedData).length > 0, "Encrypted data required");
        require(bytes(_title).length > 0, "Title required");
        
        record.encryptedData = _encryptedData;
        record.title = _title;
        record.summary = _summary;
        record.lastUpdatedDate = block.timestamp;
        record.lastUpdatedBy = msg.sender;
        record.status = RecordStatus.Updated;
        
        emit RecordUpdated(_recordId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Soft delete a medical record
     * @param _recordId ID of the record to delete
     */
    function deleteRecord(uint256 _recordId) external onlyRegisteredDoctor validRecordId(_recordId) {
        MedicalRecord storage record = medicalRecords[_recordId];
        require(record.status != RecordStatus.Deleted, "Record already deleted");
        
        uint256 doctorMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(doctorMedicalId != 0, "Doctor not registered");
        
        // Only the original doctor can delete the record
        require(record.doctorMedicalId == doctorMedicalId, "Only original doctor can delete record");
        
        record.status = RecordStatus.Deleted;
        record.lastUpdatedDate = block.timestamp;
        record.lastUpdatedBy = msg.sender;
        
        emit RecordDeleted(_recordId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Grant access to a doctor for a specific time period
     * @param _doctorMedicalId Medical ID of the doctor to grant access to
     * @param _expiryDate Expiry date for the access (0 for no expiry)
     */
    function grantAccess(uint256 _doctorMedicalId, uint256 _expiryDate)
        external
        onlyRegisteredPatient
        validMedicalId(_doctorMedicalId)
    {
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(patientMedicalId != 0, "Patient not registered");
        
        // Verify that the target is actually a doctor
        (, IdentityManagement.EntityType entityType, ) = identityContract.verifyIdentity(_doctorMedicalId);
        require(entityType == IdentityManagement.EntityType.Doctor, "Target is not a doctor");
        
        if (_expiryDate != 0) {
            require(_expiryDate > block.timestamp, "Expiry date must be in the future");
        }
        
        patientAccess[patientMedicalId][_doctorMedicalId] = AccessPermission({
            hasAccess: true,
            grantedDate: block.timestamp,
            expiryDate: _expiryDate,
            grantedBy: msg.sender
        });
        
        emit AccessGranted(patientMedicalId, _doctorMedicalId, _expiryDate, msg.sender);
    }
    
    /**
     * @dev Revoke access from a doctor
     * @param _doctorMedicalId Medical ID of the doctor to revoke access from
     */
    function revokeAccess(uint256 _doctorMedicalId)
        external
        onlyRegisteredPatient
        validMedicalId(_doctorMedicalId)
    {
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(patientMedicalId != 0, "Patient not registered");
        
        patientAccess[patientMedicalId][_doctorMedicalId].hasAccess = false;
        
        emit AccessRevoked(patientMedicalId, _doctorMedicalId, msg.sender);
    }
    
    /**
     * @dev Toggle emergency access (allows any doctor to access in emergencies)
     * @param _enabled Whether to enable or disable emergency access
     */
    function toggleEmergencyAccess(bool _enabled) external onlyRegisteredPatient {
        uint256 patientMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(patientMedicalId != 0, "Patient not registered");
        
        emergencyAccess[patientMedicalId] = _enabled;
        
        emit EmergencyAccessToggled(patientMedicalId, _enabled, msg.sender);
    }
    
    /**
     * @dev Get patient's complete medical history
     * @param _patientMedicalId Medical ID of the patient
     * @return recordIds Array of record IDs
     */
    function getPatientHistory(uint256 _patientMedicalId)
        external
        view
        validMedicalId(_patientMedicalId)
        returns (uint256[] memory recordIds)
    {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Patient can always access their own records
        if (callerMedicalId == _patientMedicalId) {
            return patientRecords[_patientMedicalId];
        }
        
        // Check if caller is a doctor with access
        require(
            _hasAccessToPatient(_patientMedicalId, callerMedicalId) ||
            emergencyAccess[_patientMedicalId],
            "No access to patient records"
        );
        
        return _getActiveRecords(_patientMedicalId);
    }
    
    /**
     * @dev Get a specific medical record
     * @param _recordId ID of the record to retrieve
     * @return record The medical record
     */
    function getRecord(uint256 _recordId)
        external
        view
        validRecordId(_recordId)
        returns (MedicalRecord memory record)
    {
        record = medicalRecords[_recordId];
        require(record.status != RecordStatus.Deleted, "Record has been deleted");
        
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Patient can always access their own records
        if (callerMedicalId == record.patientMedicalId) {
            return record;
        }
        
        // Check if caller is a doctor with access
        require(
            _hasAccessToPatient(record.patientMedicalId, callerMedicalId) ||
            emergencyAccess[record.patientMedicalId],
            "No access to this record"
        );
        
        return record;
    }
    
    /**
     * @dev Check if a doctor has access to a patient's records
     * @param _patientMedicalId Medical ID of the patient
     * @param _doctorMedicalId Medical ID of the doctor
     * @return hasAccess Whether the doctor has access
     * @return expiryDate When the access expires (0 if no expiry)
     */
    function checkAccess(uint256 _patientMedicalId, uint256 _doctorMedicalId)
        external
        view
        returns (bool hasAccess, uint256 expiryDate)
    {
        AccessPermission storage permission = patientAccess[_patientMedicalId][_doctorMedicalId];
        
        if (!permission.hasAccess) {
            return (false, 0);
        }
        
        if (permission.expiryDate != 0 && permission.expiryDate <= block.timestamp) {
            return (false, permission.expiryDate);
        }
        
        return (true, permission.expiryDate);
    }
    
    /**
     * @dev Get records by type for a patient
     * @param _patientMedicalId Medical ID of the patient
     * @param _recordType Type of records to filter
     * @return recordIds Array of record IDs of the specified type
     */
    function getRecordsByType(uint256 _patientMedicalId, RecordType _recordType)
        external
        view
        validMedicalId(_patientMedicalId)
        returns (uint256[] memory recordIds)
    {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Check access permissions
        require(
            callerMedicalId == _patientMedicalId ||
            _hasAccessToPatient(_patientMedicalId, callerMedicalId) ||
            emergencyAccess[_patientMedicalId],
            "No access to patient records"
        );
        
        uint256[] memory allRecords = patientRecords[_patientMedicalId];
        uint256[] memory filteredRecords = new uint256[](allRecords.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allRecords.length; i++) {
            MedicalRecord storage record = medicalRecords[allRecords[i]];
            if (record.recordType == _recordType && record.status != RecordStatus.Deleted) {
                filteredRecords[count] = allRecords[i];
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = filteredRecords[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get total number of records
     * @return count The total count of records
     */
    function getTotalRecords() external view returns (uint256 count) {
        return _recordIdCounter.current();
    }
    
    /**
     * @dev Internal function to check if a doctor has access to a patient
     */
    function _hasAccessToPatient(uint256 _patientMedicalId, uint256 _doctorMedicalId)
        internal
        view
        returns (bool)
    {
        AccessPermission storage permission = patientAccess[_patientMedicalId][_doctorMedicalId];
        
        if (!permission.hasAccess) {
            return false;
        }
        
        if (permission.expiryDate != 0 && permission.expiryDate <= block.timestamp) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Internal function to get only active records for a patient
     */
    function _getActiveRecords(uint256 _patientMedicalId)
        internal
        view
        returns (uint256[] memory)
    {
        uint256[] memory allRecords = patientRecords[_patientMedicalId];
        uint256[] memory activeRecords = new uint256[](allRecords.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allRecords.length; i++) {
            if (medicalRecords[allRecords[i]].status != RecordStatus.Deleted) {
                activeRecords[count] = allRecords[i];
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeRecords[i];
        }
        
        return result;
    }
}