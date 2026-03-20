// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditTrail {
    enum ActionType {
        DOCTOR_REGISTERED,
        PATIENT_REGISTERED,
        ACCESS_GRANTED,
        ACCESS_REVOKED,
        RECORD_CREATED,
        RECORD_VIEWED
    }

    struct AuditEntry {
        uint256 id;
        ActionType actionType;
        address performer;
        address subject;
        string details;
        uint256 timestamp;
    }

    AuditEntry[] public entries;
    mapping(address => uint256[]) private userEntries;

    event AuditLogged(uint256 indexed id, ActionType actionType, address indexed performer, address indexed subject);

    function log(
        ActionType _actionType,
        address _performer,
        address _subject,
        string calldata _details
    ) external {
        uint256 id = entries.length;
        entries.push(AuditEntry({
            id: id,
            actionType: _actionType,
            performer: _performer,
            subject: _subject,
            details: _details,
            timestamp: block.timestamp
        }));
        userEntries[_performer].push(id);
        if (_subject != _performer) {
            userEntries[_subject].push(id);
        }
        emit AuditLogged(id, _actionType, _performer, _subject);
    }

    function getEntry(uint256 _id) external view returns (AuditEntry memory) {
        require(_id < entries.length, "Entry does not exist");
        return entries[_id];
    }

    function getUserAuditIds(address _user) external view returns (uint256[] memory) {
        return userEntries[_user];
    }

    function getAllEntryIds() external view returns (uint256) {
        return entries.length;
    }

    function getTotalEntries() external view returns (uint256) {
        return entries.length;
    }
}
