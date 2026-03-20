const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecordStorage", function () {
  let roleManager, auditTrail, accessControl, recordStorage;
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

    const RecordStorage = await ethers.getContractFactory("RecordStorage");
    recordStorage = await RecordStorage.deploy(
      await roleManager.getAddress(),
      await accessControl.getAddress(),
      await auditTrail.getAddress()
    );
    await recordStorage.waitForDeployment();

    // Setup roles and access
    await roleManager.registerDoctor(doctor.address);
    await roleManager.connect(patient).registerPatient();
    await accessControl.connect(patient).grantAccess(doctor.address, 0);
  });

  it("should allow doctor to create a record", async function () {
    await expect(
      recordStorage
        .connect(doctor)
        .createRecord(patient.address, "Flu", "Rest", "Mild symptoms", "QmHash123")
    )
      .to.emit(recordStorage, "RecordCreated")
      .withArgs(0, patient.address, doctor.address);

    const record = await recordStorage.getRecord(0);
    expect(record.patient).to.equal(patient.address);
    expect(record.doctor).to.equal(doctor.address);
    expect(record.diagnosis).to.equal("Flu");
    expect(record.ipfsHash).to.equal("QmHash123");
  });

  it("should not allow doctor without access to create record", async function () {
    await accessControl.connect(patient).revokeAccess(doctor.address);
    await expect(
      recordStorage
        .connect(doctor)
        .createRecord(patient.address, "Flu", "Rest", "Notes", "QmHash")
    ).to.be.revertedWith("No access to this patient");
  });

  it("should not allow non-doctor to create record", async function () {
    await expect(
      recordStorage
        .connect(other)
        .createRecord(patient.address, "Flu", "Rest", "Notes", "QmHash")
    ).to.be.revertedWith("Only doctor");
  });

  it("should track patient record IDs", async function () {
    await recordStorage
      .connect(doctor)
      .createRecord(patient.address, "Flu", "Rest", "Notes", "QmHash1");
    await recordStorage
      .connect(doctor)
      .createRecord(patient.address, "Cold", "Meds", "Notes", "QmHash2");

    const ids = await recordStorage.getPatientRecordIds(patient.address);
    expect(ids.length).to.equal(2);
  });

  it("should return total records", async function () {
    await recordStorage
      .connect(doctor)
      .createRecord(patient.address, "Flu", "Rest", "Notes", "QmHash");
    expect(await recordStorage.getTotalRecords()).to.equal(1);
  });
});
