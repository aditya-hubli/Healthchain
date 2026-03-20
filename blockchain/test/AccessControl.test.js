const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
  let roleManager, auditTrail, accessControl;
  let admin, doctor, patient, other;

  beforeEach(async function () {
    [admin, doctor, patient, other] = await ethers.getSigners();

    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.deploy();
    await auditTrail.waitForDeployment();

    const RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy(await auditTrail.getAddress());
    await roleManager.waitForDeployment();

    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy(
      await roleManager.getAddress(),
      await auditTrail.getAddress()
    );
    await accessControl.waitForDeployment();

    await roleManager.registerDoctor(doctor.address);
    await roleManager.connect(patient).registerPatient();
  });

  it("should allow patient to grant access to doctor", async function () {
    await expect(
      accessControl.connect(patient).grantAccess(doctor.address, 0)
    )
      .to.emit(accessControl, "AccessGranted")
      .withArgs(patient.address, doctor.address, 0);

    expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.true;
  });

  it("should allow patient to revoke access", async function () {
    await accessControl.connect(patient).grantAccess(doctor.address, 0);
    await expect(
      accessControl.connect(patient).revokeAccess(doctor.address)
    )
      .to.emit(accessControl, "AccessRevoked")
      .withArgs(patient.address, doctor.address);

    expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.false;
  });

  it("should not allow non-patient to grant access", async function () {
    await expect(
      accessControl.connect(other).grantAccess(doctor.address, 0)
    ).to.be.revertedWith("Only patient");
  });

  it("should not allow granting access to non-doctor", async function () {
    await expect(
      accessControl.connect(patient).grantAccess(other.address, 0)
    ).to.be.revertedWith("Address is not a doctor");
  });

  it("should track patient-doctor relationships", async function () {
    await accessControl.connect(patient).grantAccess(doctor.address, 0);

    const doctors = await accessControl.getPatientDoctors(patient.address);
    expect(doctors).to.include(doctor.address);

    const patients = await accessControl.getDoctorPatients(doctor.address);
    expect(patients).to.include(patient.address);
  });

  it("should handle timed access expiry", async function () {
    await accessControl.connect(patient).grantAccess(doctor.address, 1);
    expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.true;

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.false;
  });
});
