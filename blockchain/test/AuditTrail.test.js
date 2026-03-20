const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuditTrail", function () {
  let auditTrail, addr1, addr2;

  beforeEach(async function () {
    [addr1, addr2] = await ethers.getSigners();
    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.deploy();
    await auditTrail.waitForDeployment();
  });

  it("should log an audit entry", async function () {
    await expect(
      auditTrail.log(0, addr1.address, addr2.address, "Registered doctor")
    )
      .to.emit(auditTrail, "AuditLogged")
      .withArgs(0, 0, addr1.address, addr2.address);

    const entry = await auditTrail.getEntry(0);
    expect(entry.actionType).to.equal(0);
    expect(entry.performer).to.equal(addr1.address);
    expect(entry.subject).to.equal(addr2.address);
    expect(entry.details).to.equal("Registered doctor");
  });

  it("should track entries per user", async function () {
    await auditTrail.log(0, addr1.address, addr2.address, "Action 1");
    await auditTrail.log(1, addr2.address, addr1.address, "Action 2");

    const addr1Entries = await auditTrail.getUserAuditIds(addr1.address);
    expect(addr1Entries.length).to.equal(2);

    const addr2Entries = await auditTrail.getUserAuditIds(addr2.address);
    expect(addr2Entries.length).to.equal(2);
  });

  it("should return total entries", async function () {
    await auditTrail.log(0, addr1.address, addr2.address, "Test");
    expect(await auditTrail.getTotalEntries()).to.equal(1);
  });
});
