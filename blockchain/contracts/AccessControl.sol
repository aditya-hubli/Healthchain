// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RoleManager.sol";
import "./AuditTrail.sol";

contract AccessControl {
    struct Access {
        bool isGranted;
        uint256 grantedAt;
        uint256 expiresAt; // 0 = permanent
    }

    RoleManager public roleManager;
    AuditTrail public auditTrail;

    // patient => doctor => Access
    mapping(address => mapping(address => Access)) public accessMap;
    // patient => list of doctors they granted access to
    mapping(address => address[]) public patientDoctors;
    // doctor => list of patients who granted them access
    mapping(address => address[]) public doctorPatients;

    event AccessGranted(address indexed patient, address indexed doctor, uint256 expiresAt);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyPatient() {
        require(
            roleManager.getRole(msg.sender) == RoleManager.Role.Patient,
            "Only patient"
        );
        _;
    }

    constructor(address _roleManager, address _auditTrail) {
        roleManager = RoleManager(_roleManager);
        auditTrail = AuditTrail(_auditTrail);
    }

    function grantAccess(address _doctor, uint256 _durationSeconds) external onlyPatient {
        require(
            roleManager.getRole(_doctor) == RoleManager.Role.Doctor,
            "Address is not a doctor"
        );
        require(!accessMap[msg.sender][_doctor].isGranted, "Access already granted");

        uint256 expiresAt = _durationSeconds == 0
            ? 0
            : block.timestamp + _durationSeconds;

        accessMap[msg.sender][_doctor] = Access({
            isGranted: true,
            grantedAt: block.timestamp,
            expiresAt: expiresAt
        });

        patientDoctors[msg.sender].push(_doctor);
        doctorPatients[_doctor].push(msg.sender);

        auditTrail.log(
            AuditTrail.ActionType.ACCESS_GRANTED,
            msg.sender,
            _doctor,
            "Access granted"
        );

        emit AccessGranted(msg.sender, _doctor, expiresAt);
    }

    function revokeAccess(address _doctor) external onlyPatient {
        require(accessMap[msg.sender][_doctor].isGranted, "No access to revoke");

        accessMap[msg.sender][_doctor].isGranted = false;

        _removeFromArray(patientDoctors[msg.sender], _doctor);
        _removeFromArray(doctorPatients[_doctor], msg.sender);

        auditTrail.log(
            AuditTrail.ActionType.ACCESS_REVOKED,
            msg.sender,
            _doctor,
            "Access revoked"
        );

        emit AccessRevoked(msg.sender, _doctor);
    }

    function hasAccess(address _patient, address _doctor) external view returns (bool) {
        Access memory a = accessMap[_patient][_doctor];
        if (!a.isGranted) return false;
        if (a.expiresAt == 0) return true; // permanent
        return block.timestamp <= a.expiresAt;
    }

    function getPatientDoctors(address _patient) external view returns (address[] memory) {
        return patientDoctors[_patient];
    }

    function getDoctorPatients(address _doctor) external view returns (address[] memory) {
        return doctorPatients[_doctor];
    }

    function _removeFromArray(address[] storage arr, address _addr) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == _addr) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                return;
            }
        }
    }
}
