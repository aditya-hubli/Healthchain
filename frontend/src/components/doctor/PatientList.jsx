import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";

export default function PatientList({ onSelectPatient, selected }) {
  const { account, contracts } = useWeb3();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contracts || !account) return;
    const load = async () => {
      try {
        const list = await contracts.accessControl.getDoctorPatients(account);
        setPatients([...list]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [contracts, account]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-lg">
          👥
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">My Patients</h2>
          <p className="text-xs text-gray-400">{patients.length} patient(s)</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl block mb-2">🔒</span>
          <p className="text-gray-400 text-sm">No patients have granted you access yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {patients.map((p) => (
            <li key={p}>
              <button
                onClick={() => onSelectPatient(p)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-mono transition-all ${
                  selected === p
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selected === p
                        ? "bg-white/20 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    Pt
                  </div>
                  {p.slice(0, 6)}...{p.slice(-4)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
