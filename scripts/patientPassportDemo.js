const { ethers } = require("hardhat");

/**
 * Demo script showing Patient Passport functionality
 * Based on Hyperledger Fabric design adapted for Ethereum/Polygon
 */
async function main() {
    console.log("🏥 Algerian Medical Passport - Patient Passport Demo");
    console.log("====================================================\n");
    
    // Get signers (representing different stakeholders)
    // Note: deployer has government role by default
    const [deployer, government, hospital, clinic, pharmacy, doctor, patient1, patient2] = await ethers.getSigners();
    
    // Use deployer as government since they have the government role
    const governmentSigner = deployer;
    
    console.log("👥 Stakeholders:");
    console.log("  Government:", governmentSigner.address, "(Deployer with Gov Role)");
    console.log("  Hospital:  ", hospital.address);
    console.log("  Clinic:    ", clinic.address);
    console.log("  Pharmacy:  ", pharmacy.address);
    console.log("  Doctor:    ", doctor.address);
    console.log("  Patient 1: ", patient1.address);
    console.log("  Patient 2: ", patient2.address);
    console.log("");
    
    // Deploy IdentityManagement contract
    console.log("📋 Deploying IdentityManagement contract...");
    const IdentityManagement = await ethers.getContractFactory("IdentityManagement");
    const identityContract = await IdentityManagement.deploy();
    await identityContract.deployed();
    console.log("  ✅ IdentityManagement deployed at:", identityContract.address);
    
    // Deploy ConsentManagement contract
    console.log("📋 Deploying ConsentManagement contract...");
    const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
    const consentContract = await ConsentManagement.deploy(identityContract.address);
    await consentContract.deployed();
    console.log("  ✅ ConsentManagement deployed at:", consentContract.address);
    console.log("");
    
    // Step 1: Register organizations (similar to Hyperledger Fabric MSPs)
    console.log("🏛️  STEP 1: Register Healthcare Organizations");
    console.log("===========================================");
    
    // Register Hospital
    let tx = await identityContract.connect(governmentSigner).registerMedicalID(
        hospital.address,
        1, // EntityType.Hospital
        "ipfs://QmHospitalEncryptedData...",
        "hospital_public_key_123"
    );
    await tx.wait();
    console.log("  ✅ Hospital registered with medical ID: 1");
    
    // Update hospital credentials
    tx = await identityContract.connect(governmentSigner).updateProviderCredentials(
        1,
        "HOSP-ALG-001",
        "General Hospital",
        "",
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year validity
        "Accredited Level 1 Hospital"
    );
    await tx.wait();
    console.log("  ✅ Hospital credentials updated");
    
    // Register Clinic
    tx = await identityContract.connect(governmentSigner).registerMedicalID(
        clinic.address,
        2, // EntityType.Clinic
        "ipfs://QmClinicEncryptedData...",
        "clinic_public_key_456"
    );
    await tx.wait();
    console.log("  ✅ Clinic registered with medical ID: 2");
    
    // Register Pharmacy
    tx = await identityContract.connect(governmentSigner).registerMedicalID(
        pharmacy.address,
        3, // EntityType.Pharmacy
        "ipfs://QmPharmacyEncryptedData...",
        "pharmacy_public_key_789"
    );
    await tx.wait();
    console.log("  ✅ Pharmacy registered with medical ID: 3");
    
    // Register Doctor
    tx = await identityContract.connect(governmentSigner).registerMedicalID(
        doctor.address,
        4, // EntityType.Doctor
        "ipfs://QmDoctorEncryptedData...",
        "doctor_public_key_101112"
    );
    await tx.wait();
    console.log("  ✅ Doctor registered with medical ID: 4");
    
    // Update doctor credentials (belongs to hospital)
    tx = await identityContract.connect(governmentSigner).updateProviderCredentials(
        4,
        "DOC-ALG-001",
        "Cardiology",
        "HOSP-ALG-001", // facilityId - works at the hospital
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
        "Board Certified Cardiologist"
    );
    await tx.wait();
    console.log("  ✅ Doctor credentials updated (Cardiologist at Hospital)");
    console.log("");
    
    // Step 2: Register Patient Passports (Hyperledger Fabric style)
    console.log("🆔 STEP 2: Register Patient Passports");
    console.log("=====================================");
    
    // Register Patient 1 with complete passport information
    tx = await identityContract.connect(governmentSigner).registerPatientPassport(
        patient1.address,
        "DZ-213-000001", // Algerian format patient ID
        "Nassim",
        "Benyahia",
        "نسيم", // Arabic first name
        "بن يحيى", // Arabic last name
        "1994-07-18", // ISO-8601 birth date
        "O+", // Blood type
        "ipfs://QmPatient1ProfilePic...", // Profile picture URI
        "ab12cd34ef56...", // SHA-256 hash
        "AES-256-GCM", // Encryption method
        "patient1_public_key_131415"
    );
    let receipt = await tx.wait();
    console.log("  ✅ Patient 1 passport registered:");
    console.log("     Patient ID: DZ-213-000001");
    console.log("     Name: Nassim Benyahia (نسيم بن يحيى)");
    console.log("     Birth Date: 1994-07-18");
    console.log("     Blood Type: O+");
    console.log("     Medical ID: 5");
    
    // Register Patient 2
    tx = await identityContract.connect(governmentSigner).registerPatientPassport(
        patient2.address,
        "DZ-213-000002",
        "Amina",
        "Zeraoulia",
        "أمينة",
        "زراوليا",
        "1988-03-15",
        "A+",
        "ipfs://QmPatient2ProfilePic...",
        "cd34ef56ab12...",
        "AES-256-GCM",
        "patient2_public_key_161718"
    );
    await tx.wait();
    console.log("  ✅ Patient 2 passport registered:");
    console.log("     Patient ID: DZ-213-000002");
    console.log("     Name: Amina Zeraoulia (أمينة زراوليا)");
    console.log("     Medical ID: 6");
    console.log("");
    
    // Step 3: Patient Passport Verification (like Fabric chaincode queries)
    console.log("🔍 STEP 3: Verify Patient Passports");
    console.log("===================================");
    
    // Verify patient by Patient ID
    let [isValid, passport] = await identityContract.verifyPatientPassport("DZ-213-000001");
    console.log("  🔍 Verifying Patient ID: DZ-213-000001");
    console.log("     Valid:", isValid);
    if (isValid) {
        console.log("     Name:", passport.firstName, passport.lastName);
        console.log("     Arabic Name:", passport.firstNameAr, passport.lastNameAr);
        console.log("     Birth Date:", passport.birthDate);
        console.log("     Blood Type:", passport.bloodType);
        console.log("     Profile Picture URI:", passport.profilePic.uri);
    }
    console.log("");
    
    // Step 4: Consent Management (similar to PDC access control)
    console.log("📝 STEP 4: Consent Management (PDC-style Access Control)");
    console.log("=========================================================");
    
    // Patient 1 grants consent to doctor for clinical notes (like PDC clinicalNotes)
    tx = await consentContract.connect(patient1).grantConsent(
        4, // Doctor's medical ID
        1, // DataScope.ClinicalNotes
        Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days validity
        "Regular cardiology consultation and follow-up",
        true // Emergency override allowed
    );
    receipt = await tx.wait();
    console.log("  ✅ Patient 1 granted clinical notes access to Doctor");
    console.log("     Purpose: Regular cardiology consultation");
    console.log("     Valid for: 30 days");
    console.log("     Emergency override: Yes");
    
    // Patient 1 grants consent to pharmacy for prescriptions (like PDC prescriptions)
    tx = await consentContract.connect(patient1).grantConsent(
        3, // Pharmacy's medical ID
        2, // DataScope.Prescriptions
        0, // No expiry
        "Medication dispensing and refills",
        false
    );
    await tx.wait();
    console.log("  ✅ Patient 1 granted prescription access to Pharmacy");
    
    // Enable emergency access
    tx = await consentContract.connect(patient1).toggleEmergencyAccess(
        true,
        "In case of medical emergency at any healthcare facility"
    );
    await tx.wait();
    console.log("  ✅ Patient 1 enabled emergency access");
    console.log("");
    
    // Step 5: Access Control Verification (like Fabric consent enforcement)
    console.log("🔐 STEP 5: Access Control Verification");
    console.log("=====================================");
    
    // Check if doctor has access to patient's clinical notes
    let [hasAccess, consentId, expiryDate] = await consentContract.checkConsent(
        5, // Patient 1's medical ID
        4, // Doctor's medical ID  
        1  // DataScope.ClinicalNotes
    );
    console.log("  🔍 Checking Doctor's access to Patient 1's clinical notes:");
    console.log("     Has Access:", hasAccess);
    console.log("     Consent ID:", consentId);
    console.log("     Expires:", expiryDate > 0 ? new Date(expiryDate * 1000).toLocaleDateString() : "Never");
    
    // Check pharmacy access to prescriptions
    [hasAccess, consentId, expiryDate] = await consentContract.checkConsent(
        5, // Patient 1's medical ID
        3, // Pharmacy's medical ID
        2  // DataScope.Prescriptions
    );
    console.log("  🔍 Checking Pharmacy's access to Patient 1's prescriptions:");
    console.log("     Has Access:", hasAccess);
    console.log("     Expires:", expiryDate > 0 ? new Date(expiryDate * 1000).toLocaleDateString() : "Never");
    console.log("");
    
    // Step 6: Healthcare Provider Verification
    console.log("👨‍⚕️  STEP 6: Healthcare Provider Verification");
    console.log("============================================");
    
    // Check doctor's license validity
    let isLicenseValid = await identityContract.isProviderLicenseValid(4);
    console.log("  🔍 Doctor's license status:");
    console.log("     Valid:", isLicenseValid);
    
    // Get doctor's credentials
    let credentials = await identityContract.getProviderCredentials(4);
    console.log("     License Number:", credentials.licenseNumber);
    console.log("     Specialization:", credentials.specialization);
    console.log("     Facility ID:", credentials.facilityId);
    console.log("     Additional Certifications:", credentials.additionalCertifications);
    console.log("");
    
    // Step 7: Patient Profile Management
    console.log("👤 STEP 7: Patient Profile Management");
    console.log("====================================");
    
    // Government updates patient passport (for corrections)
    tx = await identityContract.connect(governmentSigner).updatePatientPassport(
        5, // Patient 1's medical ID
        "Nassim",
        "Benyahia",
        "نسيم",
        "بن يحيى",
        "O+", // Confirmed blood type
        "ipfs://QmNewPatientProfilePic...", // Updated profile picture
        "new_sha256_hash...",
        "AES-256-GCM"
    );
    await tx.wait();
    console.log("  ✅ Patient 1's passport updated by Government");
    
    // Get updated passport
    passport = await identityContract.getPatientPassport(5);
    console.log("  📋 Updated Patient Passport:");
    console.log("     Patient ID:", passport.patientId);
    console.log("     Full Name:", passport.firstName, passport.lastName, `(${passport.firstNameAr} ${passport.lastNameAr})`);
    console.log("     Blood Type:", passport.bloodType);
    console.log("     Updated Profile Picture:", passport.profilePic.uri);
    console.log("");
    
    // Step 8: System Statistics
    console.log("📊 STEP 8: System Statistics");
    console.log("============================");
    
    const totalIdentities = await identityContract.getTotalRegisteredIdentities();
    console.log("  📈 Total Registered Identities:", totalIdentities.toString());
    
    // Get patient's consents
    const patientConsents = await consentContract.getPatientConsents(5);
    console.log("  📝 Patient 1's Active Consents:", patientConsents.length);
    
    // Get provider's consents
    const providerConsents = await consentContract.getProviderConsents(4);
    console.log("  🏥 Doctor's Granted Consents:", providerConsents.length);
    console.log("");
    
    console.log("🎉 Demo completed successfully!");
    console.log("===============================");
    console.log("✅ Patient Passport system is working with Hyperledger Fabric features:");
    console.log("   • Patient Passport Asset structure (DZ-213-XXXXXX format)");
    console.log("   • Arabic name support");
    console.log("   • Blood type validation");
    console.log("   • IPFS profile picture metadata");
    console.log("   • Role-based access control (Government, Hospital, Clinic, Pharmacy, Doctor, Patient)");
    console.log("   • Consent management (similar to PDCs)");
    console.log("   • Emergency access controls");
    console.log("   • Healthcare provider credential verification");
    console.log("   • Government oversight and updates");
    console.log("");
}

// Run the demo
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Demo failed:", error);
        process.exit(1);
    });
