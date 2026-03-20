import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";

export default function ManageAccess() {
  const { account, contracts } = useWeb3();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const loadDoctors = async () => {
    if (!contracts || !account) return;
    setLoading(true);
    try {
      const list = await contracts.accessControl.getPatientDoctors(account);
      setDoctors([...list]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, [contracts, account]);

  const handleRevoke = async (doctor) => {
    setRevoking(doctor);
    try {
      const tx = await contracts.accessControl.revokeAccess(doctor);
      await tx.wait();
      await loadDoctors();
    } catch (err) {
      console.error(err);
      alert(err?.reason || err?.data?.message || "Failed to revoke access");
    }
    setRevoking(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-lg">
          🩺
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">My Doctors</h2>
          <p className="text-xs text-gray-400">{doctors.length} doctor(s) have access</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl block mb-2">🔒</span>
          <p className="text-gray-400 text-sm">No doctors have access to your records.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doc) => (
            <li
              key={doc}
              className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                  Dr
                </div>
                <span className="font-mono text-sm text-gray-700">
                  {doc.slice(0, 6)}...{doc.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => handleRevoke(doc)}
                disabled={revoking === doc}
                className="text-red-500 hover:text-white hover:bg-red-500 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-500 transition-all disabled:opacity-50"
              >
                {revoking === doc ? "Revoking..." : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
