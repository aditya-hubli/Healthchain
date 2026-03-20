const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // 1. Deploy AuditTrail (no deps)
  const AuditTrail = await hre.ethers.getContractFactory("AuditTrail");
  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  const auditTrailAddr = await auditTrail.getAddress();
  console.log("AuditTrail deployed to:", auditTrailAddr);

  // 2. Deploy RoleManager (depends on AuditTrail)
  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy(auditTrailAddr);
  await roleManager.waitForDeployment();
  const roleManagerAddr = await roleManager.getAddress();
  console.log("RoleManager deployed to:", roleManagerAddr);

  // 3. Deploy AccessControl (depends on RoleManager + AuditTrail)
  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy(roleManagerAddr, auditTrailAddr);
  await accessControl.waitForDeployment();
  const accessControlAddr = await accessControl.getAddress();
  console.log("AccessControl deployed to:", accessControlAddr);

  // 4. Deploy RecordStorage (depends on RoleManager + AccessControl + AuditTrail)
  const RecordStorage = await hre.ethers.getContractFactory("RecordStorage");
  const recordStorage = await RecordStorage.deploy(roleManagerAddr, accessControlAddr, auditTrailAddr);
  await recordStorage.waitForDeployment();
  const recordStorageAddr = await recordStorage.getAddress();
  console.log("RecordStorage deployed to:", recordStorageAddr);

  console.log("\n--- Copy these to frontend/src/config/contracts.js ---");
  console.log(`ROLE_MANAGER: "${roleManagerAddr}"`);
  console.log(`AUDIT_TRAIL: "${auditTrailAddr}"`);
  console.log(`ACCESS_CONTROL: "${accessControlAddr}"`);
  console.log(`RECORD_STORAGE: "${recordStorageAddr}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
