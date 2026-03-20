import { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";

export default function GrantAccess({ onGranted }) {
  const { contracts } = useWeb3();
  const [doctorAddr, setDoctorAddr] = useState("");
  const [duration, setDuration] = useState("0");
  const [status, setStatus] = useState("");

  const handleGrant = async (e) => {
    e.preventDefault();
    setStatus("pending");
    try {
      const tx = await contracts.accessControl.grantAccess(doctorAddr, duration);
      await tx.wait();
      setStatus("success");
      setDoctorAddr("");
      onGranted?.();
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      alert(err?.reason || err?.data?.message || "Failed to grant access");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-lg">
          🔓
        </div>
        <h2 className="text-lg font-bold text-gray-800">Grant Access</h2>
      </div>
      <form onSubmit={handleGrant} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Doctor's Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={doctorAddr}
            onChange={(e) => setDoctorAddr(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-white"
          >
            <option value="0">Permanent</option>
            <option value="3600">1 Hour</option>
            <option value="86400">1 Day</option>
            <option value="604800">1 Week</option>
            <option value="2592000">30 Days</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={status === "pending"}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "pending" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Granting...
            </span>
          ) : (
            "Grant Access"
          )}
        </button>
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl animate-slide-down">
            Access granted successfully!
          </div>
        )}
      </form>
    </div>
  );
}
