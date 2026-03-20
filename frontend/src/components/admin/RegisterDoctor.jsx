import { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";

export default function RegisterDoctor() {
  const { contracts } = useWeb3();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("pending");
    try {
      const tx = await contracts.roleManager.registerDoctor(address);
      await tx.wait();
      setStatus("success");
      setAddress("");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      alert(err?.reason || err?.data?.message || "Failed to register doctor");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg">
          👨‍⚕️
        </div>
        <h2 className="text-lg font-bold text-gray-800">Register Doctor</h2>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Doctor's Ethereum Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === "pending"}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "pending" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registering...
            </span>
          ) : (
            "Register Doctor"
          )}
        </button>
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl animate-slide-down">
            Doctor registered successfully!
          </div>
        )}
      </form>
    </div>
  );
}
