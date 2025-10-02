// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IdentityManagement.sol";

/**
 * @title PrescriptionManagement
 * @dev Smart contract for managing prescriptions in the Algerian Medical Passport system
 */
contract PrescriptionManagement is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Reference to the Identity Management contract
    IdentityManagement public identityContract;
    
    // Role definitions
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    // Counter for unique prescription IDs
    Counters.Counter private _prescriptionIdCounter;
    
    // Enum for prescription status
    enum PrescriptionStatus {
        Active,
        PartiallyDispensed,
        Dispensed,
        Expired,
        Cancelled
    }
    
    // Enum for medication urgency
    enum Urgency {
        Normal,
        Urgent,
        Critical
    }
    
    // Structure for medication information
    struct Medication {
        string name;
        string dosage;
        string frequency;
        uint256 quantity;
        uint256 quantityDispensed;
        string instructions;
        string genericAlternatives; // Comma-separated list
    }
    
    // Structure for prescription
    struct Prescription {
        uint256 prescriptionId;
        uint256 patientMedicalId;
        uint256 doctorMedicalId;
        PrescriptionStatus status;
        Urgency urgency;
        Medication[] medications;
        string diagnosis;
        string additionalInstructions;
        uint256 issuedDate;
        uint256 expiryDate;
        uint256 lastDispensedDate;
        address issuedBy;
        bool allowGenericSubstitution;
        uint256 maxRefills;
        uint256 refillsUsed;
    }
    
    // Structure for dispensing record
    struct DispensingRecord {
        uint256 prescriptionId;
        uint256 pharmacyMedicalId;
        uint256 medicationIndex;
        uint256 quantityDispensed;
        string actualMedication; // What was actually dispensed (in case of generic substitution)
        uint256 dispensedDate;
        address dispensedBy;
        string pharmacistNotes;
    }
    
    // Mappings
    mapping(uint256 => Prescription) public prescriptions;
    mapping(uint256 => uint256[]) public patientPrescriptions; // patientMedicalId => prescriptionIds[]
    mapping(uint256 => uint256[]) public doctorPrescriptions; // doctorMedicalId => prescriptionIds[]
    mapping(uint256 => DispensingRecord[]) public dispensingHistory; // prescriptionId => DispensingRecord[]
    mapping(uint256 => mapping(uint256 => bool)) public pharmacyAccess; // prescriptionId => pharmacyMedicalId => hasAccess
    
    // Events
    event PrescriptionIssued(
        uint256 indexed prescriptionId,
        uint256 indexed patientMedicalId,
        uint256 indexed doctorMedicalId,
        uint256 expiryDate,
        address issuedBy
    );
    
    event PrescriptionDispensed(
        uint256 indexed prescriptionId,
        uint256 indexed pharmacyMedicalId,
        uint256 medicationIndex,
        uint256 quantityDispensed,
        address dispensedBy
    );
    
    event PrescriptionStatusUpdated(
        uint256 indexed prescriptionId,
        PrescriptionStatus oldStatus,
        PrescriptionStatus newStatus,
        address updatedBy
    );
    
    event PrescriptionCancelled(
        uint256 indexed prescriptionId,
        address cancelledBy,
        string reason
    );
    
    event PharmacyAccessGranted(
        uint256 indexed prescriptionId,
        uint256 indexed pharmacyMedicalId,
        address grantedBy
    );
    
    // Modifiers
    modifier onlyRegisteredDoctor() {
        require(hasRole(DOCTOR_ROLE, msg.sender), "Caller is not a registered doctor");
        _;
    }
    
    modifier onlyRegisteredPharmacy() {
        require(hasRole(PHARMACY_ROLE, msg.sender), "Caller is not a registered pharmacy");
        _;
    }
    
    modifier onlyRegisteredPatient() {
        require(hasRole(PATIENT_ROLE, msg.sender), "Caller is not a registered patient");
        _;
    }
    
    modifier validPrescriptionId(uint256 _prescriptionId) {
        require(_prescriptionId > 0 && _prescriptionId <= _prescriptionIdCounter.current(), "Invalid prescription ID");
        _;
    }
    
    modifier validMedicalId(uint256 _medicalId) {
        (bool isValid, , ) = identityContract.verifyIdentity(_medicalId);
        require(isValid, "Invalid medical ID");
        _;
    }
    
    modifier prescriptionNotExpired(uint256 _prescriptionId) {
        require(prescriptions[_prescriptionId].expiryDate > block.timestamp, "Prescription has expired");
        _;
    }
    
    modifier prescriptionActive(uint256 _prescriptionId) {
        require(
            prescriptions[_prescriptionId].status == PrescriptionStatus.Active ||
            prescriptions[_prescriptionId].status == PrescriptionStatus.PartiallyDispensed,
            "Prescription is not active"
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
     * @dev Issue a new prescription
     * @param _patientMedicalId Medical ID of the patient
     * @param _medications Array of medications to prescribe
     * @param _diagnosis The medical diagnosis
     * @param _additionalInstructions Additional instructions for the patient
     * @param _expiryDate When the prescription expires
     * @param _urgency Urgency level of the prescription
     * @param _allowGenericSubstitution Whether generic substitution is allowed
     * @param _maxRefills Maximum number of refills allowed
     */
    function issuePrescription(
        uint256 _patientMedicalId,
        Medication[] memory _medications,
        string memory _diagnosis,
        string memory _additionalInstructions,
        uint256 _expiryDate,
        Urgency _urgency,
        bool _allowGenericSubstitution,
        uint256 _maxRefills
    ) external onlyRegisteredDoctor validMedicalId(_patientMedicalId) nonReentrant returns (uint256) {
        uint256 doctorMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(doctorMedicalId != 0, "Doctor not registered");
        require(_medications.length > 0, "At least one medication required");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");
        require(bytes(_diagnosis).length > 0, "Diagnosis required");
        
        // Validate medications
        for (uint256 i = 0; i < _medications.length; i++) {
            require(bytes(_medications[i].name).length > 0, "Medication name required");
            require(bytes(_medications[i].dosage).length > 0, "Dosage required");
            require(bytes(_medications[i].frequency).length > 0, "Frequency required");
            require(_medications[i].quantity > 0, "Quantity must be greater than zero");
        }
        
        _prescriptionIdCounter.increment();
        uint256 newPrescriptionId = _prescriptionIdCounter.current();
        
        // Create the prescription struct step by step to avoid array copying issues
        Prescription storage newPrescription = prescriptions[newPrescriptionId];
        newPrescription.prescriptionId = newPrescriptionId;
        newPrescription.patientMedicalId = _patientMedicalId;
        newPrescription.doctorMedicalId = doctorMedicalId;
        newPrescription.status = PrescriptionStatus.Active;
        newPrescription.urgency = _urgency;
        newPrescription.diagnosis = _diagnosis;
        newPrescription.additionalInstructions = _additionalInstructions;
        newPrescription.issuedDate = block.timestamp;
        newPrescription.expiryDate = _expiryDate;
        newPrescription.lastDispensedDate = 0;
        newPrescription.issuedBy = msg.sender;
        newPrescription.allowGenericSubstitution = _allowGenericSubstitution;
        newPrescription.maxRefills = _maxRefills;
        newPrescription.refillsUsed = 0;
        
        // Add medications to the prescription
        for (uint256 i = 0; i < _medications.length; i++) {
            newPrescription.medications.push(_medications[i]);
        }
        
        patientPrescriptions[_patientMedicalId].push(newPrescriptionId);
        doctorPrescriptions[doctorMedicalId].push(newPrescriptionId);
        
        emit PrescriptionIssued(newPrescriptionId, _patientMedicalId, doctorMedicalId, _expiryDate, msg.sender);
        
        return newPrescriptionId;
    }
    
    /**
     * @dev Verify and dispense medication from a prescription
     * @param _prescriptionId ID of the prescription
     * @param _medicationIndex Index of the medication in the prescription
     * @param _quantityToDispense Quantity to dispense
     * @param _actualMedication What was actually dispensed (for generic substitution)
     * @param _pharmacistNotes Any notes from the pharmacist
     */
    function dispenseMedication(
        uint256 _prescriptionId,
        uint256 _medicationIndex,
        uint256 _quantityToDispense,
        string memory _actualMedication,
        string memory _pharmacistNotes
    ) external onlyRegisteredPharmacy 
       validPrescriptionId(_prescriptionId)
       prescriptionNotExpired(_prescriptionId)
       prescriptionActive(_prescriptionId)
       nonReentrant {
        
        uint256 pharmacyMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        require(pharmacyMedicalId != 0, "Pharmacy not registered");
        
        Prescription storage prescription = prescriptions[_prescriptionId];
        require(_medicationIndex < prescription.medications.length, "Invalid medication index");
        
        Medication storage medication = prescription.medications[_medicationIndex];
        require(_quantityToDispense > 0, "Quantity must be greater than zero");
        require(
            medication.quantityDispensed + _quantityToDispense <= medication.quantity,
            "Cannot dispense more than prescribed"
        );
        
        // Update medication quantity
        medication.quantityDispensed += _quantityToDispense;
        prescription.lastDispensedDate = block.timestamp;
        
        // Create dispensing record
        dispensingHistory[_prescriptionId].push(DispensingRecord({
            prescriptionId: _prescriptionId,
            pharmacyMedicalId: pharmacyMedicalId,
            medicationIndex: _medicationIndex,
            quantityDispensed: _quantityToDispense,
            actualMedication: _actualMedication,
            dispensedDate: block.timestamp,
            dispensedBy: msg.sender,
            pharmacistNotes: _pharmacistNotes
        }));
        
        // Update prescription status
        _updatePrescriptionStatus(_prescriptionId);
        
        emit PrescriptionDispensed(_prescriptionId, pharmacyMedicalId, _medicationIndex, _quantityToDispense, msg.sender);
    }
    
    /**
     * @dev Verify a prescription before dispensing
     * @param _prescriptionId ID of the prescription to verify
     * @return isValid Whether the prescription is valid for dispensing
     * @return prescription The prescription details
     */
    function verifyPrescription(uint256 _prescriptionId)
        external
        view
        validPrescriptionId(_prescriptionId)
        returns (bool isValid, Prescription memory prescription)
    {
        prescription = prescriptions[_prescriptionId];
        
        // Check if prescription is valid for dispensing
        isValid = (
            prescription.status == PrescriptionStatus.Active ||
            prescription.status == PrescriptionStatus.PartiallyDispensed
        ) && prescription.expiryDate > block.timestamp;
        
        return (isValid, prescription);
    }
    
    /**
     * @dev Cancel a prescription (only by the issuing doctor)
     * @param _prescriptionId ID of the prescription to cancel
     * @param _reason Reason for cancellation
     */
    function cancelPrescription(uint256 _prescriptionId, string memory _reason)
        external
        onlyRegisteredDoctor
        validPrescriptionId(_prescriptionId)
    {
        Prescription storage prescription = prescriptions[_prescriptionId];
        uint256 doctorMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(prescription.doctorMedicalId == doctorMedicalId, "Only issuing doctor can cancel");
        require(
            prescription.status != PrescriptionStatus.Cancelled,
            "Prescription already cancelled"
        );
        require(bytes(_reason).length > 0, "Cancellation reason required");
        
        PrescriptionStatus oldStatus = prescription.status;
        prescription.status = PrescriptionStatus.Cancelled;
        
        emit PrescriptionStatusUpdated(_prescriptionId, oldStatus, PrescriptionStatus.Cancelled, msg.sender);
        emit PrescriptionCancelled(_prescriptionId, msg.sender, _reason);
    }
    
    /**
     * @dev Grant pharmacy access to dispense a prescription
     * @param _prescriptionId ID of the prescription
     * @param _pharmacyMedicalId Medical ID of the pharmacy
     */
    function grantPharmacyAccess(uint256 _prescriptionId, uint256 _pharmacyMedicalId)
        external
        validPrescriptionId(_prescriptionId)
        validMedicalId(_pharmacyMedicalId)
    {
        Prescription storage prescription = prescriptions[_prescriptionId];
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Only patient or issuing doctor can grant pharmacy access
        require(
            callerMedicalId == prescription.patientMedicalId ||
            callerMedicalId == prescription.doctorMedicalId,
            "Only patient or doctor can grant pharmacy access"
        );
        
        // Verify that the target is actually a pharmacy
        (, IdentityManagement.EntityType entityType, ) = identityContract.verifyIdentity(_pharmacyMedicalId);
        require(entityType == IdentityManagement.EntityType.Pharmacy, "Target is not a pharmacy");
        
        pharmacyAccess[_prescriptionId][_pharmacyMedicalId] = true;
        
        emit PharmacyAccessGranted(_prescriptionId, _pharmacyMedicalId, msg.sender);
    }
    
    /**
     * @dev Get patient's prescription history
     * @param _patientMedicalId Medical ID of the patient
     * @return prescriptionIds Array of prescription IDs
     */
    function getPatientPrescriptions(uint256 _patientMedicalId)
        external
        view
        validMedicalId(_patientMedicalId)
        returns (uint256[] memory prescriptionIds)
    {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Patient can always access their own prescriptions
        require(
            callerMedicalId == _patientMedicalId ||
            hasRole(DOCTOR_ROLE, msg.sender) ||
            hasRole(PHARMACY_ROLE, msg.sender),
            "No access to patient prescriptions"
        );
        
        return patientPrescriptions[_patientMedicalId];
    }
    
    /**
     * @dev Get prescription details
     * @param _prescriptionId ID of the prescription
     * @return prescription The prescription details
     */
    function getPrescription(uint256 _prescriptionId)
        external
        view
        validPrescriptionId(_prescriptionId)
        returns (Prescription memory prescription)
    {
        prescription = prescriptions[_prescriptionId];
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Check access permissions
        require(
            callerMedicalId == prescription.patientMedicalId ||
            callerMedicalId == prescription.doctorMedicalId ||
            pharmacyAccess[_prescriptionId][callerMedicalId] ||
            hasRole(PHARMACY_ROLE, msg.sender),
            "No access to this prescription"
        );
        
        return prescription;
    }
    
    /**
     * @dev Get dispensing history for a prescription
     * @param _prescriptionId ID of the prescription
     * @return history Array of dispensing records
     */
    function getDispensingHistory(uint256 _prescriptionId)
        external
        view
        validPrescriptionId(_prescriptionId)
        returns (DispensingRecord[] memory history)
    {
        Prescription storage prescription = prescriptions[_prescriptionId];
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        // Check access permissions
        require(
            callerMedicalId == prescription.patientMedicalId ||
            callerMedicalId == prescription.doctorMedicalId ||
            hasRole(PHARMACY_ROLE, msg.sender),
            "No access to dispensing history"
        );
        
        return dispensingHistory[_prescriptionId];
    }
    
    /**
     * @dev Get prescriptions by status
     * @param _patientMedicalId Medical ID of the patient
     * @param _status Status to filter by
     * @return prescriptionIds Array of prescription IDs with the specified status
     */
    function getPrescriptionsByStatus(uint256 _patientMedicalId, PrescriptionStatus _status)
        external
        view
        validMedicalId(_patientMedicalId)
        returns (uint256[] memory prescriptionIds)
    {
        uint256 callerMedicalId = identityContract.getMedicalIdByAddress(msg.sender);
        
        require(
            callerMedicalId == _patientMedicalId ||
            hasRole(DOCTOR_ROLE, msg.sender) ||
            hasRole(PHARMACY_ROLE, msg.sender),
            "No access to patient prescriptions"
        );
        
        uint256[] memory allPrescriptions = patientPrescriptions[_patientMedicalId];
        uint256[] memory filteredPrescriptions = new uint256[](allPrescriptions.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allPrescriptions.length; i++) {
            if (prescriptions[allPrescriptions[i]].status == _status) {
                filteredPrescriptions[count] = allPrescriptions[i];
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = filteredPrescriptions[i];
        }
        
        return result;
    }
    
    /**
     * @dev Update prescription status automatically when needed
     */
    function updatePrescriptionStatus(uint256 _prescriptionId)
        external
        validPrescriptionId(_prescriptionId)
    {
        _updatePrescriptionStatus(_prescriptionId);
    }
    
    /**
     * @dev Get total number of prescriptions
     * @return count The total count of prescriptions
     */
    function getTotalPrescriptions() external view returns (uint256 count) {
        return _prescriptionIdCounter.current();
    }
    
    /**
     * @dev Internal function to update prescription status based on dispensing
     */
    function _updatePrescriptionStatus(uint256 _prescriptionId) internal {
        Prescription storage prescription = prescriptions[_prescriptionId];
        
        if (prescription.expiryDate <= block.timestamp) {
            if (prescription.status != PrescriptionStatus.Expired) {
                PrescriptionStatus oldStatus = prescription.status;
                prescription.status = PrescriptionStatus.Expired;
                emit PrescriptionStatusUpdated(_prescriptionId, oldStatus, PrescriptionStatus.Expired, address(this));
            }
            return;
        }
        
        bool fullyDispensed = true;
        bool partiallyDispensed = false;
        
        for (uint256 i = 0; i < prescription.medications.length; i++) {
            if (prescription.medications[i].quantityDispensed < prescription.medications[i].quantity) {
                fullyDispensed = false;
            }
            if (prescription.medications[i].quantityDispensed > 0) {
                partiallyDispensed = true;
            }
        }
        
        PrescriptionStatus newStatus;
        if (fullyDispensed) {
            newStatus = PrescriptionStatus.Dispensed;
        } else if (partiallyDispensed) {
            newStatus = PrescriptionStatus.PartiallyDispensed;
        } else {
            newStatus = PrescriptionStatus.Active;
        }
        
        if (newStatus != prescription.status) {
            PrescriptionStatus oldStatus = prescription.status;
            prescription.status = newStatus;
            emit PrescriptionStatusUpdated(_prescriptionId, oldStatus, newStatus, address(this));
        }
    }
}