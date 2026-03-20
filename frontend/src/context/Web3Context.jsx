import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import CONTRACT_ADDRESSES from "../config/contracts";
import RoleManagerABI from "../abis/RoleManager.json";
import AuditTrailABI from "../abis/AuditTrail.json";
import AccessControlABI from "../abis/AccessControl.json";
import RecordStorageABI from "../abis/RecordStorage.json";

const Web3Context = createContext(null);

const ROLE_NAMES = { 0: "none", 1: "admin", 2: "doctor", 3: "patient" };

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [loading, setLoading] = useState(true);

  const setupAccount = useCallback(async (ethereum) => {
    try {
      const prov = new ethers.providers.Web3Provider(ethereum);
      const sign = prov.getSigner();
      const addr = await sign.getAddress();

      const c = {
        roleManager: new ethers.Contract(CONTRACT_ADDRESSES.ROLE_MANAGER, RoleManagerABI.abi, sign),
        auditTrail: new ethers.Contract(CONTRACT_ADDRESSES.AUDIT_TRAIL, AuditTrailABI.abi, sign),
        accessControl: new ethers.Contract(CONTRACT_ADDRESSES.ACCESS_CONTROL, AccessControlABI.abi, sign),
        recordStorage: new ethers.Contract(CONTRACT_ADDRESSES.RECORD_STORAGE, RecordStorageABI.abi, sign),
      };

      const r = await c.roleManager.getRole(addr);

      setProvider(prov);
      setSigner(sign);
      setAccount(addr.toLowerCase());
      setContracts(c);
      setRole(ROLE_NAMES[Number(r)]);
      return { addr: addr.toLowerCase(), role: ROLE_NAMES[Number(r)] };
    } catch (err) {
      console.error("Setup failed:", err);
      setAccount(null);
      setRole(null);
      setContracts(null);
      return null;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }
    setLoading(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const result = await setupAccount(window.ethereum);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Connection failed:", err);
      setLoading(false);
      return null;
    }
  }, [setupAccount]);

  const refreshRole = useCallback(async () => {
    if (!window.ethereum || !account) return;
    await setupAccount(window.ethereum);
  }, [account, setupAccount]);

  // Auto-connect on mount if already authorized
  useEffect(() => {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          await setupAccount(window.ethereum);
        }
      } catch (err) {
        console.error("Auto-connect failed:", err);
      }
      setLoading(false);
    })();
  }, [setupAccount]);

  // Listen for account & chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setRole(null);
        setContracts(null);
        setProvider(null);
        setSigner(null);
        return;
      }
      await setupAccount(window.ethereum);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [setupAccount]);

  return (
    <Web3Context.Provider
      value={{ account, role, contracts, provider, signer, connectWallet, refreshRole, loading }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
