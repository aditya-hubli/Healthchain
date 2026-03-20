const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoleManager", function () {
  let roleManager, auditTrail, admin, doctor, patient, other;

  beforeEach(async function () {
    [admin, doctor, patient, other] = await ethers.getSigners();

    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.deploy();
    await auditTrail.waitForDeployment();

    const RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy(await auditTrail.getAddress());
    await roleManager.waitForDeployment();
  });

  it("should set deployer as admin", async function () {
    expect(await roleManager.getRole(admin.address)).to.equal(1);
    expect(await roleManager.admin()).to.equal(admin.address);
  });

  it("should allow admin to register a doctor", async function () {
    await expect(roleManager.registerDoctor(doctor.address))
      .to.emit(roleManager, "DoctorRegistered")
      .withArgs(doctor.address);
    expect(await roleManager.getRole(doctor.address)).to.equal(2);
    expect(await roleManager.getDoctorCount()).to.equal(1);
  });

  it("should log doctor registration to audit trail", async function () {
    await roleManager.registerDoctor(doctor.address);
    const entry = await auditTrail.getEntry(0);
    expect(entry.actionType).to.equal(0); // DOCTOR_REGISTERED
    expect(entry.performer).to.equal(admin.address);
    expect(entry.subject).to.equal(doctor.address);
  });

  it("should allow anyone to register as patient", async function () {
    await expect(roleManager.connect(patient).registerPatient())
      .to.emit(roleManager, "PatientRegistered")
      .withArgs(patient.address);
    expect(await roleManager.getRole(patient.address)).to.equal(3);
    expect(await roleManager.getPatientCount()).to.equal(1);
  });

  it("should log patient registration to audit trail", async function () {
    await roleManager.connect(patient).registerPatient();
    const entry = await auditTrail.getEntry(0);
    expect(entry.actionType).to.equal(1); // PATIENT_REGISTERED
    expect(entry.performer).to.equal(patient.address);
  });

  it("should not allow non-admin to register doctor", async function () {
    await expect(
      roleManager.connect(other).registerDoctor(doctor.address)
    ).to.be.revertedWith("Only admin");
  });

  it("should not allow double registration", async function () {
    await roleManager.connect(patient).registerPatient();
    await expect(
      roleManager.connect(patient).registerPatient()
    ).to.be.revertedWith("Address already has a role");
  });

  it("should return doctor and patient lists", async function () {
    await roleManager.registerDoctor(doctor.address);
    await roleManager.connect(patient).registerPatient();
    const doctors = await roleManager.getDoctors();
    const patients = await roleManager.getPatients();
    expect(doctors).to.include(doctor.address);
    expect(patients).to.include(patient.address);
  });
});
