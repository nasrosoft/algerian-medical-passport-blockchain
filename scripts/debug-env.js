const hre = require("hardhat");

async function main() {
  console.log("=== Environment Debug Info ===");
  console.log("Network:", hre.network.name);
  console.log("Arguments:", process.argv.slice(2));
  
  console.log("\n=== Environment Variables ===");
  console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? `Set (length: ${process.env.PRIVATE_KEY.length})` : "not set");
  console.log("MAINNET_PRIVATE_KEY:", process.env.MAINNET_PRIVATE_KEY ? `Set (length: ${process.env.MAINNET_PRIVATE_KEY.length})` : "not set");
  console.log("TESTNET_PRIVATE_KEY:", process.env.TESTNET_PRIVATE_KEY ? `Set (length: ${process.env.TESTNET_PRIVATE_KEY.length})` : "not set");
  console.log("POLYGON_MAINNET_URL:", process.env.POLYGON_MAINNET_URL ? "Set" : "not set");
  console.log("POLYGON_URL:", process.env.POLYGON_URL ? "Set" : "not set");
  console.log("POLYGONSCAN_API_KEY:", process.env.POLYGONSCAN_API_KEY ? "Set" : "not set");
  
  console.log("\n=== Network Configuration ===");
  console.log("Network config accounts:", hre.network.config.accounts ? hre.network.config.accounts.length : 0, "accounts");
  
  console.log("\n=== Testing Signers ===");
  try {
    const signers = await hre.ethers.getSigners();
    console.log("Signers found:", signers.length);
    if (signers.length > 0 && signers[0]) {
      console.log("First signer address:", signers[0].address);
      console.log("SUCCESS: Deployment should work");
    } else {
      console.log("ERROR: No valid signers found");
    }
  } catch (error) {
    console.log("ERROR getting signers:", error.message);
    console.log("This is likely why deployment fails");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Debug script failed:", error);
    process.exit(1);
  });
