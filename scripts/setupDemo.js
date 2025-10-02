const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  console.log("Setting up demo data for Algerian Medical Passport System...");

  // Get deployed contract addresses
  let contractAddresses;
  try {
    contractAddresses = require("../contractAddresses.json");
  } catch (error) {
    console.error("Contract addresses not found. Please deploy contracts first.");
    process.exit(1);
  }

  const [deployer, government, doctor1, doctor2, pharmacy1, patient1, patient2, patient3] = await hre.ethers.getSigners();

  // Get contract instances
  const identityManagement = await hre.ethers.getContractAt("IdentityManagement", contractAddresses.IdentityManagement);
  const medicalRecords = await hre.ethers.getContractAt("MedicalRecords", contractAddresses.MedicalRecords);
  const prescriptionManagement = await hre.ethers.getContractAt("PrescriptionManagement", contractAddresses.PrescriptionManagement);

  console.log("Contract instances loaded successfully");

  // Entity types
  const EntityType = {
    Government: 0,
    Doctor: 1,
    Pharmacy: 2,
    Patient: 3
  };

  const RecordType = {
    Consultation: 0,
    Diagnosis: 1,
    Treatment: 2,
    Laboratory: 3,
    Imaging: 4,
    Surgery: 5,
    Prescription: 6,
    Vaccination: 7,
    Emergency: 8
  };

  const Urgency = {
    Normal: 0,
    Urgent: 1,
    Critical: 2
  };

  try {
    console.log("\n=== Setting up demo identities ===");

    // 1. Register Government (additional government address)
    console.log("Registering additional government address...");
    await identityManagement.registerMedicalID(
      government.address,
      EntityType.Government,
      "QmGovHash123", // IPFS hash would be real in production
      "gov-public-key-123"
    );
    console.log(`✓ Government registered with address: ${government.address}`);

    // 2. Register Doctors
    console.log("Registering doctors...");
    
    await identityManagement.registerMedicalID(
      doctor1.address,
      EntityType.Doctor,
      "QmDoc1Hash456",
      "doc1-public-key-456"
    );
    
    await identityManagement.registerMedicalID(
      doctor2.address,
      EntityType.Doctor,
      "QmDoc2Hash789",
      "doc2-public-key-789"
    );

    console.log(`✓ Doctor 1 registered: ${doctor1.address}`);
    console.log(`✓ Doctor 2 registered: ${doctor2.address}`);

    // 3. Add credentials for doctors
    console.log("Adding doctor credentials...");
    
    const futureDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 * 2; // 2 years from now

    await identityManagement.updateProviderCredentials(
      2, // doctor1's medical ID
      "DOC001-ALG",
      "Cardiology",
      futureDate
    );

    await identityManagement.updateProviderCredentials(
      3, // doctor2's medical ID
      "DOC002-ALG", 
      "General Practice",
      futureDate
    );

    console.log("✓ Doctor credentials added");

    // 4. Register Pharmacy
    console.log("Registering pharmacy...");
    
    await identityManagement.registerMedicalID(
      pharmacy1.address,
      EntityType.Pharmacy,
      "QmPharmHash321",
      "pharm-public-key-321"
    );

    await identityManagement.updateProviderCredentials(
      4, // pharmacy's medical ID
      "PHARM001-ALG",
      "General Pharmacy",
      futureDate
    );

    console.log(`✓ Pharmacy registered: ${pharmacy1.address}`);

    // 5. Register Patients
    console.log("Registering patients...");
    
    const patients = [
      { signer: patient1, name: "Patient 1" },
      { signer: patient2, name: "Patient 2" },
      { signer: patient3, name: "Patient 3" }
    ];

    for (let i = 0; i < patients.length; i++) {
      await identityManagement.registerMedicalID(
        patients[i].signer.address,
        EntityType.Patient,
        `QmPatient${i+1}Hash`,
        `patient${i+1}-public-key`
      );
      console.log(`✓ ${patients[i].name} registered: ${patients[i].signer.address}`);
    }

    console.log("\n=== Setting up access permissions ===");

    // Grant access from patients to doctors
    console.log("Setting up patient-doctor access permissions...");
    
    const oneMonthFromNow = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // Patient 1 grants access to Doctor 1
    await medicalRecords.connect(patient1).grantAccess(2, oneMonthFromNow); // doctor1's medical ID is 2
    
    // Patient 2 grants access to both doctors
    await medicalRecords.connect(patient2).grantAccess(2, oneMonthFromNow);
    await medicalRecords.connect(patient2).grantAccess(3, oneMonthFromNow); // doctor2's medical ID is 3
    
    // Patient 3 grants access to Doctor 2
    await medicalRecords.connect(patient3).grantAccess(3, oneMonthFromNow);

    console.log("✓ Patient-doctor access permissions configured");

    console.log("\n=== Creating sample medical records ===");

    // Create medical records
    const records = [
      {
        patient: 5, // patient1's medical ID
        doctor: doctor1,
        type: RecordType.Consultation,
        title: "Initial Consultation",
        summary: "First visit for chest pain evaluation"
      },
      {
        patient: 5, // patient1's medical ID
        doctor: doctor1,
        type: RecordType.Laboratory,
        title: "Blood Work Results",
        summary: "Complete blood count and lipid panel"
      },
      {
        patient: 6, // patient2's medical ID  
        doctor: doctor2,
        type: RecordType.Consultation,
        title: "Annual Check-up",
        summary: "Routine annual physical examination"
      },
      {
        patient: 6, // patient2's medical ID
        doctor: doctor1,
        type: RecordType.Diagnosis,
        title: "Hypertension Diagnosis", 
        summary: "Diagnosed with stage 1 hypertension"
      },
      {
        patient: 7, // patient3's medical ID
        doctor: doctor2,
        type: RecordType.Vaccination,
        title: "COVID-19 Booster",
        summary: "Administered COVID-19 booster vaccination"
      }
    ];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      await medicalRecords.connect(record.doctor).createRecord(
        record.patient,
        record.type,
        `QmMedicalRecord${i+1}Hash`, // IPFS hash for encrypted medical data
        record.title,
        record.summary
      );
      console.log(`✓ Created medical record: ${record.title} for Patient ${record.patient - 4}`);
    }

    console.log("\n=== Creating sample prescriptions ===");

    // Create sample prescriptions
    const prescriptions = [
      {
        patient: 5, // patient1
        doctor: doctor1,
        diagnosis: "Chest pain - rule out cardiac cause",
        medications: [
          {
            name: "Aspirin",
            dosage: "81mg",
            frequency: "Once daily",
            quantity: 30,
            quantityDispensed: 0,
            instructions: "Take with food",
            genericAlternatives: "Acetylsalicylic acid"
          }
        ],
        urgency: Urgency.Normal
      },
      {
        patient: 6, // patient2
        doctor: doctor1,
        diagnosis: "Hypertension Stage 1",
        medications: [
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            quantity: 90,
            quantityDispensed: 0,
            instructions: "Take at the same time each day",
            genericAlternatives: "ACE inhibitor"
          },
          {
            name: "Hydrochlorothiazide",
            dosage: "25mg", 
            frequency: "Once daily",
            quantity: 90,
            quantityDispensed: 0,
            instructions: "Take in the morning",
            genericAlternatives: "HCTZ"
          }
        ],
        urgency: Urgency.Normal
      }
    ];

    for (let i = 0; i < prescriptions.length; i++) {
      const prescription = prescriptions[i];
      const expiryDate = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60; // 3 months
      
      await prescriptionManagement.connect(prescription.doctor).issuePrescription(
        prescription.patient,
        prescription.medications,
        prescription.diagnosis,
        "Follow up in 2 weeks",
        expiryDate,
        prescription.urgency,
        true, // allow generic substitution
        2 // max refills
      );
      console.log(`✓ Created prescription for Patient ${prescription.patient - 4}: ${prescription.diagnosis}`);
    }

    console.log("\n=== Demo setup completed successfully! ===");

    // Summary
    console.log("\n📊 DEMO DATA SUMMARY:");
    console.log("👥 Identities Created:");
    console.log("   • 1 Additional Government Address");
    console.log("   • 2 Doctors (Cardiology, General Practice)");
    console.log("   • 1 Pharmacy");
    console.log("   • 3 Patients");
    console.log("");
    console.log("📋 Medical Records:");
    console.log("   • 5 Sample medical records across different types");
    console.log("   • Consultations, Lab results, Diagnoses, Vaccinations");
    console.log("");
    console.log("💊 Prescriptions:");
    console.log("   • 2 Active prescriptions");
    console.log("   • Multiple medications per prescription");
    console.log("");
    console.log("🔐 Access Control:");
    console.log("   • Patient-doctor relationships established");
    console.log("   • Time-limited access permissions");

    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Start the frontend: npm run dev:frontend");
    console.log("2. Start the backend: npm run dev:backend");
    console.log("3. Connect with different wallet addresses to test different roles");
    console.log("4. Test the complete workflow from consultation to prescription");

    // Save demo addresses for frontend
    const demoAddresses = {
      deployer: deployer.address,
      government: government.address,
      doctor1: doctor1.address,
      doctor2: doctor2.address,
      pharmacy1: pharmacy1.address,
      patient1: patient1.address,
      patient2: patient2.address,
      patient3: patient3.address,
      contracts: contractAddresses
    };

    const fs = require("fs");
    fs.writeFileSync("demoAddresses.json", JSON.stringify(demoAddresses, null, 2));
    console.log("\n📄 Demo addresses saved to demoAddresses.json");

  } catch (error) {
    console.error("Error setting up demo data:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });