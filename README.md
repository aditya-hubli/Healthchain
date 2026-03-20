# Blockchain-Based Healthcare Data Management System

A decentralized healthcare data management system built on Ethereum that allows patients to control access to their medical records, doctors to create records with patient consent, and admins to manage the system — all enforced by smart contracts.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [MetaMask Setup](#metamask-setup)
- [IPFS / Pinata Setup](#ipfs--pinata-setup)
- [End-to-End Test Flow](#end-to-end-test-flow)
- [Running Smart Contract Tests](#running-smart-contract-tests)

---

## Problem Statement

The healthcare industry faces significant challenges in managing patient data securely, efficiently, and transparently. Traditional systems for storing and sharing medical records are often fragmented, leading to interoperability issues, data breaches, and privacy concerns. Patients struggle to access and control their own health information, hindering their ability to make informed decisions about their care.

This project addresses these challenges by leveraging blockchain technology to provide a secure, interoperable, and patient-centric approach to managing medical records.

**Key requirements addressed:**

- **Blockchain Integration** — Decentralized, tamper-proof ledger for recording patient health records and treatment histories.
- **Patient Control** — Patients control who can access their health data using wallet-based identity and on-chain permissions.
- **Smart Contracts** — Enforce role-based access control, consent management, and maintain an immutable audit trail.
- **Consent Management** — Patients explicitly grant and revoke access to doctors, with optional time-based expiry.

---

## Tech Stack

| Layer             | Technology                                           |
| ----------------- | ---------------------------------------------------- |
| Smart Contracts   | Solidity ^0.8.19, Hardhat v2 (local node, Chain ID 31337) |
| Frontend          | React 19 (Vite), Tailwind CSS v4, React Router v7   |
| Web3 Integration  | ethers.js v5, MetaMask (wallet = identity)           |
| Off-chain Storage | IPFS via Pinata (files uploaded to Pinata, CID stored on-chain) |
| Testing           | Hardhat + Chai + Mocha (20 unit tests)               |

---

## Project Structure

```
mini-project/
├── blockchain/
│   ├── contracts/
│   │   ├── RoleManager.sol          # Role assignment (admin, doctor, patient)
│   │   ├── AccessControl.sol        # Patient consent & access grants
│   │   ├── RecordStorage.sol        # Medical record metadata + IPFS hash
│   │   └── AuditTrail.sol           # Immutable action log
│   ├── scripts/
│   │   └── deploy.js                # Deployment script for all 4 contracts
│   ├── test/
│   │   ├── RoleManager.test.js      # 6 tests
│   │   ├── AuditTrail.test.js       # 3 tests
│   │   ├── AccessControl.test.js    # 6 tests
│   │   └── RecordStorage.test.js    # 5 tests
│   └── hardhat.config.js
│
├── frontend/
│   ├── .env.example                 # Pinata API key template
│   └── src/
│       ├── abis/                    # Contract ABI JSONs (copied from artifacts)
│       ├── config/
│       │   ├── contracts.js         # Deployed contract addresses
│       │   └── pinata.js            # Pinata env var config
│       ├── context/
│       │   └── Web3Context.jsx      # Provider, signer, account, role, contracts
│       ├── pages/
│       │   ├── Landing.jsx          # Connect wallet + register as patient
│       │   ├── AdminDashboard.jsx   # Register doctors, system stats
│       │   ├── DoctorDashboard.jsx  # Patient list, create/view records
│       │   └── PatientDashboard.jsx # My records, manage access, audit log
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx       # Top navigation with role display
│       │   │   └── RoleGuard.jsx    # Route protection by role
│       │   ├── admin/
│       │   │   ├── RegisterDoctor.jsx
│       │   │   └── SystemStats.jsx
│       │   ├── doctor/
│       │   │   ├── PatientList.jsx
│       │   │   ├── CreateRecord.jsx
│       │   │   └── ViewRecords.jsx
│       │   ├── patient/
│       │   │   ├── MyRecords.jsx
│       │   │   ├── ManageAccess.jsx
│       │   │   └── GrantAccess.jsx
│       │   └── shared/
│       │       ├── AuditLog.jsx
│       │       ├── FileUpload.jsx
│       │       ├── RecordCard.jsx
│       │       └── ConnectWallet.jsx
│       └── utils/
│           └── ipfs.js              # Pinata upload & gateway helpers
│
└── README.md
```

---

## Smart Contract Architecture

### 1. RoleManager.sol

Manages three roles: **Admin**, **Doctor**, and **Patient**.

- The deployer wallet is automatically assigned the Admin role.
- `registerDoctor(address)` — Admin-only function to register a new doctor.
- `registerPatient()` — Any unregistered address can self-register as a patient.
- Maintains on-chain `doctorList[]` and `patientList[]` arrays with getter functions.
- Emits `DoctorRegistered` and `PatientRegistered` events.

### 2. AuditTrail.sol

Immutable log of all system actions.

- Action types: `DOCTOR_REGISTERED`, `PATIENT_REGISTERED`, `ACCESS_GRANTED`, `ACCESS_REVOKED`, `RECORD_CREATED`, `RECORD_VIEWED`.
- Each entry stores: `id`, `actionType`, `performer`, `subject`, `details`, `timestamp`.
- `log(actionType, performer, subject, details)` — Called by other contracts after state changes.
- `getUserAuditIds(address)` — Returns all audit entry IDs involving a given address.

### 3. AccessControl.sol

Patient-controlled consent management. Depends on RoleManager and AuditTrail.

- `grantAccess(doctor, durationSeconds)` — Patient grants a doctor access. Pass `0` for permanent access.
- `revokeAccess(doctor)` — Patient revokes a doctor's access.
- `hasAccess(patient, doctor)` — View function that checks both grant status and expiry.
- Tracks bidirectional relationships: `patientDoctors[]` and `doctorPatients[]`.
- Logs all grant/revoke actions to AuditTrail.

### 4. RecordStorage.sol

Medical record storage. Depends on RoleManager, AccessControl, and AuditTrail.

- Each record stores: `id`, `patient`, `doctor`, `diagnosis`, `prescription`, `notes`, `ipfsHash`, `createdAt`.
- `createRecord(patient, diagnosis, prescription, notes, ipfsHash)` — Doctor-only, requires active access to the patient.
- `getPatientRecordIds(patient)` — Returns all record IDs for a patient.
- Logs record creation to AuditTrail.

### Deploy Order

1. **RoleManager** (no dependencies)
2. **AuditTrail** (no dependencies)
3. **AccessControl** (requires RoleManager + AuditTrail addresses)
4. **RecordStorage** (requires RoleManager + AccessControl + AuditTrail addresses)

---

## Frontend Architecture

### Routing

| Route      | Page              | Access     |
| ---------- | ----------------- | ---------- |
| `/`        | Landing           | Public     |
| `/admin`   | AdminDashboard    | Admin only |
| `/doctor`  | DoctorDashboard   | Doctor only|
| `/patient` | PatientDashboard  | Patient only|

Routes are protected by the `RoleGuard` component which checks the connected wallet's on-chain role.

### Web3Context

A single React Context provides the entire app with: `account`, `role`, `contracts` (ethers.js Contract instances), `provider`, `signer`, `connectWallet()`, and `refreshRole()`. It also listens for MetaMask account changes and automatically updates state.

### IPFS Flow

1. Doctor uploads a file in the CreateRecord form.
2. `utils/ipfs.js` POSTs the file to Pinata's `pinFileToIPFS` API.
3. Pinata returns a CID (Content Identifier) string.
4. The CID is passed to `recordStorage.createRecord(...)` and stored on-chain.
5. When viewing records, a "View File" link opens `https://gateway.pinata.cloud/ipfs/{cid}`.

---

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v18 or later) — [https://nodejs.org/](https://nodejs.org/)
2. **MetaMask** browser extension — [https://metamask.io/](https://metamask.io/)
3. **Git** (optional, for cloning)

---

## Installation

### 1. Clone / navigate to the project

```bash
cd mini-project
```

### 2. Install blockchain dependencies

```bash
cd blockchain
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Project

You need **three terminal windows** running simultaneously:

### Terminal 1 — Start the local Hardhat blockchain node

```bash
cd blockchain
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with Chain ID `31337`. It will print **20 test accounts** with their private keys — you will need these for MetaMask.

> **Keep this terminal running** the entire time. If you close it, the blockchain state is lost.

### Terminal 2 — Deploy the smart contracts

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

This will print output like:

```
Deploying contracts with: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
RoleManager deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
AuditTrail deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
AccessControl deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
RecordStorage deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

**Important:** Copy these addresses into `frontend/src/config/contracts.js`:

```js
const CONTRACT_ADDRESSES = {
  ROLE_MANAGER: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  AUDIT_TRAIL: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  ACCESS_CONTROL: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  RECORD_STORAGE: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};
```

> The default addresses in the file should match if this is a fresh deploy. Update them only if they differ.

### Terminal 3 — Start the frontend dev server

```bash
cd frontend
npm run dev
```

Open the URL shown (usually `http://localhost:5173`) in a browser with MetaMask installed.

---

## MetaMask Setup

### Add the Hardhat local network

1. Open MetaMask and click the network dropdown at the top.
2. Click **"Add Network"** > **"Add a network manually"**.
3. Enter the following:

| Field            | Value                      |
| ---------------- | -------------------------- |
| Network Name     | Hardhat Local              |
| New RPC URL      | `http://127.0.0.1:8545`   |
| Chain ID         | `31337`                    |
| Currency Symbol  | ETH                        |

4. Click **Save** and switch to the Hardhat Local network.

### Import test accounts

When you ran `npx hardhat node` in Terminal 1, it printed 20 accounts with private keys. You need to import at least 3 accounts into MetaMask:

- **Account #0** — This is the **Admin** (contract deployer).
- **Account #1** — Use this as a **Doctor** (admin will register it).
- **Account #2** — Use this as a **Patient** (self-registers on the landing page).

To import each account:

1. In MetaMask, click the account icon > **"Import Account"**.
2. Select **"Private Key"** and paste the private key from the Hardhat node output.
3. Click **Import**.

> **Note:** These are test accounts with fake ETH. Never use these private keys on a real network.

---

## IPFS / Pinata Setup

File attachments on medical records are uploaded to IPFS via Pinata. This is **optional** — records can be created without file attachments.

### To enable file uploads:

1. Create a free account at [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. Go to **API Keys** and create a new key.
3. Create a `.env` file in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env
```

4. Fill in your keys:

```
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_API_SECRET=your_api_secret_here
```

5. Restart the frontend dev server for the env vars to take effect.

---

## End-to-End Test Flow

Follow these steps to verify the full system works:

| Step | Actor   | Action                                           | Expected Result                                     |
| ---- | ------- | ------------------------------------------------ | --------------------------------------------------- |
| 1    | Admin   | Connect wallet (Account #0) on landing page      | Auto-detects Admin role, redirects to `/admin`       |
| 2    | Admin   | Paste Account #1 address, click "Register Doctor"| Transaction succeeds, doctor count shows 1           |
| 3    | Patient | Switch to Account #2 in MetaMask                 | Landing page shows "Register as Patient" button      |
| 4    | Patient | Click "Register as Patient"                      | Transaction succeeds, redirects to `/patient`        |
| 5    | Patient | Paste Account #1 (doctor) address, grant access (duration: 0 for permanent) | Doctor appears in "My Doctors" list |
| 6    | Doctor  | Switch to Account #1 in MetaMask                 | Redirects to `/doctor`, sees patient in "My Patients"|
| 7    | Doctor  | Select patient, fill diagnosis/prescription, optionally attach a file, click "Create Record" | File uploads to Pinata (if attached), transaction succeeds |
| 8    | Patient | Switch to Account #2, go to `/patient`           | Record visible under "My Medical Records" with "View File" link |
| 9    | Patient | Scroll to "My Audit Log"                         | Shows all actions: registration, access grant, record creation |
| 10   | Patient | Click "Revoke" next to the doctor                | Doctor removed from list, doctor can no longer create records |

---

## Running Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

This runs all 20 unit tests across the 4 contracts:

```
  AccessControl (6 tests)
    ✔ should allow patient to grant access to doctor
    ✔ should allow patient to revoke access
    ✔ should not allow non-patient to grant access
    ✔ should not allow granting access to non-doctor
    ✔ should track patient-doctor relationships
    ✔ should handle timed access expiry

  AuditTrail (3 tests)
    ✔ should log an audit entry
    ✔ should track entries per user
    ✔ should return total entries

  RecordStorage (5 tests)
    ✔ should allow doctor to create a record
    ✔ should not allow doctor without access to create record
    ✔ should not allow non-doctor to create record
    ✔ should track patient record IDs
    ✔ should return total records

  RoleManager (6 tests)
    ✔ should set deployer as admin
    ✔ should allow admin to register a doctor
    ✔ should allow anyone to register as patient
    ✔ should not allow non-admin to register doctor
    ✔ should not allow double registration
    ✔ should return doctor and patient lists

  20 passing
```
