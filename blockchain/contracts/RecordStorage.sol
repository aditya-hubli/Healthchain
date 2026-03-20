// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RoleManager.sol";
import "./AccessControl.sol";
import "./AuditTrail.sol";

contract RecordStorage {
    struct MedicalRecord {
        uint256 id;
        address patient;
        address doctor;
        string diagnosis;
        string prescription;
        string notes;
        string ipfsHash;
        uint256 createdAt;
    }

    RoleManager public roleManager;
    AccessControl public accessControl;
    AuditTrail public auditTrail;

    MedicalRecord[] public records;
    mapping(address => uint256[]) private patientRecords;

    event RecordCreated(uint256 indexed id, address indexed patient, address indexed doctor);

    modifier onlyDoctor() {
        require(
            roleManager.getRole(msg.sender) == RoleManager.Role.Doctor,
            "Only doctor"
        );
        _;
    }

    constructor(address _roleManager, address _accessControl, address _auditTrail) {
        roleManager = RoleManager(_roleManager);
        accessControl = AccessControl(_accessControl);
        auditTrail = AuditTrail(_auditTrail);
    }

    function createRecord(
        address _patient,
        string calldata _diagnosis,
        string calldata _prescription,
        string calldata _notes,
        string calldata _ipfsHash
    ) external onlyDoctor {
        require(
            accessControl.hasAccess(_patient, msg.sender),
            "No access to this patient"
        );

        uint256 id = records.length;
        records.push(MedicalRecord({
            id: id,
            patient: _patient,
            doctor: msg.sender,
            diagnosis: _diagnosis,
            prescription: _prescription,
            notes: _notes,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp
        }));

        patientRecords[_patient].push(id);

        auditTrail.log(
            AuditTrail.ActionType.RECORD_CREATED,
            msg.sender,
            _patient,
            "Medical record created"
        );

        emit RecordCreated(id, _patient, msg.sender);
    }

    function getRecord(uint256 _id) external view returns (MedicalRecord memory) {
        require(_id < records.length, "Record does not exist");
        return records[_id];
    }

    function getPatientRecordIds(address _patient) external view returns (uint256[] memory) {
        return patientRecords[_patient];
    }

    function getTotalRecords() external view returns (uint256) {
        return records.length;
    }
}
