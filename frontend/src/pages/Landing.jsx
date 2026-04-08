import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useWeb3 } from "../context/Web3Context";

export default function Landing() {
  const { account, role, contracts, refreshRole, connectWallet, loading } = useWeb3();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (role && role !== "none") {
      navigate(`/${role}`, { replace: true });
    }
  }, [role, navigate]);

  const handleRegisterPatient = async () => {
    setRegistering(true);
    const tid = toast.loading("Registering as patient...");
    try {
      const tx = await contracts.roleManager.registerPatient();
      await tx.wait();
      await refreshRole();
      toast.success("Welcome aboard!", { id: tid });
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err?.reason || err?.data?.message || "Registration failed", { id: tid });
    }
    setRegistering(false);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl text-center animate-fade-in">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto mb-8">
          H
        </div>

        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-emerald-800 bg-clip-text text-transparent leading-tight">
          Healthcare on the Blockchain
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
          Secure, decentralized medical records. Patients control their data.
          Doctors create records with consent. Everything verified on-chain.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: "🔒", text: "Patient-Controlled Access" },
            { icon: "📋", text: "On-Chain Records" },
            { icon: "🔍", text: "Immutable Audit Trail" },
            { icon: "📁", text: "IPFS File Storage" },
          ].map((f) => (
            <span
              key={f.text}
              className="bg-white px-4 py-2 rounded-full text-sm text-gray-600 shadow-sm border border-gray-100"
            >
              {f.icon} {f.text}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Detecting wallet...</p>
          </div>
        ) : !account ? (
          <div className="space-y-4">
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Connect MetaMask
            </button>
            <p className="text-sm text-gray-400">
              Connect your wallet to get started
            </p>
          </div>
        ) : role === "none" ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto animate-slide-down">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
              👋
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-500 text-sm mb-1">Connected as</p>
            <p className="font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-lg inline-block mb-6 text-gray-700">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button
              onClick={handleRegisterPatient}
              disabled={registering}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register as Patient"
              )}
            </button>
            <p className="mt-4 text-xs text-gray-400">
              Doctors are registered by the system administrator.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
