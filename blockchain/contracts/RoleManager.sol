// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AuditTrail.sol";

contract RoleManager {
    enum Role { None, Admin, Doctor, Patient }

    address public admin;
    AuditTrail public auditTrail;
    mapping(address => Role) public roles;
    address[] public doctorList;
    address[] public patientList;

    event DoctorRegistered(address indexed doctor);
    event PatientRegistered(address indexed patient);

    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Only admin");
        _;
    }

    constructor(address _auditTrail) {
        admin = msg.sender;
        roles[msg.sender] = Role.Admin;
        auditTrail = AuditTrail(_auditTrail);
    }

    function registerDoctor(address _doctor) external onlyAdmin {
        require(roles[_doctor] == Role.None, "Address already has a role");
        roles[_doctor] = Role.Doctor;
        doctorList.push(_doctor);

        auditTrail.log(
            AuditTrail.ActionType.DOCTOR_REGISTERED,
            msg.sender,
            _doctor,
            "Doctor registered"
        );

        emit DoctorRegistered(_doctor);
    }

    function registerPatient() external {
        require(roles[msg.sender] == Role.None, "Address already has a role");
        roles[msg.sender] = Role.Patient;
        patientList.push(msg.sender);

        auditTrail.log(
            AuditTrail.ActionType.PATIENT_REGISTERED,
            msg.sender,
            msg.sender,
            "Patient registered"
        );

        emit PatientRegistered(msg.sender);
    }

    function getRole(address _addr) external view returns (Role) {
        return roles[_addr];
    }

    function getDoctorCount() external view returns (uint256) {
        return doctorList.length;
    }

    function getPatientCount() external view returns (uint256) {
        return patientList.length;
    }

    function getDoctors() external view returns (address[] memory) {
        return doctorList;
    }

    function getPatients() external view returns (address[] memory) {
        return patientList;
    }
}
