const hre = require("hardhat");

async function main() {
  // Check if we have signers available
  const signers = await hre.ethers.getSigners();
  
  if (signers.length === 0) {
    throw new Error(
      "No signers found. Please ensure you have configured a private key for this network.\n" +
      "For mainnet: Set MAINNET_PRIVATE_KEY or PRIVATE_KEY environment variable.\n" +
      "For testnet: Set TESTNET_PRIVATE_KEY or PRIVATE_KEY environment variable."
    );
  }
  
  const [deployer] = signers;
  
  if (!deployer) {
    throw new Error("Deployer is undefined. Check your network configuration and private key setup.");
  }

  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Available environment variables:");
  console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✓ Set" : "✗ Not set");
  console.log("- MAINNET_PRIVATE_KEY:", process.env.MAINNET_PRIVATE_KEY ? "✓ Set" : "✗ Not set");
  console.log("- TESTNET_PRIVATE_KEY:", process.env.TESTNET_PRIVATE_KEY ? "✓ Set" : "✗ Not set");
  console.log("- POLYGON_MAINNET_URL:", process.env.POLYGON_MAINNET_URL ? "✓ Set" : "✗ Not set");
  console.log("- POLYGONSCAN_API_KEY:", process.env.POLYGONSCAN_API_KEY ? "✓ Set" : "✗ Not set");
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy IdentityManagement contract first
  console.log("Deploying IdentityManagement contract...");
  const IdentityManagement = await hre.ethers.getContractFactory("IdentityManagement");
  const identityManagement = await IdentityManagement.deploy();
  await identityManagement.deployed();
  console.log("IdentityManagement deployed to:", identityManagement.address);

  // Deploy MedicalRecords contract
  console.log("Deploying MedicalRecords contract...");
  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const medicalRecords = await MedicalRecords.deploy(identityManagement.address);
  await medicalRecords.deployed();
  console.log("MedicalRecords deployed to:", medicalRecords.address);

  // Deploy PrescriptionManagement contract
  console.log("Deploying PrescriptionManagement contract...");
  const PrescriptionManagement = await hre.ethers.getContractFactory("PrescriptionManagement");
  const prescriptionManagement = await PrescriptionManagement.deploy(identityManagement.address);
  await prescriptionManagement.deployed();
  console.log("PrescriptionManagement deployed to:", prescriptionManagement.address);

  // Save contract addresses to a file for frontend use
  const contractAddresses = {
    IdentityManagement: identityManagement.address,
    MedicalRecords: medicalRecords.address,
    PrescriptionManagement: prescriptionManagement.address,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deploymentTime: new Date().toISOString()
  };

  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Write to network-specific file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(contractAddresses, null, 2));

  // Also write to a general addresses file
  const addressesFile = path.join(__dirname, "..", "contractAddresses.json");
  fs.writeFileSync(addressesFile, JSON.stringify(contractAddresses, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Deployer:", deployer.address);
  console.log("IdentityManagement:", identityManagement.address);
  console.log("MedicalRecords:", medicalRecords.address);
  console.log("PrescriptionManagement:", prescriptionManagement.address);
  console.log("Deployment file saved to:", deploymentFile);

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend configuration with these contract addresses");
  console.log("2. Grant appropriate roles to government, doctor, and pharmacy addresses");
  console.log("3. Set up initial test data (optional)");
  console.log("4. Configure backend API to use these contracts");

  // Verify contracts on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n=== Verifying contracts ===");
    
    try {
      console.log("Verifying IdentityManagement...");
      await hre.run("verify:verify", {
        address: identityManagement.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying IdentityManagement:", error.message);
    }

    try {
      console.log("Verifying MedicalRecords...");
      await hre.run("verify:verify", {
        address: medicalRecords.address,
        constructorArguments: [identityManagement.address],
      });
    } catch (error) {
      console.log("Error verifying MedicalRecords:", error.message);
    }

    try {
      console.log("Verifying PrescriptionManagement...");
      await hre.run("verify:verify", {
        address: prescriptionManagement.address,
        constructorArguments: [identityManagement.address],
      });
    } catch (error) {
      console.log("Error verifying PrescriptionManagement:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });